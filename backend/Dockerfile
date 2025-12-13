# 1. Use a lightweight Python version (Linux-based)
FROM python:3.10-slim

# 2. Set the folder inside the server where your app will live
WORKDIR /code

# 3. Install system tools (Git is required for some Python packages)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

# 4. Copy the requirements file first (to speed up re-deployments)
COPY requirements.txt .

# 5. Install your Python libraries
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of your backend code into the container
COPY . .

# 7. Open port 8000 (The default FastAPI port)
EXPOSE 8000

# 8. Run the application
# "app.main:app" tells it to look in the 'app' folder, 'main.py' file, for the 'app' object
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]