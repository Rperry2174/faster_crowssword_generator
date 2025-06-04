import React from 'react';
import { WordPlacement, CluesData } from '../types';
import './ClueList.css';

interface ClueListProps {
  wordPlacements: WordPlacement[];
  clues: CluesData;
  selectedWord?: WordPlacement | null;
  onClueClick?: (placement: WordPlacement) => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  wordPlacements,
  clues,
  selectedWord,
  onClueClick
}) => {
  const acrossClues = wordPlacements
    .filter(wp => wp.direction === 'horizontal')
    .sort((a, b) => a.number - b.number);

  const downClues = wordPlacements
    .filter(wp => wp.direction === 'vertical')
    .sort((a, b) => a.number - b.number);

  const getClueText = (word: string): string => {
    return clues[word] || `Clue for ${word} (${word.length} letters)`;
  };

  const renderClueItem = (placement: WordPlacement) => {
    const isSelected = selectedWord?.word === placement.word && 
                      selectedWord?.direction === placement.direction;
    
    return (
      <li
        key={`${placement.word}-${placement.direction}`}
        className={`clue-item ${isSelected ? 'selected' : ''}`}
        onClick={() => onClueClick?.(placement)}
      >
        <span className="clue-number">{placement.number}.</span>
        <span className="clue-text">{getClueText(placement.word)}</span>
        <span className="clue-length">({placement.word.length})</span>
      </li>
    );
  };

  return (
    <div className="clue-list-container">
      <div className="clue-section">
        <h3 className="clue-section-title">Across</h3>
        <ul className="clue-list">
          {acrossClues.length > 0 ? (
            acrossClues.map(renderClueItem)
          ) : (
            <li className="no-clues">No across clues available</li>
          )}
        </ul>
      </div>

      <div className="clue-section">
        <h3 className="clue-section-title">Down</h3>
        <ul className="clue-list">
          {downClues.length > 0 ? (
            downClues.map(renderClueItem)
          ) : (
            <li className="no-clues">No down clues available</li>
          )}
        </ul>
      </div>
    </div>
  );
};