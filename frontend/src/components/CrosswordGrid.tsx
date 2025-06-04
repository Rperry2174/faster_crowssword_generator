import React, { useState, useEffect, useCallback } from 'react';
import { WordPlacement } from '../types';
import './CrosswordGrid.css';

interface CrosswordGridProps {
  grid: (string | null)[][];
  wordPlacements: WordPlacement[];
  onCellClick?: (row: number, col: number) => void;
  userGrid?: string[][];
  onUserInput?: (row: number, col: number, value: string) => void;
  showErrors?: boolean;
  showSolution?: boolean;
}

interface SelectedWord {
  placement: WordPlacement;
  direction: 'horizontal' | 'vertical';
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  grid,
  wordPlacements,
  onCellClick,
  userGrid,
  onUserInput,
  showErrors = false,
  showSolution = false
}) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<SelectedWord | null>(null);
  const [currentDirection, setCurrentDirection] = useState<'horizontal' | 'vertical'>('horizontal');

  const getWordAtPosition = useCallback((row: number, col: number, direction: 'horizontal' | 'vertical'): WordPlacement | null => {
    return wordPlacements.find(wp => {
      if (wp.direction !== direction) return false;
      
      if (direction === 'horizontal') {
        return wp.start_row === row && 
               col >= wp.start_col && 
               col < wp.start_col + wp.word.length;
      } else {
        return wp.start_col === col && 
               row >= wp.start_row && 
               row < wp.start_row + wp.word.length;
      }
    }) || null;
  }, [wordPlacements]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (grid[row][col] === null) return;

    const isSameCell = selectedCell?.row === row && selectedCell?.col === col;
    
    if (isSameCell) {
      // Toggle direction on same cell click
      const newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
      setCurrentDirection(newDirection);
      
      const word = getWordAtPosition(row, col, newDirection);
      if (word) {
        setSelectedWord({ placement: word, direction: newDirection });
      }
    } else {
      // New cell selected
      setSelectedCell({ row, col });
      
      // Try current direction first, fallback to other direction
      let word = getWordAtPosition(row, col, currentDirection);
      let direction = currentDirection;
      
      if (!word) {
        direction = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
        word = getWordAtPosition(row, col, direction);
      }
      
      if (word) {
        setSelectedWord({ placement: word, direction });
        setCurrentDirection(direction);
      } else {
        setSelectedWord(null);
      }
    }

    onCellClick?.(row, col);
  }, [selectedCell, currentDirection, getWordAtPosition, grid, onCellClick]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedCell || !selectedWord) return;

    const { row, col } = selectedCell;
    const { placement, direction } = selectedWord;

    if (e.key === 'Backspace') {
      e.preventDefault();
      onUserInput?.(row, col, '');
      
      // Move to previous cell in word
      if (direction === 'horizontal' && col > placement.start_col) {
        setSelectedCell({ row, col: col - 1 });
      } else if (direction === 'vertical' && row > placement.start_row) {
        setSelectedCell({ row: row - 1, col });
      }
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      onUserInput?.(row, col, letter);
      
      // Move to next cell in word
      if (direction === 'horizontal' && col < placement.start_col + placement.word.length - 1) {
        setSelectedCell({ row, col: col + 1 });
      } else if (direction === 'vertical' && row < placement.start_row + placement.word.length - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      
      let newRow = row;
      let newCol = col;
      
      switch (e.key) {
        case 'ArrowLeft':
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          newCol = Math.min(grid[0].length - 1, col + 1);
          break;
        case 'ArrowUp':
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(grid.length - 1, row + 1);
          break;
      }
      
      if (grid[newRow][newCol] !== null) {
        handleCellClick(newRow, newCol);
      }
    }
  }, [selectedCell, selectedWord, onUserInput, grid, handleCellClick]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getCellClass = (row: number, col: number): string => {
    const classes = ['crossword-cell'];
    
    if (grid[row][col] === null) {
      classes.push('blocked');
      return classes.join(' ');
    }

    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isInSelectedWord = selectedWord && (
      (selectedWord.direction === 'horizontal' && 
       selectedWord.placement.start_row === row &&
       col >= selectedWord.placement.start_col &&
       col < selectedWord.placement.start_col + selectedWord.placement.word.length) ||
      (selectedWord.direction === 'vertical' &&
       selectedWord.placement.start_col === col &&
       row >= selectedWord.placement.start_row &&
       row < selectedWord.placement.start_row + selectedWord.placement.word.length)
    );

    if (isSelected) {
      classes.push('selected');
    } else if (isInSelectedWord) {
      classes.push('highlighted');
    }

    // Error highlighting
    if (showErrors && userGrid && userGrid[row][col] && 
        userGrid[row][col] !== grid[row][col]) {
      classes.push('error');
    }

    return classes.join(' ');
  };

  const getCellValue = (row: number, col: number): string => {
    if (grid[row][col] === null) return '';
    
    if (showSolution) {
      return grid[row][col] || '';
    }
    
    return userGrid?.[row]?.[col] || '';
  };

  const getCellNumber = (row: number, col: number): number | null => {
    const placement = wordPlacements.find(wp => 
      wp.start_row === row && wp.start_col === col
    );
    return placement?.number || null;
  };

  return (
    <div className="crossword-grid-container">
      <div 
        className="crossword-grid"
        style={{
          gridTemplateColumns: `repeat(${grid[0]?.length || 15}, 1fr)`,
          gridTemplateRows: `repeat(${grid.length || 15}, 1fr)`
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClass(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              tabIndex={cell !== null ? 0 : -1}
            >
              {getCellNumber(rowIndex, colIndex) && (
                <span className="cell-number">
                  {getCellNumber(rowIndex, colIndex)}
                </span>
              )}
              <span className="cell-letter">
                {getCellValue(rowIndex, colIndex)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};