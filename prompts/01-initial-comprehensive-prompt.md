# Comprehensive Crossword Generator Super Prompt

## Project Overview

Build a **production-ready, commercial-grade crossword puzzle generator** that demonstrates AI/LLM capabilities through an interactive web application. Users can input topics (e.g., "The Office", "Basketball", "Pixar Characters") and receive fully playable crossword puzzles with generated clues.

**Ultimate Goal**: A shareable web application that showcases how easy it is to build sophisticated projects with LLMs, deployable to production environments.

## Architecture Requirements

### Technology Stack
- **Backend**: Python with FastAPI, pipenv for package management
- **Frontend**: React with TypeScript, npm for package management
- **Deployment**: Docker containerization with docker-compose
- **Testing**: pytest for Python backend tests
- **LLM Integration**: Multi-provider support (OpenAI, Anthropic, Ollama, mock fallback)

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   LLM APIs      │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   Multi-provider│
│   Port: 3000    │    │   Port: 8000    │    │   External APIs │
│   Nginx Proxy   │    │   Python        │    │   + Local Ollama│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Critical Algorithm Requirements

### Robust Crossword Generation Engine

**Core Challenge**: Other LLMs have failed at creating valid crosswords with proper intersections. Use a methodical, test-driven approach.

#### Required Classes and Methods (Exact Signatures)
```python
# models.py
from dataclasses import dataclass
from typing import List, Optional, Tuple
from enum import Enum

class Direction(Enum):
    HORIZONTAL = "horizontal"
    VERTICAL = "vertical"

@dataclass
class WordPlacement:
    word: str
    start_row: int
    start_col: int
    direction: Direction
    clue: str = ""
    number: int = 0

@dataclass
class CrosswordGrid:
    grid: List[List[Optional[str]]]
    width: int
    height: int
    word_placements: List[WordPlacement]

# crossword_generator.py
class CrosswordGenerator:
    def __init__(self, words: List[str], grid_size: int = 15):
        """Initialize with word list and grid size"""
        
    def find_intersections(self, word1: str, word2: str) -> List[Tuple[int, int]]:
        """Find all possible intersection points between two words"""
        
    def can_place_word(self, grid: List[List[Optional[str]]], word: str, 
                      start_row: int, start_col: int, direction: Direction) -> bool:
        """Check if word can be placed WITHOUT creating invalid perpendicular words"""
        
    def place_word(self, grid: List[List[Optional[str]]], word: str,
                  start_row: int, start_col: int, direction: Direction) -> bool:
        """Place word on grid if possible"""
        
    def generate_crossword(self) -> CrosswordGrid:
        """Main algorithm - must create VALID crosswords with proper connectivity"""
```

#### Critical Validation Rules (Prevent Previous Failures)
1. **Perpendicular Word Validation**: All words formed perpendicular to placed words must be either:
   - In the original word list, OR
   - Allow maximum 1 unintended word per 5 intended words
2. **Connectivity Requirement**: All words must connect to existing crossword structure (no floating words)
3. **Word Boundary Checking**: Prevent word merging (e.g., "SMARTEST" from "SMART" + "EST")
4. **No Letter Conflicts**: Same grid position cannot have different letters
5. **Minimum Intersections**: At least 2 clear word intersections required

### CRITICAL: Valid vs Invalid Grid Examples

#### ❌ INVALID EXAMPLE (DO NOT GENERATE):
```
 0  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 1  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 2  .  .  .  .  .  .  .  .  L  .  .  .  .  .  .
 3  .  .  .  .  .  .  S  .  O  .  .  .  .  .  .
 4  .  .  .  .  .  .  M  T  G  .  .  .  .  .  .  ← INVALID: "MTG" not in word list
 5  .  .  .  .  .  .  A  E  I  .  .  .  .  .  .  ← INVALID: "AEI" not in word list
 6  .  .  .  .  .  .  R  C  C  R  O  S  S  .  .  ← INVALID: "RCCROSS" word merging
 7  .  .  .  .  P  Y  T  H  O  N  .  P  .  .  .
 8  .  B  .  .  L  .  E  .  D  A  T  A  .  .  .
 9  .  R  .  .  A  .  S  .  E  .  .  C  .  .  .
10  M  A  G  I  C  .  T  .  .  .  .  E  .  .  .
11  .  I  D  R  E  A  M  .  .  .  .  .  .  .  .  ← INVALID: "IDREAM" word merging
12  .  N  .  .  .  .  .  .  .  .  .  .  .  .  .
13  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
14  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
```

**Problems with this grid:**
- Creates invalid perpendicular words: "MTG", "AEI", "RCCROSS"
- Word merging issues: "SMARTEST", "LOGICODE", "IDREAM"
- Disconnected floating words not connected to main structure

#### ✅ VALID EXAMPLE (GOAL TO ACHIEVE):
```
 0  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 1  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 2  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 3  .  .  .  .  .  .  .  C  .  .  .  .  .  .  .
 4  .  .  .  .  .  .  .  O  .  .  .  .  .  .  .
 5  .  .  .  .  .  .  .  D  .  .  .  .  .  .  .
 6  .  .  .  .  .  .  .  E  .  .  .  .  .  .  .
 7  .  .  .  .  P  Y  T  H  O  N  .  .  .  .  .  ← PYTHON horizontal
 8  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 9  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
10  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
```

**Why this is valid:**
- PYTHON (horizontal) intersects with CODE (vertical) at the letter "O"
- No invalid perpendicular words created
- All words are from the original word list
- Proper connectivity between words
- Clean word boundaries with no merging

#### ❌ ANOTHER INVALID EXAMPLE (Disconnected words):
```
 0  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 1  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 2  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 3  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 4  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 5  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 6  .  .  .  .  .  .  C  R  O  S  S  .  .  .  .  ← CROSS floating alone
 7  .  .  .  .  P  Y  T  H  O  N  .  .  .  .  .  ← PYTHON floating alone
 8  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
 9  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
10  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
11  .  .  .  .  W  O  R  D  .  .  .  .  .  .  .  ← WORD floating alone
12  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
13  .  .  .  .  G  R  I  D  .  .  .  .  .  .  .  ← GRID floating alone
14  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
```

**Problems:**
- All words are disconnected and floating independently
- No intersections between any words
- This is NOT a valid crossword structure

## Frontend Requirements

### Modern Commercial-Grade UI/UX

**Design Standard**: Comparable to NYT Crossword, Wordle, or premium puzzle apps

#### Design System
```typescript
// Theme system with professional design tokens
const theme = {
  colors: {
    primary: '#2563eb',
    success: '#059669', 
    error: '#dc2626',
    warning: '#d97706',
    background: '#ffffff',
    surface: '#f8fafc'
  },
  typography: {
    fontFamily: 'Apple system fonts',
    fontSize: { xs: '12px', sm: '14px', base: '16px', xl: '20px' }
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  borderRadius: { sm: '6px', md: '8px', lg: '12px' },
  shadow: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)' }
}
```

#### Required Components
1. **CrosswordGrid Component**:
   - 48px cells for optimal touch targets
   - Click interaction: first click = across, second click = down
   - Sequential typing with backspace support
   - Professional highlighting (green active, blue selected word)
   - Smooth animations and hover states

2. **TabContainer Component**:
   - Topic generation (default tab)
   - Custom word input (secondary tab)
   - Pill-style modern design

3. **TopicInput Component**:
   - Single input for topics like "Basketball", "Pixar Characters"
   - Example topics displayed as clickable suggestions
   - Loading states during LLM processing

4. **ClueList Component**:
   - Numbered "Across" and "Down" sections
   - Professional typography and spacing
   - Smart clue display (actual clues vs. fallback text)

5. **Interactive Validation Features**:
   - "Check Puzzle" button (green, ✓ icon) - highlights errors in red
   - "Reveal Puzzle" button (orange, 💡 icon) - shows complete solution
   - Completion percentage display with color-coded badges

### State Management Requirements
```typescript
// App-level state
const [crossword, setCrossword] = useState<CrosswordGrid | null>(null);
const [clues, setClues] = useState<{ [word: string]: string }>({});
const [userGrid, setUserGrid] = useState<string[][]>([]);
const [currentCrosswordId, setCurrentCrosswordId] = useState<string | null>(null);
```

## Backend API Requirements

### LLM Integration Service

**Critical**: All LLM calls must be handled by backend to avoid CORS issues and secure API keys.

```python
# llm_service.py
class LLMService:
    @staticmethod
    async def generate_words_and_clues_from_topic(topic: str) -> List[Dict[str, str]]:
        """Generate 30 words with clues in CSV format"""
        
    @staticmethod
    def get_config() -> Dict:
        """Environment-based LLM configuration"""
        
    @staticmethod 
    async def _call_openai(topic: str, config: Dict) -> List[Dict[str, str]]:
        """OpenAI API integration"""
        
    @staticmethod
    async def _call_anthropic(topic: str, config: Dict) -> List[Dict[str, str]]:
        """Anthropic API integration"""
        
    @staticmethod
    def _get_mock_words(topic: str) -> List[Dict[str, str]]:
        """Comprehensive fallback with topic-specific data"""
```

#### LLM Prompt Template (Critical for Quality)
```python
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
```

### API Endpoints

```python
# api.py
@app.post("/generate-from-topic", response_model=TopicWordsResponse)
async def generate_words_from_topic(request: TopicRequest):
    """Generate words and clues, store session data"""
    
@app.post("/generate-crossword", response_model=CrosswordResponse) 
async def generate_crossword(request: WordListRequest):
    """Create crossword from word list"""
    
@app.get("/clues/{crossword_id}", response_model=CluesResponse)
async def get_clues(crossword_id: str):
    """Retrieve stored clues by session ID"""
    
@app.get("/health")
async def health_check():
    """Health check for monitoring"""
```

#### Session Management
```python
# In-memory storage with UUIDs
clue_storage: Dict[str, Dict[str, str]] = {}

# Store clues when generating from topic
crossword_id = str(uuid.uuid4())
clue_storage[crossword_id] = {item['word']: item['clue'] for item in word_clue_data}
```

## Docker Deployment Requirements

### Multi-Container Setup

#### Backend Container (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim

# Security: Non-root user
RUN useradd -m -u 1000 appuser

# Dependency optimization
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY start_server.py .

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

USER appuser
EXPOSE 8000
CMD ["python", "start_server.py"]
```

#### Frontend Container (`frontend/Dockerfile`)
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose Configuration
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - LLM_PROVIDER=${LLM_PROVIDER:-mock}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
    networks:
      - crossword-network

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - crossword-network

networks:
  crossword-network:
    driver: bridge
```

### Environment Configuration
```bash
# .env.template
LLM_PROVIDER=anthropic
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OLLAMA_BASE_URL=http://ollama:11434
NODE_ENV=development
```

## Testing Requirements

### Comprehensive Test Suite

```python
# test_crossword_generator.py
class TestCrosswordGenerator:
    @pytest.fixture
    def test_words(self):
        return ["PYTHON", "CODE", "TEST", "GRID", "WORD", "PLACE", "CROSS"]
    
    def test_find_intersections(self, generator):
        """Test intersection finding between words"""
        intersections = generator.find_intersections("PYTHON", "CODE")
        assert (4, 1) in intersections  # O intersection
        
    def test_no_invalid_perpendicular_words(self, generator):
        """Critical: No unintended words like 'MTG', 'AEI', 'RCCROSS'"""
        
    def test_word_connectivity(self, generator):
        """All words must connect - no floating words"""
        
    def test_no_word_merging(self, generator):
        """Prevent 'SMARTEST' or 'LOGICODE' formations"""
        
    def test_generate_crossword_quality(self, generator):
        """Generated crossword meets professional standards"""
```

## Security Requirements

1. **API Key Management**: Environment variables only, never in code
2. **CORS Configuration**: Proper headers for cross-origin requests  
3. **Input Validation**: Sanitize all user inputs
4. **Container Security**: Non-root users, minimal images
5. **Secret Management**: Docker secrets for production

## Performance Requirements

1. **Backend Response**: < 2 seconds for crossword generation
2. **Frontend Rendering**: 60fps animations, smooth interactions
3. **LLM Calls**: Timeout handling with fallback to mock data
4. **Docker Images**: Optimized with multi-stage builds
5. **Caching**: Static asset optimization in nginx

## User Experience Flow

### Complete Journey
1. **Landing**: Professional "Crossword Studio" branding
2. **Topic Input**: User enters "Pixar Characters" 
3. **Generation**: LLM generates 30 words + clues simultaneously
4. **Crossword Creation**: Backend algorithm creates valid puzzle
5. **Interactive Solving**: Professional grid with click/type interaction
6. **Validation**: Check puzzle highlights errors, reveal shows solution
7. **Completion**: Professional completion feedback

### Error Handling
- **LLM Failures**: Automatic fallback to curated mock data
- **Invalid Inputs**: Clear error messages with suggestions
- **API Timeouts**: Graceful degradation with retry options
- **Generation Failures**: Alternative word sets or simplified puzzles

## Quality Standards

### Code Quality
- **TypeScript**: Full type coverage on frontend
- **Error Handling**: Comprehensive try/catch with meaningful messages
- **Logging**: Structured logging for debugging and monitoring
- **Documentation**: Clear comments for complex algorithms
- **Testing**: 80%+ test coverage for core algorithms

### UX Quality  
- **Accessibility**: WCAG AA compliance, keyboard navigation
- **Responsive**: Mobile-friendly touch targets (48px minimum)
- **Performance**: Loading states, optimistic updates
- **Polish**: Smooth animations, professional styling

## Success Criteria

### Technical Success
- ✅ All pytest tests pass without modification
- ✅ Docker deployment works with single `docker-compose up`
- ✅ LLM integration works with multiple providers
- ✅ No CORS issues or security vulnerabilities
- ✅ Professional UI comparable to commercial puzzle apps

### User Experience Success
- ✅ Topic → Words → Crossword → Clues flow under 30 seconds
- ✅ Interactive solving with professional validation
- ✅ No invalid words or disconnected puzzle pieces
- ✅ Mobile and desktop friendly
- ✅ Accessible to users with diverse needs

### Production Readiness
- ✅ Containerized with health checks
- ✅ Environment-based configuration
- ✅ Monitoring and logging capabilities
- ✅ Security best practices implemented
- ✅ Scalable architecture with clear service boundaries

## Implementation Instructions

1. **Start with Complete Architecture**: Build all services simultaneously, not incrementally
2. **Use Exact Specifications**: Follow the provided class signatures and API contracts exactly
3. **Test Thoroughly**: Implement comprehensive test suite before adding features  
4. **Validate Early**: Test crossword generation algorithm with edge cases
5. **Security First**: Implement proper secret management from the beginning
6. **Professional Polish**: Build to commercial standards, not prototype quality

## Anti-Patterns to Avoid (Lessons from Previous Attempts)

❌ **Don't**: Start with basic prototype and iterate architecture  
✅ **Do**: Design complete system architecture upfront

❌ **Don't**: Handle LLM calls in frontend (CORS issues)  
✅ **Do**: Centralize all external API calls in backend

❌ **Don't**: Allow invalid perpendicular words in crosswords  
✅ **Do**: Implement strict word validation with boundary checking

❌ **Don't**: Create floating disconnected words  
✅ **Do**: Ensure all words connect to form valid crossword structure

❌ **Don't**: Use basic HTML styling  
✅ **Do**: Implement professional design system with consistent tokens

❌ **Don't**: Expose API keys or use insecure practices  
✅ **Do**: Follow security best practices from day one

This comprehensive specification should result in a production-ready crossword generator that demonstrates professional AI integration while avoiding the architectural pitfalls that required 12 previous iterations to resolve.