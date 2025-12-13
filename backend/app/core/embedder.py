from sentence_transformers import SentenceTransformer
import numpy as np

class Embedder:
    def __init__(self):
        print("Loading Embedding Model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def embed_text(self, text: str) -> np.ndarray:
        vector = self.model.encode(text)
        return np.array(vector).astype("float32")

embedder = Embedder()