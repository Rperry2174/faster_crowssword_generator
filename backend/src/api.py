import uuid
from typing import Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    TopicRequest, WordListRequest, TopicWordsResponse, 
    CrosswordResponse, CluesResponse, Direction
)
from crossword_generator import CrosswordGenerator
from llm_service import LLMService

app = FastAPI(title="Crossword Generator API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage with UUIDs
clue_storage: Dict[str, Dict[str, str]] = {}

@app.get("/health")
async def health_check():
    """Health check for monitoring"""
    return {"status": "healthy", "service": "crossword-generator"}

@app.post("/generate-from-topic", response_model=TopicWordsResponse)
async def generate_words_from_topic(request: TopicRequest):
    """Generate words and clues, store session data"""
    try:
        # Generate words and clues from LLM
        word_clue_data = await LLMService.generate_words_and_clues_from_topic(request.topic)
        
        # Store clues with session ID
        crossword_id = str(uuid.uuid4())
        clue_storage[crossword_id] = {item['word']: item['clue'] for item in word_clue_data}
        
        # Return just the words for crossword generation
        words = [item['word'] for item in word_clue_data]
        
        return TopicWordsResponse(
            words=words,
            crossword_id=crossword_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate words: {str(e)}")

@app.post("/generate-crossword", response_model=CrosswordResponse) 
async def generate_crossword(request: WordListRequest):
    """Create crossword from word list"""
    try:
        if not request.words:
            raise HTTPException(status_code=400, detail="No words provided")
        
        # Generate crossword
        generator = CrosswordGenerator(request.words)
        crossword_grid = generator.generate_crossword()
        
        # Convert word placements to serializable format
        word_placements_dict = []
        for wp in crossword_grid.word_placements:
            word_placements_dict.append({
                "word": wp.word,
                "start_row": wp.start_row,
                "start_col": wp.start_col,
                "direction": wp.direction.value,
                "clue": wp.clue,
                "number": wp.number
            })
        
        return CrosswordResponse(
            grid=crossword_grid.grid,
            word_placements=word_placements_dict,
            width=crossword_grid.width,
            height=crossword_grid.height
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate crossword: {str(e)}")

@app.get("/clues/{crossword_id}", response_model=CluesResponse)
async def get_clues(crossword_id: str):
    """Retrieve stored clues by session ID"""
    if crossword_id not in clue_storage:
        raise HTTPException(status_code=404, detail="Crossword ID not found")
    
    return CluesResponse(clues=clue_storage[crossword_id])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)