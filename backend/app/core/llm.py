# llm.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("❌ GEMINI_API_KEY not found in .env file")
            
        genai.configure(api_key=api_key)
        # Using 1.5-flash for speed/cost, or 1.5-pro for better reasoning
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_answer(self, context: str, question: str) -> str:
        prompt = f"""
        You are an expert Senior Software Engineer and Codebase Assistant.
        Your task is to answer the user's question accurately based **ONLY** on the provided code context.

        ### FORMATTING GUIDELINES (Strictly Follow These):
        1. **Structure:**
           - Start with a clear, direct answer or summary.
           - If explaining logic, break it down into bullet points.
           - End with a brief concluding remark if necessary.
        
        2. **Code Styling:**
           - ALWAYS use correct syntax highlighting for code blocks (e.g., ```typescript, ```python).
           - Use `inline code` (backticks) for function names, variable names, file paths, and library names.
           - Keep code snippets concise; show only the relevant parts.

        3. **Tone:**
           - Professional, technical, yet helpful.
           - Avoid filler phrases like "Here is the answer." Just dive into the explanation.

        4. **References:**
           - Mention specific file names from the context when explaining logic (e.g., "As seen in `src/auth/handler.ts`...").

        ### CONTEXT:
        {context}
        
        ### QUESTION:
        {question}

        ### ANSWER (in clean Markdown):
        """
        
        try:
            # We assume a clean response is desired
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"**Error generating answer:** {str(e)}"

llm_client = LLMClient()