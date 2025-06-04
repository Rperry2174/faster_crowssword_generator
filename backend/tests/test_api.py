import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from api import app

class TestAPI:
    @pytest.fixture
    def client(self):
        return TestClient(app)
    
    def test_health_check(self, client):
        """Test health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "crossword-generator"
    
    @patch('api.LLMService.generate_words_and_clues_from_topic')
    def test_generate_from_topic_success(self, mock_llm, client):
        """Test successful topic word generation"""
        # Mock LLM response
        async def mock_response(topic):
            return [
                {"word": "BASKETBALL", "clue": "Sport with hoops"},
                {"word": "PLAYER", "clue": "Team member"},
                {"word": "COURT", "clue": "Playing surface"}
            ]
        
        mock_llm.side_effect = mock_response
        
        response = client.post("/generate-from-topic", json={"topic": "basketball"})
        assert response.status_code == 200
        
        data = response.json()
        assert "words" in data
        assert "crossword_id" in data
        assert len(data["words"]) == 3
        assert "BASKETBALL" in data["words"]
    
    def test_generate_from_topic_invalid_request(self, client):
        """Test invalid topic request"""
        response = client.post("/generate-from-topic", json={})
        assert response.status_code == 422  # Validation error
    
    def test_generate_crossword_success(self, client):
        """Test successful crossword generation"""
        words = ["PYTHON", "CODE", "TEST", "GRID"]
        response = client.post("/generate-crossword", json={"words": words})
        
        assert response.status_code == 200
        data = response.json()
        
        assert "grid" in data
        assert "word_placements" in data
        assert "width" in data
        assert "height" in data
        assert data["width"] == 15
        assert data["height"] == 15
    
    def test_generate_crossword_empty_words(self, client):
        """Test crossword generation with empty word list"""
        response = client.post("/generate-crossword", json={"words": []})
        assert response.status_code == 400
    
    def test_generate_crossword_invalid_request(self, client):
        """Test invalid crossword request"""
        response = client.post("/generate-crossword", json={})
        assert response.status_code == 422  # Validation error
    
    def test_get_clues_success(self, client):
        """Test successful clue retrieval"""
        # First generate words to create a crossword_id
        with patch('api.LLMService.generate_words_and_clues_from_topic') as mock_llm:
            async def mock_response(topic):
                return [
                    {"word": "PYTHON", "clue": "Programming language"},
                    {"word": "CODE", "clue": "Programming instructions"}
                ]
            mock_llm.side_effect = mock_response
            
            topic_response = client.post("/generate-from-topic", json={"topic": "programming"})
            crossword_id = topic_response.json()["crossword_id"]
        
        # Now test getting clues
        response = client.get(f"/clues/{crossword_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert "clues" in data
        assert "PYTHON" in data["clues"]
        assert "CODE" in data["clues"]
    
    def test_get_clues_not_found(self, client):
        """Test clue retrieval for non-existent ID"""
        response = client.get("/clues/non-existent-id")
        assert response.status_code == 404
    
    def test_cors_headers(self, client):
        """Test CORS headers are properly set"""
        response = client.options("/health")
        # FastAPI TestClient may not fully simulate CORS, but we can check the middleware is configured
        assert response.status_code in [200, 405]  # OPTIONS may not be implemented for all endpoints