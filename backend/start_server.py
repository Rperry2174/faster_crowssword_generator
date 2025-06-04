import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

if __name__ == "__main__":
    import uvicorn
    from api import app
    
    uvicorn.run(app, host="0.0.0.0", port=8000)