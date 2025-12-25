'use client'

import './App.css';
import { useState, useEffect, useCallback, memo } from 'react';

const PATTERNS = {
  glider: {
    name: 'Glider',
    cells: [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
  },
  blinker: {
    name: 'Blinker',
    cells: [[0, 0], [0, 1], [0, 2]]
  },
  toad: {
    name: 'Toad',
    cells: [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]]
  },
  beacon: {
    name: 'Beacon',
    cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]]
  },
  pulsar: {
    name: 'Pulsar',
    cells: [
      [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
      [2, 0], [2, 5], [2, 7], [2, 12],
      [3, 0], [3, 5], [3, 7], [3, 12],
      [4, 0], [4, 5], [4, 7], [4, 12],
      [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
      [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
      [8, 0], [8, 5], [8, 7], [8, 12],
      [9, 0], [9, 5], [9, 7], [9, 12],
      [10, 0], [10, 5], [10, 7], [10, 12],
      [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10]
    ]
  },
  gosperGliderGun: {
    name: 'Gosper Glider Gun',
    cells: [
      [0, 24],
      [1, 22], [1, 24],
      [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
      [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35],
      [4, 0], [4, 1], [4, 10], [4, 16], [4, 20], [4, 21],
      [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17], [5, 22], [5, 24],
      [6, 10], [6, 16], [6, 24],
      [7, 11], [7, 15],
      [8, 12], [8, 13]
    ]
  }
};

function deepCloneWorld(world) {
  return world.map(row => row.slice());
}

export default function Home() {
  const [maxCol, setMaxCol] = useState(30);
  const [maxRow, setMaxRow] = useState(20);
  const [world, setWorld] = useState(Array(20).fill(null).map(row => new Array(30).fill(null)));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const newWorld = Array(maxRow).fill(null).map(row => new Array(maxCol).fill(null));
    setWorld(newWorld);
    setGeneration(0);
  }, [maxRow, maxCol]);

  const getNeighbours = useCallback((world, row, col, maxRow, maxCol) => {
    let num = 0;

    if (row > 0)
    {
        if (col > 0)
        {
            if (world[row-1][col-1])
                num++;
        }
        if (world[row-1][col])
            num++;
        if (col < maxCol - 1)
        {
            if (world[row-1][col+1])
                num++;
        }
    }
    if (col > 0)
    {
        if (world[row][col - 1])
            num++;
    }
    if (col < maxCol - 1)
    {
        if (world[row][col + 1])
            num++;
    }
    if (row < maxRow - 1)
    {
        if (col > 0)
        {
            if (world[row + 1][col - 1])
                num++;
        }
        if (world[row + 1][col])
            num++;
        if (col < maxCol - 1)
        {
            if (world[row + 1][col + 1])
                num++;
        }
    }

    return num;
  }, []);

  const play = useCallback(() => {
    const nextWorld = deepCloneWorld(world);
    let isModified = false;
    let n = 0;
    let deads = [];
    let lives = [];

    for (let row = 0; row < maxRow; row++) {
      for (let col = 0; col < maxCol; col++) {
        n = getNeighbours(world, row, col, maxRow, maxCol);
        if (!nextWorld[row][col] && n === 3) {
          lives.push(new Point(row, col));
        } else if (nextWorld[row][col] === 'X' && (n < 2 || n > 3)) {
          deads.push(new Point(row, col));
        }
      }
    }

    if (lives.length > 0 || deads.length > 0) {
      isModified = true;
    }

    for (let i of lives) {
      nextWorld[i.getX()][i.getY()] = 'X';
    }

    for (let i of deads) {
      nextWorld[i.getX()][i.getY()] = null;
    }

    if (isModified) {
      setWorld(nextWorld);
      setGeneration(prev => prev + 1);
    }
  }, [world, maxRow, maxCol, getNeighbours]);

  useEffect(() => {
    if (isRunning) {
      let timer = setTimeout(() => {
        play();
      }, speed);

      return () => clearTimeout(timer)
    }
  }, [isRunning, play, speed]);

  const start = useCallback(() => {
    console.log("start");
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const handlePlay = useCallback((currentWorld) => {
    setWorld(currentWorld);
  }, []);

  const clearGrid = useCallback(() => {
    const newWorld = Array(maxRow).fill(null).map(row => new Array(maxCol).fill(null));
    setWorld(newWorld);
    setGeneration(0);
  }, [maxRow, maxCol]);

  const randomFill = useCallback(() => {
    const newWorld = Array(maxRow).fill(null).map(row => 
      new Array(maxCol).fill(null).map(() => Math.random() > 0.7 ? 'X' : null)
    );
    setWorld(newWorld);
    setGeneration(0);
  }, [maxRow, maxCol]);

  const loadPattern = useCallback((patternKey) => {
    const pattern = PATTERNS[patternKey];
    const newWorld = Array(maxRow).fill(null).map(row => new Array(maxCol).fill(null));
    
    const offsetRow = Math.floor(maxRow / 2) - 5;
    const offsetCol = Math.floor(maxCol / 2) - 5;
    
    pattern.cells.forEach(([row, col]) => {
      const newRow = row + offsetRow;
      const newCol = col + offsetCol;
      if (newRow >= 0 && newRow < maxRow && newCol >= 0 && newCol < maxCol) {
        newWorld[newRow][newCol] = 'X';
      }
    });
    
    setWorld(newWorld);
    setGeneration(0);
  }, [maxRow, maxCol]);

  const handleGridSizeChange = useCallback((rows, cols) => {
    setMaxRow(rows);
    setMaxCol(cols);
  }, []);

  return (
    <main>
      <div className="full-width">
        <h1>LifeGame</h1>
        <div className="generation-counter">Generation: {generation}</div>
      </div>
      
      <div className="controls-section">
        <div className="control-group">
          <h3>Grid Size</h3>
          <label>
            Rows: 
            <input 
              type="number" 
              value={maxRow} 
              onChange={(e) => handleGridSizeChange(parseInt(e.target.value) || 1, maxCol)}
              min="5"
              max="50"
              disabled={isRunning}
            />
          </label>
          <label>
            Columns: 
            <input 
              type="number" 
              value={maxCol} 
              onChange={(e) => handleGridSizeChange(maxRow, parseInt(e.target.value) || 1)}
              min="5"
              max="50"
              disabled={isRunning}
            />
          </label>
        </div>

        <div className="control-group">
          <h3>Speed</h3>
          <label>
            <input 
              type="range" 
              min="100" 
              max="2000" 
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="slider"
            />
            <span className="speed-value">{speed}ms</span>
          </label>
        </div>

        <div className="control-group">
          <h3>Patterns</h3>
          <div className="pattern-buttons">
            {Object.keys(PATTERNS).map(key => (
              <button 
                key={key}
                className='button-pattern' 
                onClick={() => loadPattern(key)}
                disabled={isRunning}
              >
                {PATTERNS[key].name}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <h3>Controls</h3>
          <button className='button-3' onClick={start} disabled={isRunning}>Start</button>
          <button className='button-3' onClick={stop} disabled={!isRunning}>Stop</button>
          <button className='button-3' onClick={clearGrid} disabled={isRunning}>Clear</button>
          <button className='button-3' onClick={randomFill} disabled={isRunning}>Random</button>
        </div>
      </div>

      <div className="board">
        <Board 
          world={world} 
          onPlay={handlePlay} 
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          isRunning={isRunning}
        />
      </div>
    </main>
  )
}

const Board = memo(function Board({world, onPlay, isDragging, setIsDragging, isRunning}) {
  const click = useCallback((row, col) => {
    if (isRunning) return;
    console.log( row + ', ' + col);

    const nextWorld = deepCloneWorld(world);
    nextWorld[row][col] = nextWorld[row][col] ? null : 'X';
    onPlay(nextWorld);
  }, [world, onPlay, isRunning]);

  const handleMouseDown = useCallback((row, col) => {
    if (isRunning) return;
    setIsDragging(true);
    const nextWorld = deepCloneWorld(world);
    nextWorld[row][col] = 'X';
    onPlay(nextWorld);
  }, [world, onPlay, setIsDragging, isRunning]);

  const handleMouseEnter = useCallback((row, col) => {
    if (isDragging && !isRunning) {
      const nextWorld = deepCloneWorld(world);
      nextWorld[row][col] = 'X';
      onPlay(nextWorld);
    }
  }, [isDragging, isRunning, world, onPlay]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [setIsDragging]);

  console.log('Board:');
  console.log(world);

  return (
    <div className="board" onMouseUp={handleMouseUp}>
      {world.map((item, index) => {
        const key = index * 100 + 100;
        return (
          <div className="board-row" key={key}>
            {item.map((subItem, sIndex) => {
              const key = (index * 10) + sIndex;
              return ( 
                <Square 
                  val={subItem} 
                  key={key} 
                  click={() => click(index, sIndex)}
                  onMouseDown={() => handleMouseDown(index, sIndex)}
                  onMouseEnter={() => handleMouseEnter(index, sIndex)}
                /> 
              );
            })}
          </div>
        );
      })}
    </div>
  );
});

const Square = memo(function Square({ val, click, onMouseDown, onMouseEnter }) {
  return (
    <button 
      className="square" 
      onClick={click}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
    >
      {val}
    </button>
  );
});

class Point {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  setX(x) {
    this.x = x;
  }

  getX() {
    return this.x;
  }

  setY(y) {
    this.y = y;
  }

  getY() {
    return this.y;
  }
}
