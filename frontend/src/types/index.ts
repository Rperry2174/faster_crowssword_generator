export interface WordPlacement {
  word: string;
  start_row: number;
  start_col: number;
  direction: 'horizontal' | 'vertical';
  clue: string;
  number: number;
}

export interface CrosswordGrid {
  grid: (string | null)[][];
  word_placements: WordPlacement[];
  width: number;
  height: number;
}

export interface CluesData {
  [word: string]: string;
}

export interface GenerateWordsResponse {
  words: string[];
  crossword_id: string;
}

export interface GenerateCrosswordResponse {
  grid: (string | null)[][];
  word_placements: WordPlacement[];
  width: number;
  height: number;
}

export interface CluesResponse {
  clues: CluesData;
}