'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import styles from './crossword.module.css';

interface CrosswordCell {
  letter: string;
  number?: number;
  isBlack: boolean;
  row: number;
  col: number;
}

interface CrosswordClue {
  number: number;
  clue: string;
  direction: 'across' | 'down';
  answer: string;
}

const CrosswordPage = () => {
  const [grid, setGrid] = useState<CrosswordCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [userInputs, setUserInputs] = useState<{[key: string]: string}>({});
  const [isComplete, setIsComplete] = useState(false);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<number | null>(null);
  const [clueNumbers, setClueNumbers] = useState<Array<Array<{number: number; direction: "across" | "down"} | null>>>([]);

  // Sample crossword puzzle data with general topics
  const puzzleData = {
    size: 8,
    grid: [
      [false, false, false, false, true, false, false, false],
      [false, false, false, false, false, false, true, false],
      [false, false, false, true, false, false, false, false],
      [true, true, false, false, false, false, true, true],
      [false, false, false, false, true, false, false, false],
      [false, true, false, false, false, false, false, false],
      [false, false, false, true, false, false, false, false],
      [false, false, false, false, false, true, false, false],
    ],
    words: [
      { answer: 'BOOK', row: 0, col: 0, direction: 'across' },
      { answer: 'OCEAN', row: 1, col: 0, direction: 'across' },
      { answer: 'SKY', row: 2, col: 0, direction: 'across' },
      { answer: 'MOON', row: 3, col: 2, direction: 'across' },
      { answer: 'TREE', row: 4, col: 0, direction: 'across' },
      { answer: 'SMILE', row: 5, col: 2, direction: 'across' },
      { answer: 'BIRD', row: 6, col: 0, direction: 'across' },
      { answer: 'CLOUD', row: 7, col: 0, direction: 'across' },
      
      { answer: 'BOAT', row: 0, col: 0, direction: 'down' },
      { answer: 'OPEN', row: 0, col: 1, direction: 'down' },
      { answer: 'OKAY', row: 0, col: 2, direction: 'down' },
      { answer: 'KITE', row: 0, col: 3, direction: 'down' },
      { answer: 'STAR', row: 0, col: 5, direction: 'down' },
      { answer: 'TEA', row: 0, col: 6, direction: 'down' },
      { answer: 'RAIN', row: 0, col: 7, direction: 'down' },
    ],
    clues: {
      across: [
        { number: 1, clue: 'A bound collection of pages', direction: 'across', answer: 'BOOK' },
        { number: 5, clue: 'Vast body of saltwater', direction: 'across', answer: 'OCEAN' },
        { number: 8, clue: 'The blue above us', direction: 'across', answer: 'SKY' },
        { number: 10, clue: 'Earth\'s natural satellite', direction: 'across', answer: 'MOON' },
        { number: 12, clue: 'Woody perennial plant', direction: 'across', answer: 'TREE' },
        { number: 14, clue: 'Facial expression of happiness', direction: 'across', answer: 'SMILE' },
        { number: 16, clue: 'Feathered flying creature', direction: 'across', answer: 'BIRD' },
        { number: 18, clue: 'Visible mass of water droplets in the atmosphere', direction: 'across', answer: 'CLOUD' },
      ],
      down: [
        { number: 1, clue: 'Small vessel for traveling on water', direction: 'down', answer: 'BOAT' },
        { number: 2, clue: 'Not closed', direction: 'down', answer: 'OPEN' },
        { number: 3, clue: 'Expression of agreement', direction: 'down', answer: 'OKAY' },
        { number: 4, clue: 'Flying toy with a frame and string', direction: 'down', answer: 'KITE' },
        { number: 6, clue: 'Luminous celestial object', direction: 'down', answer: 'STAR' },
        { number: 7, clue: 'Hot beverage made by infusing leaves', direction: 'down', answer: 'TEA' },
        { number: 9, clue: 'Water falling from clouds', direction: 'down', answer: 'RAIN' },
      ],
    },
  };

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const { size, grid: blackCells, words } = puzzleData;
    
    // Create empty grid
    const newGrid: CrosswordCell[][] = Array(size).fill(null).map((_, row) => 
      Array(size).fill(null).map((_, col) => ({
        letter: '',
        isBlack: blackCells[row][col],
        row,
        col
      }))
    );
    
    // Number the cells
    let cellNumber = 1;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (newGrid[row][col].isBlack) continue;
        
        const isStartOfAcross = col === 0 || newGrid[row][col-1].isBlack;
        const isStartOfDown = row === 0 || newGrid[row-1][col].isBlack;
        
        if (isStartOfAcross || isStartOfDown) {
          newGrid[row][col].number = cellNumber++;
        }
      }
    }
    
    setGrid(newGrid);
  };

  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlack) return;
    
    if (selectedCell?.row === row && selectedCell?.col === col) {
      // Toggle direction if clicking the same cell
      setDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      moveToNextClue();
      return;
    }
    
    if (e.key === 'ArrowRight') {
      moveToCell(row, col + 1);
    } else if (e.key === 'ArrowLeft') {
      moveToCell(row, col - 1);
    } else if (e.key === 'ArrowDown') {
      moveToCell(row + 1, col);
    } else if (e.key === 'ArrowUp') {
      moveToCell(row - 1, col);
    } else if (e.key === 'Backspace') {
      if (userInputs[`${row}-${col}`]) {
        const newInputs = { ...userInputs };
        delete newInputs[`${row}-${col}`];
        setUserInputs(newInputs);
      } else {
        // Move to previous cell
        if (direction === 'across') {
          moveToCell(row, col - 1);
        } else {
          moveToCell(row - 1, col);
        }
      }
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      const letter = e.key.toUpperCase();
      setUserInputs(prev => ({ ...prev, [`${row}-${col}`]: letter }));
      
      // Move to next cell
      if (direction === 'across') {
        moveToCell(row, col + 1);
      } else {
        moveToCell(row + 1, col);
      }
    }
  };

  const moveToCell = (row: number, col: number) => {
    if (row < 0 || row >= puzzleData.size || col < 0 || col >= puzzleData.size) return;
    if (grid[row][col].isBlack) return;
    setSelectedCell({ row, col });
  };

  const moveToNextClue = () => {
    const { across, down } = puzzleData.clues;
    const allClues = [...across, ...down].sort((a, b) => a.number - b.number);
    
    if (!selectedClue) {
      setSelectedClue(allClues[0].number);
      return;
    }
    
    const currentIndex = allClues.findIndex(clue => clue.number === selectedClue);
    const nextIndex = (currentIndex + 1) % allClues.length;
    const nextClue = allClues[nextIndex];
    
    setSelectedClue(nextClue.number);
    
    // Find the starting cell for this clue
    for (let row = 0; row < puzzleData.size; row++) {
      for (let col = 0; col < puzzleData.size; col++) {
        if (grid[row][col].number === nextClue.number) {
          setSelectedCell({ row, col });
          if (nextClue.direction === "across" || nextClue.direction === "down") {
            setDirection(nextClue.direction);
          } else {
            setDirection("across");
            console.warn(`Invalid direction: ${nextClue.direction}`);
          }
          return;
        }
      }
    }
  };

  const handleClueClick = (clue: CrosswordClue) => {
    setSelectedClue(clue.number);
    setDirection(clue.direction);
    
    // Find the starting cell for this clue
    for (let row = 0; row < puzzleData.size; row++) {
      for (let col = 0; col < puzzleData.size; col++) {
        if (grid[row][col].number === clue.number) {
          setSelectedCell({ row, col });
          return;
        }
      }
    }
  };

  const isClueSelected = (clue: { number: number; direction: "across" | "down" }) => {
    // Get the current clue number from the selected cell
    const currentClueNumber = selectedCell ? 
      grid[selectedCell.row][selectedCell.col].number : null;
    
    // Check if the current clue matches the selected cell and direction
    return currentClueNumber === clue.number && direction === clue.direction;
  };

  const checkPuzzle = () => {
    let correct = true;
    
    puzzleData.words.forEach(word => {
      const { row, col, direction, answer } = word;
      
      for (let i = 0; i < answer.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;
        
        if (userInputs[`${r}-${c}`] !== answer[i]) {
          correct = false;
          break;
        }
      }
    });
    
    setIsComplete(correct);
  };

  const resetPuzzle = () => {
    setUserInputs({});
    setIsComplete(false);
  };

  return (
    <main className="max-w-[1400px] mx-auto px-8 py-12">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8" onKeyDown={handleKeyDown} tabIndex={0}>
        {/* Across Clues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-2 border-black bg-white p-6 relative">
            <div className="absolute -top-4 -left-4 bg-purple-500 h-8 w-8 border-2 border-black transform -rotate-6"></div>
            
            <h2 className="text-2xl font-bold mb-4">Across</h2>
            <ul className="space-y-2">
              {puzzleData.clues.across.map((clue) => (
                <li 
                  key={`across-${clue.number}`}
                  className={`p-2 cursor-pointer border-l-4 transition-colors ${
                    isClueSelected(clue as { number: number; direction: "across" | "down" }) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                  onClick={() => handleClueClick(clue as CrosswordClue)}
                >
                  <span className="font-bold mr-2">{clue.number}.</span> 
                  {clue.clue}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Crossword Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Crossword Puzzle</h2>
            <div className="flex gap-4">
              <button 
                onClick={checkPuzzle} 
                className="flex items-center gap-2 bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
              >
                <Check className="w-4 h-4" />
                Check
              </button>
              <button 
                onClick={resetPuzzle} 
                className="flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
          
          <div className="aspect-square w-full max-w-[600px] mx-auto relative">
            <div className="absolute -top-3 -left-3 bg-blue-400 h-6 w-6 border-2 border-black transform rotate-12"></div>
            <div className="absolute -bottom-3 -right-3 bg-red-400 h-6 w-6 border-2 border-black transform -rotate-12"></div>
            
            <div 
              className="grid h-full"
              style={{ 
                gridTemplateColumns: `repeat(${puzzleData.size}, 1fr)`,
                gridTemplateRows: `repeat(${puzzleData.size}, 1fr)`,
                gap: '2px',
                backgroundColor: 'white'
              }}
            >
              {grid.map((row, rowIndex) => 
                row.map((cell, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      relative flex items-center justify-center cursor-pointer border border-black
                      ${cell.isBlack ? 'bg-black' : 'bg-white hover:bg-gray-50'} 
                      ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? 'bg-blue-100' : ''}
                      ${selectedCell?.row === rowIndex ? 'bg-blue-50/30' : ''}
                      ${selectedCell?.col === colIndex ? 'bg-blue-50/30' : ''}
                    `}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell.number && (
                      <span className="absolute top-1 left-1 text-[10px] font-bold text-gray-600">
                        {cell.number}
                      </span>
                    )}
                    {!cell.isBlack && (
                      <span className="text-xl font-bold">
                        {userInputs[`${rowIndex}-${colIndex}`] || ''}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {isComplete && (
            <div className="mt-6 p-4 bg-green-100 border-2 border-green-500 text-green-700 text-center">
              <p className="font-bold">Congratulations! You've completed the crossword!</p>
            </div>
          )}
        </div>
        
        {/* Down Clues */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border-2 border-black bg-white p-6 relative">
            <div className="absolute -bottom-4 -right-4 bg-yellow-500 h-8 w-8 border-2 border-black transform rotate-6"></div>
            
            <h2 className="text-2xl font-bold mb-4">Down</h2>
            <ul className="space-y-2">
              {puzzleData.clues.down.map((clue) => (
                <li 
                  key={`down-${clue.number}`}
                  className={`p-2 cursor-pointer border-l-4 transition-colors ${
                    isClueSelected(clue as { number: number; direction: "across" | "down" }) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                  onClick={() => handleClueClick(clue as CrosswordClue)}
                >
                  <span className="font-bold mr-2">{clue.number}.</span> 
                  {clue.clue}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* How to Play - Moved to bottom */}
      <div className="mt-12 border-2 border-black bg-white p-6 relative max-w-3xl mx-auto">
        <div className="absolute -top-4 -left-4 bg-green-500 h-8 w-8 border-2 border-black transform rotate-6"></div>
        <div className="absolute -bottom-4 -right-4 bg-blue-500 h-8 w-8 border-2 border-black transform -rotate-6"></div>
        
        <h2 className="text-2xl font-bold mb-4">How to Play</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Basic Controls</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="font-bold text-xl">•</span>
                <span>Click a cell and type a letter to fill it in</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-xl">•</span>
                <span>Click a cell twice to switch between across and down</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-xl">•</span>
                <span>Use arrow keys to move between cells</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="font-bold text-lg">Advanced Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="font-bold text-xl">•</span>
                <span>Click on a clue to jump to its starting position</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-xl">•</span>
                <span>Press Tab to cycle through clues in order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-xl">•</span>
                <span>Press Backspace to delete letters and move backward</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CrosswordPage;