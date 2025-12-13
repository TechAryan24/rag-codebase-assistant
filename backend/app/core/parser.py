#parser.py
from tree_sitter_languages import get_language, get_parser

def extract_functions(code: str, filename: str):
    """
    Universal Parser.
    1. Python -> Smart AST splitting (by function).
    2. Others -> Recursive Text splitting (by chunks of ~1000 chars).
    """
    
    # --- STRATEGY 1: SMART PARSING (Python) ---
    if filename.endswith(".py"):
        try:
            language = get_language("python")
            parser = get_parser("python")
            tree = parser.parse(bytes(code, "utf8"))
            
            query_scm = """
            (function_definition
              name: (identifier) @func.name
            ) @func.def
            """
            
            query = language.query(query_scm)
            captures = query.captures(tree.root_node)
            
            results = []
            for node, tag in captures:
                if tag == "func.def":
                    func_code = node.text.decode("utf8")
                    name_node = node.child_by_field_name("name")
                    func_name = name_node.text.decode("utf8") if name_node else "anonymous"
                    
                    results.append({
                        "name": func_name,
                        "code": func_code,
                        "start_line": node.start_point[0] + 1,
                        "end_line": node.end_point[0] + 1
                    })
            
            # If we found functions, return them.
            if results:
                return results
                
        except Exception as e:
            print(f"Smart parse failed for {filename}, switching to text chunking.")

    # --- STRATEGY 2: UNIVERSAL RECURSIVE CHUNKING ---
    # This ensures ANY file (JS, TS, HTML, CSS, TXT) is broken down 
    # into digestible pieces for the AI, preventing "context overflow".
    
    return recursive_text_chunker(code, filename)

def recursive_text_chunker(text: str, filename: str, chunk_size: int = 1000, overlap: int = 200):
    """
    Splits text into chunks of `chunk_size` characters with `overlap`.
    Tries to split on newlines first to keep code blocks together.
    """
    results = []
    start = 0
    text_len = len(text)
    
    chunk_counter = 1
    
    while start < text_len:
        # Define the hard end line
        end = start + chunk_size
        
        # If we are not at the end of text, try to find a natural break point (newline)
        if end < text_len:
            # Look for the last newline within the chunk to avoid cutting lines in half
            # We look in the last 20% of the chunk
            search_start = max(start, end - int(chunk_size * 0.2))
            last_newline = text.rfind('\n', search_start, end)
            
            if last_newline != -1:
                end = last_newline + 1 # Include the newline
        
        # Extract the chunk
        chunk_text = text[start:end]
        
        # Calculate line numbers (approximate)
        # We count how many newlines existed before this chunk
        start_line = text.count('\n', 0, start) + 1
        end_line = start_line + chunk_text.count('\n')
        
        results.append({
            "name": f"chunk_{chunk_counter}", # Generic name
            "code": chunk_text,
            "start_line": start_line,
            "end_line": end_line
        })
        
        # Move forward, but backtrack by 'overlap' to ensure context continuity
        start = end - overlap
        
        # Safety: Ensure we always move forward at least 1 character to prevent infinite loops
        if start >= end:
            start = end
            
        chunk_counter += 1
        
    return results