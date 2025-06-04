import React, { useState } from 'react';
import './TopicInput.css';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  loading: boolean;
}

const EXAMPLE_TOPICS = [
  'Basketball',
  'Pixar Characters',
  'The Office TV Show',
  'Space Exploration',
  'Italian Cuisine',
  'Video Games',
  'Ocean Animals',
  'Classic Rock Music'
];

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, loading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !loading) {
      onSubmit(topic.trim());
    }
  };

  const handleExampleClick = (exampleTopic: string) => {
    setTopic(exampleTopic);
  };

  return (
    <div className="topic-input-container">
      <form onSubmit={handleSubmit} className="topic-form">
        <div className="input-group">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic (e.g., Basketball, Movies, Food...)"
            className="topic-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="generate-button"
            disabled={!topic.trim() || loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              'Generate Words'
            )}
          </button>
        </div>
      </form>

      <div className="examples-section">
        <p className="examples-label">Or try one of these topics:</p>
        <div className="examples-grid">
          {EXAMPLE_TOPICS.map((exampleTopic) => (
            <button
              key={exampleTopic}
              onClick={() => handleExampleClick(exampleTopic)}
              className="example-topic"
              disabled={loading}
            >
              {exampleTopic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};