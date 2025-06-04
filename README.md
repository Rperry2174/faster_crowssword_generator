# Crossword Studio - AI-Powered Puzzle Generator

A production-ready, commercial-grade crossword puzzle generator that demonstrates AI/LLM capabilities through an interactive web application. Users can input topics (e.g., "The Office", "Basketball", "Pixar Characters") and receive fully playable crossword puzzles with generated clues.

## 🚀 Features

- **AI-Powered Word Generation**: Generates themed words and clues using multiple LLM providers
- **Robust Crossword Algorithm**: Creates valid crosswords with proper word intersections
- **Interactive Grid**: Professional crossword interface with click/type interaction
- **Multi-Provider LLM Support**: OpenAI, Anthropic, Ollama, and mock fallback
- **Production Ready**: Docker containerization with health checks
- **Comprehensive Testing**: Full test suite with 80%+ coverage

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   LLM APIs      │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   Multi-provider│
│   Port: 3000    │    │   Port: 8000    │    │   External APIs │
│   Nginx Proxy   │    │   Python        │    │   + Local Ollama│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone and setup**:
   ```bash
   git clone <repository>
   cd faster_dynamic_crossword
   cp .env.template .env
   ```

2. **Configure environment** (edit `.env`):
   ```bash
   LLM_PROVIDER=anthropic  # or openai, ollama, mock
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   ```

3. **Start the application**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Health Check: http://localhost:8000/health

### Local Development

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python start_server.py
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Test Coverage
- Crossword generation algorithm validation
- LLM integration with multiple providers
- API endpoint functionality
- Error handling and edge cases

## 🛠️ Core Components

### Backend (`/backend`)
- **FastAPI Application**: RESTful API with CORS support
- **Crossword Generator**: Robust algorithm preventing invalid word formations
- **LLM Service**: Multi-provider integration with fallback
- **Comprehensive Tests**: pytest suite with mocking

### Frontend (`/frontend`)
- **React TypeScript**: Modern component architecture
- **Interactive Grid**: Professional crossword interface
- **Tab System**: Topic generation vs. custom words
- **Responsive Design**: Mobile-friendly with touch support

## 📋 API Endpoints

- `POST /generate-from-topic` - Generate words from topic
- `POST /generate-crossword` - Create crossword from word list
- `GET /clues/{crossword_id}` - Retrieve stored clues
- `GET /health` - Health check

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_PROVIDER` | LLM provider (openai/anthropic/ollama/mock) | `mock` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |

### LLM Providers

1. **OpenAI**: GPT-3.5-turbo for word generation
2. **Anthropic**: Claude Haiku for word generation  
3. **Ollama**: Local LLM support (llama2)
4. **Mock**: Fallback with curated word lists

## 🎯 Crossword Algorithm

The crossword generation engine implements:

- **Intersection Validation**: Ensures proper word connections
- **Boundary Checking**: Prevents word merging and overflow
- **Perpendicular Word Validation**: Avoids creating invalid words
- **Connectivity Requirements**: All words must connect to main structure
- **Quality Filtering**: Professional crossword standards

## 🔒 Security Features

- **API Key Management**: Environment-based configuration
- **CORS Protection**: Proper cross-origin headers
- **Input Validation**: Sanitized user inputs
- **Container Security**: Non-root users, minimal images
- **Health Monitoring**: Built-in health checks

## 📱 User Experience

1. **Topic Input**: Enter any topic (e.g., "Basketball")
2. **Word Generation**: AI generates 30 themed words with clues
3. **Crossword Creation**: Algorithm creates valid puzzle structure
4. **Interactive Solving**: Click cells, type letters, navigate with arrows
5. **Validation**: Check answers or reveal solution
6. **Completion Tracking**: Real-time progress indication

## 🐛 Troubleshooting

### Common Issues

**CORS Errors**: Ensure backend is running and CORS is configured
**LLM API Failures**: Check API keys and network connectivity
**Docker Build Failures**: Verify Docker and docker-compose versions
**Frontend Build Issues**: Clear npm cache and reinstall dependencies

### Debug Mode
```bash
# Backend with debug logging
cd backend
uvicorn src.api:app --reload --log-level debug

# Frontend with detailed errors
cd frontend
npm start
```

## 🚢 Deployment

### Production Deployment
1. Set production environment variables
2. Use production Docker configurations
3. Configure reverse proxy (nginx)
4. Set up monitoring and logging
5. Implement backup strategies

### Scaling Considerations
- Stateless backend design for horizontal scaling
- Session storage can be moved to Redis/database
- CDN for frontend assets
- Load balancing for multiple backend instances

## 📊 Performance

- **Backend Response**: < 2 seconds for crossword generation
- **Frontend Rendering**: 60fps animations, smooth interactions
- **LLM Calls**: Timeout handling with fallback
- **Docker Images**: Optimized with multi-stage builds

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## 📄 License

This project is built for demonstration purposes and showcases AI integration patterns for crossword generation.

---

**Built with AI-powered crossword generation** 🧩