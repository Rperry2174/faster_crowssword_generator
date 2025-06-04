import React, { useState, useCallback } from 'react';
import { TabContainer } from './components/TabContainer';
import { TopicInput } from './components/TopicInput';
import { CustomWordInput } from './components/CustomWordInput';
import { CrosswordGrid } from './components/CrosswordGrid';
import { ClueList } from './components/ClueList';
import { apiService } from './services/api';
import { CrosswordGrid as CrosswordGridType, WordPlacement, CluesData } from './types';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [crossword, setCrossword] = useState<CrosswordGridType | null>(null);
  const [clues, setClues] = useState<CluesData>({});
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [currentCrosswordId, setCurrentCrosswordId] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordPlacement | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeUserGrid = useCallback((grid: (string | null)[][]): string[][] => {
    return grid.map(row => 
      row.map(cell => cell !== null ? '' : '')
    );
  }, []);

  const handleGenerateFromTopic = async (topic: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate words from topic
      const wordsResponse = await apiService.generateWordsFromTopic(topic);
      
      // Generate crossword
      const crosswordResponse = await apiService.generateCrossword(
        wordsResponse.words, 
        wordsResponse.crossword_id
      );
      
      // Get clues
      const cluesResponse = await apiService.getClues(wordsResponse.crossword_id);
      
      // Set state
      setCrossword(crosswordResponse);
      setClues(cluesResponse.clues);
      setUserGrid(initializeUserGrid(crosswordResponse.grid));
      setCurrentCrosswordId(wordsResponse.crossword_id);
      setSelectedWord(null);
      setShowErrors(false);
      setShowSolution(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate crossword');
      console.error('Error generating crossword:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromWords = async (words: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate crossword from custom words
      const crosswordResponse = await apiService.generateCrossword(words);
      
      // Create fallback clues for custom words
      const fallbackClues: CluesData = {};
      words.forEach(word => {
        fallbackClues[word] = `Clue for ${word} (${word.length} letters)`;
      });
      
      // Set state
      setCrossword(crosswordResponse);
      setClues(fallbackClues);
      setUserGrid(initializeUserGrid(crosswordResponse.grid));
      setCurrentCrosswordId(null);
      setSelectedWord(null);
      setShowErrors(false);
      setShowSolution(false);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate crossword');
      console.error('Error generating crossword:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserInput = useCallback((row: number, col: number, value: string) => {
    setUserGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      newGrid[row][col] = value.toUpperCase();
      return newGrid;
    });
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!crossword) return;
    
    // Find word at this position
    const word = crossword.word_placements.find(wp => {
      if (wp.direction === 'horizontal') {
        return wp.start_row === row && 
               col >= wp.start_col && 
               col < wp.start_col + wp.word.length;
      } else {
        return wp.start_col === col && 
               row >= wp.start_row && 
               row < wp.start_row + wp.word.length;
      }
    });
    
    setSelectedWord(word || null);
  }, [crossword]);

  const handleClueClick = useCallback((placement: WordPlacement) => {
    setSelectedWord(placement);
  }, []);

  const handleCheckPuzzle = () => {
    setShowErrors(true);
    setShowSolution(false);
  };

  const handleRevealPuzzle = () => {
    setShowSolution(true);
    setShowErrors(false);
  };

  const calculateCompletionPercentage = (): number => {
    if (!crossword || !userGrid) return 0;
    
    let totalCells = 0;
    let filledCells = 0;
    
    crossword.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== null) {
          totalCells++;
          if (userGrid[rowIndex]?.[colIndex]?.trim()) {
            filledCells++;
          }
        }
      });
    });
    
    return totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
  };

  const tabs = [
    {
      id: 'topic',
      label: 'Generate from Topic',
      content: (
        <TopicInput 
          onSubmit={handleGenerateFromTopic}
          loading={loading}
        />
      )
    },
    {
      id: 'custom',
      label: 'Custom Words',
      content: (
        <CustomWordInput 
          onSubmit={handleGenerateFromWords}
          loading={loading}
        />
      )
    }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Crossword Studio</h1>
        <p className="app-subtitle">AI-Powered Puzzle Generator</p>
      </header>

      <main className="app-main">
        {!crossword ? (
          <div className="generation-section">
            <TabContainer tabs={tabs} defaultTab="topic" />
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="puzzle-section">
            <div className="puzzle-header">
              <div className="puzzle-info">
                <h2 className="puzzle-title">Your Crossword Puzzle</h2>
                <div className="puzzle-stats">
                  <span className="completion-badge">
                    {calculateCompletionPercentage()}% Complete
                  </span>
                  <span className="word-count">
                    {crossword.word_placements.length} words
                  </span>
                </div>
              </div>
              
              <div className="puzzle-actions">
                <button 
                  className="action-button check"
                  onClick={handleCheckPuzzle}
                  disabled={calculateCompletionPercentage() === 0}
                >
                  ✓ Check Puzzle
                </button>
                <button 
                  className="action-button reveal"
                  onClick={handleRevealPuzzle}
                >
                  💡 Reveal Solution
                </button>
                <button 
                  className="action-button new"
                  onClick={() => setCrossword(null)}
                >
                  🔄 New Puzzle
                </button>
              </div>
            </div>

            <div className="puzzle-content">
              <div className="crossword-section">
                <CrosswordGrid
                  grid={crossword.grid}
                  wordPlacements={crossword.word_placements}
                  userGrid={userGrid}
                  onUserInput={handleUserInput}
                  onCellClick={handleCellClick}
                  showErrors={showErrors}
                  showSolution={showSolution}
                />
              </div>

              <div className="clues-section">
                <ClueList
                  wordPlacements={crossword.word_placements}
                  clues={clues}
                  selectedWord={selectedWord}
                  onClueClick={handleClueClick}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built with AI-powered crossword generation</p>
      </footer>
    </div>
  );
}

export default App;