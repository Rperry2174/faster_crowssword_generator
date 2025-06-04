import React, { useState } from 'react';
import './CustomWordInput.css';

interface CustomWordInputProps {
  onSubmit: (words: string[]) => void;
  loading: boolean;
}

export const CustomWordInput: React.FC<CustomWordInputProps> = ({ onSubmit, loading }) => {
  const [wordInput, setWordInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wordInput.trim() && !loading) {
      const words = wordInput
        .split(/[,\n]/)
        .map(word => word.trim().toUpperCase())
        .filter(word => word.length >= 3 && word.match(/^[A-Z]+$/));
      
      if (words.length > 0) {
        onSubmit(words);
      }
    }
  };

  const wordCount = wordInput
    .split(/[,\n]/)
    .map(word => word.trim())
    .filter(word => word.length >= 3 && word.match(/^[A-Za-z]+$/))
    .length;

  return (
    <div className="custom-word-input-container">
      <form onSubmit={handleSubmit} className="word-form">
        <div className="input-section">
          <label htmlFor="word-input" className="input-label">
            Enter Words (separated by commas or new lines)
          </label>
          <textarea
            id="word-input"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder="Enter words separated by commas or new lines:&#10;WORD, PUZZLE, CROSSWORD&#10;GAME, BRAIN, SOLVE"
            className="word-textarea"
            disabled={loading}
            rows={8}
          />
          <div className="word-count">
            Valid words: {wordCount} (minimum 3 letters, letters only)
          </div>
        </div>

        <button 
          type="submit" 
          className="generate-button"
          disabled={wordCount === 0 || loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Generating Crossword...
            </>
          ) : (
            `Generate Crossword (${wordCount} words)`
          )}
        </button>
      </form>

      <div className="examples-section">
        <h4 className="examples-title">Tips:</h4>
        <ul className="tips-list">
          <li>Use words between 3-15 letters for best results</li>
          <li>Mix short and long words for better crossword structure</li>
          <li>Choose words with common letters (A, E, I, O, U, R, S, T)</li>
          <li>Avoid proper nouns and abbreviations</li>
        </ul>
      </div>
    </div>
  );
};