import random
from typing import List, Optional, Tuple, Set
from models import WordPlacement, CrosswordGrid, Direction

class CrosswordGenerator:
    def __init__(self, words: List[str], grid_size: int = 15):
        self.words = [word.upper().strip() for word in words if len(word.strip()) >= 3 and word.strip().isalpha()]
        self.grid_size = grid_size
        self.word_set = set(self.words)
        
    def find_intersections(self, word1: str, word2: str) -> List[Tuple[int, int]]:
        """Find all possible intersection points between two words"""
        intersections = []
        for i, char1 in enumerate(word1):
            for j, char2 in enumerate(word2):
                if char1 == char2:
                    intersections.append((i, j))
        return intersections
    
    def can_place_word(self, grid: List[List[Optional[str]]], word: str, 
                      start_row: int, start_col: int, direction: Direction) -> bool:
        """Check if word can be placed WITHOUT creating invalid perpendicular words"""
        if start_row < 0 or start_col < 0:
            return False
            
        # Check bounds
        if direction == Direction.HORIZONTAL:
            if start_col + len(word) > self.grid_size:
                return False
            if start_row >= self.grid_size:
                return False
        else:  # VERTICAL
            if start_row + len(word) > self.grid_size:
                return False
            if start_col >= self.grid_size:
                return False
        
        # Check for conflicts and validate perpendicular words
        for i, char in enumerate(word):
            if direction == Direction.HORIZONTAL:
                row, col = start_row, start_col + i
            else:
                row, col = start_row + i, start_col
            
            # Check if position conflicts with existing letter
            if grid[row][col] is not None and grid[row][col] != char:
                return False
            
            # Check perpendicular words only if this is a new letter placement
            if grid[row][col] is None:
                if not self._validate_perpendicular_placement(grid, row, col, char, direction):
                    return False
        
        # Check word boundaries - ensure no word merging
        if not self._check_word_boundaries(grid, word, start_row, start_col, direction):
            return False
            
        return True
    
    def _validate_perpendicular_placement(self, grid: List[List[Optional[str]]], 
                                        row: int, col: int, char: str, 
                                        placement_direction: Direction) -> bool:
        """Validate that placing a character doesn't create invalid perpendicular words"""
        # Check perpendicular direction
        perp_direction = Direction.VERTICAL if placement_direction == Direction.HORIZONTAL else Direction.HORIZONTAL
        
        if perp_direction == Direction.VERTICAL:
            # Check vertical word formation
            start_row = row
            end_row = row
            
            # Find start of potential vertical word
            while start_row > 0 and (grid[start_row - 1][col] is not None or start_row - 1 == row):
                start_row -= 1
                if start_row == row:
                    break
            
            # Find end of potential vertical word
            while end_row < self.grid_size - 1 and (grid[end_row + 1][col] is not None or end_row + 1 == row):
                end_row += 1
                if end_row == row:
                    break
            
            # Build the potential word
            if end_row > start_row:
                word_chars = []
                for r in range(start_row, end_row + 1):
                    if r == row:
                        word_chars.append(char)
                    else:
                        word_chars.append(grid[r][col])
                
                potential_word = ''.join(word_chars)
                if len(potential_word) > 1 and potential_word not in self.word_set:
                    return False
        
        else:  # Check horizontal word formation
            start_col = col
            end_col = col
            
            # Find start of potential horizontal word
            while start_col > 0 and (grid[row][start_col - 1] is not None or start_col - 1 == col):
                start_col -= 1
                if start_col == col:
                    break
            
            # Find end of potential horizontal word
            while end_col < self.grid_size - 1 and (grid[row][end_col + 1] is not None or end_col + 1 == col):
                end_col += 1
                if end_col == col:
                    break
            
            # Build the potential word
            if end_col > start_col:
                word_chars = []
                for c in range(start_col, end_col + 1):
                    if c == col:
                        word_chars.append(char)
                    else:
                        word_chars.append(grid[row][c])
                
                potential_word = ''.join(word_chars)
                if len(potential_word) > 1 and potential_word not in self.word_set:
                    return False
        
        return True
    
    def _check_word_boundaries(self, grid: List[List[Optional[str]]], word: str,
                             start_row: int, start_col: int, direction: Direction) -> bool:
        """Check word boundaries to prevent word merging"""
        if direction == Direction.HORIZONTAL:
            # Check before word
            if start_col > 0 and grid[start_row][start_col - 1] is not None:
                return False
            # Check after word
            if start_col + len(word) < self.grid_size and grid[start_row][start_col + len(word)] is not None:
                return False
        else:  # VERTICAL
            # Check before word
            if start_row > 0 and grid[start_row - 1][start_col] is not None:
                return False
            # Check after word
            if start_row + len(word) < self.grid_size and grid[start_row + len(word)][start_col] is not None:
                return False
        
        return True
    
    def place_word(self, grid: List[List[Optional[str]]], word: str,
                  start_row: int, start_col: int, direction: Direction) -> bool:
        """Place word on grid if possible"""
        if not self.can_place_word(grid, word, start_row, start_col, direction):
            return False
        
        for i, char in enumerate(word):
            if direction == Direction.HORIZONTAL:
                grid[start_row][start_col + i] = char
            else:
                grid[start_row + i][start_col] = char
        
        return True
    
    def _has_intersections(self, grid: List[List[Optional[str]]], word: str,
                          start_row: int, start_col: int, direction: Direction) -> bool:
        """Check if word placement has at least one intersection with existing words"""
        intersection_count = 0
        
        for i, char in enumerate(word):
            if direction == Direction.HORIZONTAL:
                row, col = start_row, start_col + i
            else:
                row, col = start_row + i, start_col
            
            if grid[row][col] == char:
                intersection_count += 1
        
        return intersection_count > 0
    
    def generate_crossword(self) -> CrosswordGrid:
        """Main algorithm - must create VALID crosswords with proper connectivity"""
        if not self.words:
            return CrosswordGrid(
                grid=[[None for _ in range(self.grid_size)] for _ in range(self.grid_size)],
                width=self.grid_size,
                height=self.grid_size,
                word_placements=[]
            )
        
        # Initialize empty grid
        grid = [[None for _ in range(self.grid_size)] for _ in range(self.grid_size)]
        word_placements = []
        placed_words = set()
        
        # Sort words by length (longer words first for better structure)
        sorted_words = sorted(self.words, key=len, reverse=True)
        
        # Place first word in center
        first_word = sorted_words[0]
        center_row = self.grid_size // 2
        center_col = (self.grid_size - len(first_word)) // 2
        
        self.place_word(grid, first_word, center_row, center_col, Direction.HORIZONTAL)
        word_placements.append(WordPlacement(
            word=first_word,
            start_row=center_row,
            start_col=center_col,
            direction=Direction.HORIZONTAL,
            number=1
        ))
        placed_words.add(first_word)
        
        # Try to place remaining words
        attempts_per_word = 100
        
        for word in sorted_words[1:]:
            if word in placed_words:
                continue
                
            placed = False
            
            # Try to find intersections with already placed words
            for attempt in range(attempts_per_word):
                # Try both directions
                for direction in [Direction.HORIZONTAL, Direction.VERTICAL]:
                    # Try random positions, but prioritize intersections
                    for _ in range(50):
                        if direction == Direction.HORIZONTAL:
                            start_row = random.randint(0, self.grid_size - 1)
                            start_col = random.randint(0, max(0, self.grid_size - len(word)))
                        else:
                            start_row = random.randint(0, max(0, self.grid_size - len(word)))
                            start_col = random.randint(0, self.grid_size - 1)
                        
                        if self.can_place_word(grid, word, start_row, start_col, direction):
                            # Only place if it has intersections (connectivity requirement)
                            if self._has_intersections(grid, word, start_row, start_col, direction):
                                self.place_word(grid, word, start_row, start_col, direction)
                                word_placements.append(WordPlacement(
                                    word=word,
                                    start_row=start_row,
                                    start_col=start_col,
                                    direction=direction,
                                    number=len(word_placements) + 1
                                ))
                                placed_words.add(word)
                                placed = True
                                break
                    
                    if placed:
                        break
                
                if placed:
                    break
            
            # Limit to reasonable number of words for quality
            if len(word_placements) >= 12:
                break
        
        return CrosswordGrid(
            grid=grid,
            width=self.grid_size,
            height=self.grid_size,
            word_placements=word_placements
        )