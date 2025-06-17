import { GenerateWordsResponse, GenerateCrosswordResponse, CluesResponse } from '../types';

// API base URL - detects subpath and uses correct /api prefix
const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV !== 'production') {
    return 'http://localhost:8000';
  }
  
  // In production, detect if we're running at a subpath
  const currentPath = window.location.pathname;
  const basePath = currentPath.split('/').slice(0, -1).join('/') || '';
  
  // If we have a subpath (like /crossword-bad-prompt), use it
  if (basePath && basePath !== '') {
    return `${basePath}/api`;
  }
  
  // Default to /api for root deployments
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async generateWordsFromTopic(topic: string): Promise<GenerateWordsResponse> {
    return this.request<GenerateWordsResponse>('/generate-from-topic', {
      method: 'POST',
      body: JSON.stringify({ topic }),
    });
  }

  async generateCrossword(words: string[], crosswordId?: string): Promise<GenerateCrosswordResponse> {
    return this.request<GenerateCrosswordResponse>('/generate-crossword', {
      method: 'POST',
      body: JSON.stringify({ 
        words,
        crossword_id: crosswordId 
      }),
    });
  }

  async getClues(crosswordId: string): Promise<CluesResponse> {
    return this.request<CluesResponse>(`/clues/${crosswordId}`);
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request<{ status: string; service: string }>('/health');
  }
}

export const apiService = new ApiService();