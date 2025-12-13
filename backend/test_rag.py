import sys
import os
import numpy as np
from sqlmodel import Session, select

# Setup path to import app modules
sys.path.append(os.getcwd())

from app.core.embedder import embedder
from app.core.vector_store import vector_db
from app.db.session import init_db, engine
from app.db.models import Chunk

def run_test():
    print("--- STARTING PHASE 3 TEST ---")

    # 1. Initialize Database
    init_db()
    print("1. Database initialized.")

    # 2. Create Mock Data
    code_text = "def process_payment(amount): return api.charge(amount)"
    print(f"2. Processing text: '{code_text}'")

    # 3. Create Vector
    vector = embedder.embed_text(code_text)
    # We need a list of vectors for FAISS, so we stack it
    vectors_batch = np.vstack([vector]) 

    # 4. Add to FAISS
    start_id = vector_db.add_vectors(vectors_batch)
    vector_db.save()
    print(f"3. Added to FAISS at ID: {start_id}")

    # 5. Add to SQLite (Linking ID to ID)
    with Session(engine) as session:
        chunk = Chunk(
            id=int(start_id),  # Crucial: This links FAISS to SQL
            chunk_hash="unique_hash_123",
            file_name="payment.py",
            file_path="/src/payment.py",
            start_line=1,
            end_line=2,
            content=code_text
        )
        session.merge(chunk)
        session.commit()
    print("4. Metadata saved to SQLite.")

    # 6. Test Search
    print("5. Searching for 'charging money'...")
    query_vec = embedder.embed_text("charging money")
    distances, indices = vector_db.search(query_vec, k=1)
    found_id = indices[0][0]

    # 7. Retrieve result
    with Session(engine) as session:
        result = session.get(Chunk, int(found_id))
        print(f"\n--- RESULT ---")
        print(f"Found File: {result.file_name}")
        print(f"Found Code: {result.content}")
        print("--- PHASE 3 COMPLETE ---")

if __name__ == "__main__":
    run_test()