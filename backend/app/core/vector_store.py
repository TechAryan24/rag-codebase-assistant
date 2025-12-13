import os
import time
import numpy as np
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

class PineconeIndexWrapper:
    def __init__(self, pinecone_index):
        self._index = pinecone_index
        try:
            self._local_count = self._index.describe_index_stats().total_vector_count
        except:
            self._local_count = 0

    def __getattr__(self, name):
        return getattr(self._index, name)

    @property
    def ntotal(self):
        return self._local_count

    # 🔥 FIX: Now accepts 'metadatas' argument
    def add(self, vectors, metadatas=None):
        start_id = self._local_count
        to_upsert = []
        
        for i, vector in enumerate(vectors):
            uid = str(start_id + i)
            vec_list = vector.tolist() if hasattr(vector, 'tolist') else vector
            
            # 🔥 FIX: Attach metadata if it exists
            meta = metadatas[i] if metadatas is not None else {}
            
            # Pinecone Format: (id, vector, metadata)
            to_upsert.append((uid, vec_list, meta))
        
        batch_size = 100
        for i in range(0, len(to_upsert), batch_size):
            self._index.upsert(vectors=to_upsert[i : i + batch_size])
            
        self._local_count += len(vectors)

    def reset_tracker(self):
        self._local_count = 0


class VectorStore:
    def __init__(self, index_name: str = "codebase-rag"):
        self.dimension = 384
        self.index_name = index_name
        
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            print("⚠️ PINECONE_API_KEY missing.")
        
        print(f"🌲 Connecting to Pinecone Index: {self.index_name}")
        self.pc = Pinecone(api_key=api_key)

        existing_indexes = [i.name for i in self.pc.list_indexes()]
        if self.index_name not in existing_indexes:
            self.pc.create_index(
                name=self.index_name,
                dimension=self.dimension,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
            time.sleep(10)

        self.index = PineconeIndexWrapper(self.pc.Index(self.index_name))

    # 🔥 FIX: Added 'metadatas' parameter here too
    def add_vectors(self, vectors: np.ndarray, metadatas: list = None):
        self.index.add(vectors, metadatas)
        return self.index.ntotal

    def save(self):
        pass 

    def search(self, query_vector: np.ndarray, k: int = 5):
        query_list = query_vector.flatten().tolist()
        # 🔥 FIX: Request metadata back from Pinecone
        results = self.index.query(vector=query_list, top_k=k, include_values=False, include_metadata=True)
        
        distances = []
        indices = []
        metadatas = [] # We might need this later, but for now we stick to FAISS format
        
        for match in results['matches']:
            distances.append(match['score'])
            indices.append(int(match['id']))
            # Note: We aren't returning metadata here because rag.py likely pulls it from SQL.
            # But it's good practice to have it in Pinecone too.
            
        return np.array([distances], dtype='float32'), np.array([indices], dtype='int64')

    def reset(self):
        print("🧹 Wiping Cloud Vector Memory...")
        try:
            self.index.delete(delete_all=True)
            self.index.reset_tracker()
        except Exception as e:
            if "not found" in str(e).lower() or "404" in str(e):
                self.index.reset_tracker()
            else:
                print(f"Error resetting index: {e}")

vector_db = VectorStore()