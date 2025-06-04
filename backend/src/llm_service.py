import os
import re
import asyncio
from typing import List, Dict, Optional
import httpx
import openai
import anthropic

class LLMService:
    @staticmethod
    def get_config() -> Dict:
        """Environment-based LLM configuration"""
        return {
            "provider": os.getenv("LLM_PROVIDER", "mock"),
            "openai_api_key": os.getenv("OPENAI_API_KEY"),
            "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
            "ollama_base_url": os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        }
    
    @staticmethod
    def create_prompt(topic: str) -> str:
        return f"""You are helping create a crossword puzzle. Generate exactly 30 words with clues related to the topic "{topic}".

Requirements:
- Words should be 3-15 letters long
- Use common English words that most people would know
- Choose words with good crossword potential (mix of vowels and consonants)
- Avoid proper nouns, acronyms, or very technical terms
- Create concise, clear clues for each word (10-50 characters)
- Return ONLY in CSV format: WORD,CLUE
- No explanations, headers, or extra text

Example Input: "Basketball"
Example Output:
BASKETBALL,Sport played with a ball and hoop
PLAYER,Person on the team
COURT,Playing surface
HOOP,Target for shooting
DUNK,Powerful downward shot

Now generate 30 words for the topic: "{topic}"
"""

    @staticmethod
    async def generate_words_and_clues_from_topic(topic: str) -> List[Dict[str, str]]:
        """Generate 30 words with clues in CSV format"""
        config = LLMService.get_config()
        
        try:
            if config["provider"] == "openai" and config["openai_api_key"]:
                return await LLMService._call_openai(topic, config)
            elif config["provider"] == "anthropic" and config["anthropic_api_key"]:
                return await LLMService._call_anthropic(topic, config)
            elif config["provider"] == "ollama":
                return await LLMService._call_ollama(topic, config)
        except Exception as e:
            print(f"LLM call failed: {e}")
        
        # Fallback to mock data
        return LLMService._get_mock_words(topic)
    
    @staticmethod
    async def _call_openai(topic: str, config: Dict) -> List[Dict[str, str]]:
        """OpenAI API integration"""
        client = openai.AsyncOpenAI(api_key=config["openai_api_key"])
        
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": LLMService.create_prompt(topic)}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        return LLMService._parse_csv_response(content)
    
    @staticmethod
    async def _call_anthropic(topic: str, config: Dict) -> List[Dict[str, str]]:
        """Anthropic API integration"""
        client = anthropic.AsyncAnthropic(api_key=config["anthropic_api_key"])
        
        response = await client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=2000,
            temperature=0.7,
            messages=[
                {"role": "user", "content": LLMService.create_prompt(topic)}
            ]
        )
        
        content = response.content[0].text
        return LLMService._parse_csv_response(content)
    
    @staticmethod
    async def _call_ollama(topic: str, config: Dict) -> List[Dict[str, str]]:
        """Ollama API integration"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{config['ollama_base_url']}/api/generate",
                json={
                    "model": "llama2",
                    "prompt": LLMService.create_prompt(topic),
                    "stream": False
                }
            )
            response.raise_for_status()
            
            content = response.json().get("response", "")
            return LLMService._parse_csv_response(content)
    
    @staticmethod
    def _parse_csv_response(content: str) -> List[Dict[str, str]]:
        """Parse CSV format response from LLM"""
        words_and_clues = []
        lines = content.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if ',' in line and not line.startswith('#'):
                parts = line.split(',', 1)
                if len(parts) == 2:
                    word = parts[0].strip().upper()
                    clue = parts[1].strip()
                    
                    # Validate word
                    if 3 <= len(word) <= 15 and word.isalpha():
                        words_and_clues.append({
                            "word": word,
                            "clue": clue
                        })
        
        # Ensure we have enough words, pad with mock if needed
        if len(words_and_clues) < 20:
            mock_words = LLMService._get_mock_words("general")
            words_and_clues.extend(mock_words[:30 - len(words_and_clues)])
        
        return words_and_clues[:30]
    
    @staticmethod
    def _get_mock_words(topic: str) -> List[Dict[str, str]]:
        """Comprehensive fallback with topic-specific data"""
        
        topic_words = {
            "basketball": [
                {"word": "BASKETBALL", "clue": "Sport with hoops and dribbling"},
                {"word": "COURT", "clue": "Playing surface"},
                {"word": "HOOP", "clue": "Target for shooting"},
                {"word": "DUNK", "clue": "Powerful downward shot"},
                {"word": "PLAYER", "clue": "Team member"},
                {"word": "COACH", "clue": "Team leader and strategist"},
                {"word": "REFEREE", "clue": "Game official"},
                {"word": "FOUL", "clue": "Rule violation"},
                {"word": "POINT", "clue": "Score unit"},
                {"word": "SHOT", "clue": "Attempt to score"},
            ],
            "movies": [
                {"word": "MOVIE", "clue": "Film or cinema production"},
                {"word": "ACTOR", "clue": "Performer in films"},
                {"word": "DIRECTOR", "clue": "Film creator and guide"},
                {"word": "SCRIPT", "clue": "Written dialogue and actions"},
                {"word": "SCENE", "clue": "Single sequence in a film"},
                {"word": "CAMERA", "clue": "Recording device"},
                {"word": "ACTION", "clue": "Director's command to start"},
                {"word": "DRAMA", "clue": "Serious film genre"},
                {"word": "COMEDY", "clue": "Humorous film genre"},
                {"word": "TICKET", "clue": "Cinema admission pass"},
            ],
            "technology": [
                {"word": "COMPUTER", "clue": "Electronic processing device"},
                {"word": "SOFTWARE", "clue": "Computer programs"},
                {"word": "INTERNET", "clue": "Global network"},
                {"word": "WEBSITE", "clue": "Online destination"},
                {"word": "DATABASE", "clue": "Information storage system"},
                {"word": "ALGORITHM", "clue": "Problem-solving procedure"},
                {"word": "PYTHON", "clue": "Programming language"},
                {"word": "CODE", "clue": "Programming instructions"},
                {"word": "DEBUG", "clue": "Fix programming errors"},
                {"word": "SERVER", "clue": "Network host computer"},
            ]
        }
        
        # Default general words
        general_words = [
            {"word": "WORD", "clue": "Unit of language"},
            {"word": "PUZZLE", "clue": "Brain teaser game"},
            {"word": "CROSS", "clue": "Intersection point"},
            {"word": "GRID", "clue": "Pattern of squares"},
            {"word": "CLUE", "clue": "Helpful hint"},
            {"word": "ANSWER", "clue": "Correct response"},
            {"word": "LETTER", "clue": "Alphabet character"},
            {"word": "BLACK", "clue": "Darkest color"},
            {"word": "WHITE", "clue": "Lightest color"},
            {"word": "SQUARE", "clue": "Four-sided shape"},
            {"word": "NUMBER", "clue": "Counting digit"},
            {"word": "ACROSS", "clue": "Horizontal direction"},
            {"word": "DOWN", "clue": "Vertical direction"},
            {"word": "GAME", "clue": "Recreational activity"},
            {"word": "FUN", "clue": "Enjoyable experience"},
            {"word": "SMART", "clue": "Intelligent"},
            {"word": "THINK", "clue": "Use your mind"},
            {"word": "BRAIN", "clue": "Thinking organ"},
            {"word": "SOLVE", "clue": "Find the answer"},
            {"word": "CHALLENGE", "clue": "Difficult task"},
            {"word": "LOGIC", "clue": "Reasoning process"},
            {"word": "PATTERN", "clue": "Repeated design"},
            {"word": "FILL", "clue": "Complete spaces"},
            {"word": "EMPTY", "clue": "Nothing inside"},
            {"word": "START", "clue": "Begin something"},
            {"word": "FINISH", "clue": "Complete something"},
            {"word": "TIME", "clue": "Duration measure"},
            {"word": "SPACE", "clue": "Empty area"},
            {"word": "PLACE", "clue": "Put in position"},
            {"word": "FIND", "clue": "Discover something"}
        ]
        
        # Get topic-specific words or use general
        topic_key = topic.lower()
        if topic_key in topic_words:
            words = topic_words[topic_key] + general_words
        else:
            words = general_words
        
        return words[:30]