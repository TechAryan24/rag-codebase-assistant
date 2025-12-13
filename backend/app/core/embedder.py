from fastembed import TextEmbedding
import numpy as np

class Embedder:
    def __init__(self):
        print("Loading FastEmbed Model...")
        # 1. Use the EXACT same model name so dimensions (384) stay the same.
        # This runs on ONNX Runtime (Lightweight) instead of PyTorch.
        self.model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

    def embed_text(self, text: str) -> np.ndarray:
        # 2. FastEmbed expects a list of documents and returns a generator.
        # We pass a list with 1 item: [text]
        embeddings_generator = self.model.embed([text])
        
        # 3. Consume the generator to get the first vector
        vector = list(embeddings_generator)[0]
        
        return vector.astype("float32")

embedder = Embedder()