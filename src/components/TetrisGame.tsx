'use client'

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef, JSX } from 'react'

// Tetris piece definitions
const TETROMINOS = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: '#00f0f0'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#f0f000'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#a000f0'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00f000'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#f00000'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#0000f0'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#f0a000'
  }
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_DROP_TIME = 1000

interface TetrisGameProps {
  onBlocksCleared: (blocks: number, lines: number, score: number, level: number) => void
  isPaused: boolean
}

export interface TetrisGameRef {
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  hardDrop: () => void
  softDrop: () => void
  isPaused: boolean
  pauseGame: () => void
  resumeGame: () => void
}

interface Piece {
  shape: number[][]
  color: string
  x: number
  y: number
}

const TetrisGame = forwardRef<TetrisGameRef, TetrisGameProps>(({ onBlocksCleared, isPaused }, ref) => {
  const [board, setBoard] = useState<string[][]>(() => 
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(''))
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState<number>(0)
  const [level, setLevel] = useState<number>(1)
  const [_linesCleared, setLinesCleared] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [internalPaused, setInternalPaused] = useState<boolean>(false)
  const dropTimeRef = useRef<number>(INITIAL_DROP_TIME)
  const lastDropTime = useRef<number>(0)
  const gameLoopRef = useRef<number>(0)

  const createRandomPiece = useCallback((): Piece => {
    const pieces = Object.keys(TETROMINOS) as Array<keyof typeof TETROMINOS>
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    const tetromino = TETROMINOS[randomPiece]
    
    return {
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2),
      y: 0
    }
  }, [])

  const isValidMove = useCallback((piece: Piece, newX: number, newY: number, newShape?: number[][]): boolean => {
    const shape = newShape || piece.shape
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x
          const boardY = newY + y
          
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false
          }
          
          if (boardY >= 0 && board[boardY][boardX]) {
            return false
          }
        }
      }
    }
    return true
  }, [board])

  const rotatePiece = useCallback((piece: Piece): number[][] => {
    const rotated = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    )
    return rotated
  }, [])

  const placePiece = useCallback((piece: Piece): void => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row])
      
      piece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell && piece.y + y >= 0) {
            newBoard[piece.y + y][piece.x + x] = piece.color
          }
        })
      })
      
      return newBoard
    })
  }, [])

  const clearLines = useCallback((): number => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard]
      const linesToClear: number[] = []
      
      // Find completed lines
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        if (newBoard[y].every(cell => cell !== '')) {
          linesToClear.push(y)
        }
      }
      
      // Remove completed lines and add new empty lines at top
      linesToClear.forEach(() => {
        for (let y = linesToClear[0]; y > 0; y--) {
          newBoard[y] = [...newBoard[y - 1]]
        }
        newBoard[0] = Array(BOARD_WIDTH).fill('')
      })
      
      if (linesToClear.length > 0) {
        const linesCleared = linesToClear.length
        const blocksCleared = linesCleared * BOARD_WIDTH
        const lineScore = [0, 100, 300, 500, 800][linesCleared] * level
        
        setScore(prev => {
          const newScore = prev + lineScore
          setLevel(Math.floor(newScore / 1000) + 1)
          return newScore
        })
        
        setLinesCleared(prev => {
          const newLinesCleared = prev + linesCleared
          onBlocksCleared(blocksCleared, newLinesCleared, score + lineScore, Math.floor((score + lineScore) / 1000) + 1)
          return newLinesCleared
        })
        
        // Increase speed
        dropTimeRef.current = Math.max(50, INITIAL_DROP_TIME - (level - 1) * 50)
      }
      
      return newBoard
    })
    
    return 0
  }, [level, score, onBlocksCleared])

  const moveLeft = useCallback((): void => {
    if (!currentPiece || gameOver || isPaused || internalPaused) return
    
    if (isValidMove(currentPiece, currentPiece.x - 1, currentPiece.y)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x - 1 } : null)
    }
  }, [currentPiece, gameOver, isPaused, internalPaused, isValidMove])

  const moveRight = useCallback((): void => {
    if (!currentPiece || gameOver || isPaused || internalPaused) return
    
    if (isValidMove(currentPiece, currentPiece.x + 1, currentPiece.y)) {
      setCurrentPiece(prev => prev ? { ...prev, x: prev.x + 1 } : null)
    }
  }, [currentPiece, gameOver, isPaused, internalPaused, isValidMove])

  const rotate = useCallback((): void => {
    if (!currentPiece || gameOver || isPaused || internalPaused) return
    
    const rotatedShape = rotatePiece(currentPiece)
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y, rotatedShape)) {
      setCurrentPiece(prev => prev ? { ...prev, shape: rotatedShape } : null)
    }
  }, [currentPiece, gameOver, isPaused, internalPaused, rotatePiece, isValidMove])

  const softDrop = useCallback((): void => {
    if (!currentPiece || gameOver || isPaused || internalPaused) return
    
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null)
      setScore(prev => prev + 1)
    }
  }, [currentPiece, gameOver, isPaused, internalPaused, isValidMove])

  const hardDrop = useCallback((): void => {
    if (!currentPiece || gameOver || isPaused || internalPaused) return
    
    let dropDistance = 0
    while (isValidMove(currentPiece, currentPiece.x, currentPiece.y + dropDistance + 1)) {
      dropDistance++
    }
    
    if (dropDistance > 0) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + dropDistance } : null)
      setScore(prev => prev + dropDistance * 2)
    }
  }, [currentPiece, gameOver, isPaused, internalPaused, isValidMove])

  const pauseGame = useCallback((): void => {
    setInternalPaused(true)
  }, [])

  const resumeGame = useCallback((): void => {
    setInternalPaused(false)
  }, [])

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    moveLeft,
    moveRight,
    rotate,
    hardDrop,
    softDrop,
    isPaused: isPaused || internalPaused,
    pauseGame,
    resumeGame
  }), [moveLeft, moveRight, rotate, hardDrop, softDrop, isPaused, internalPaused, pauseGame, resumeGame])

  // Initialize game
  useEffect(() => {
    const firstPiece = createRandomPiece()
    const secondPiece = createRandomPiece()
    setCurrentPiece(firstPiece)
    setNextPiece(secondPiece)
  }, [createRandomPiece])

  // Game loop
  useEffect(() => {
    if (gameOver || isPaused || internalPaused) return

    const gameLoop = (currentTime: number): void => {
      if (currentTime - lastDropTime.current > dropTimeRef.current) {
        if (currentPiece) {
          if (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
            setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : null)
          } else {
            placePiece(currentPiece)
            clearLines()
            
            // Check game over
            if (currentPiece.y <= 0) {
              setGameOver(true)
              return
            }
            
            // Spawn next piece
            setCurrentPiece(nextPiece)
            setNextPiece(createRandomPiece())
          }
        }
        lastDropTime.current = currentTime
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop)
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [currentPiece, nextPiece, gameOver, isPaused, internalPaused, isValidMove, placePiece, clearLines, createRandomPiece])

  // Render board with current piece
  const renderBoard = (): JSX.Element[] => {
    const displayBoard = board.map(row => [...row])
    
    // Add current piece to display
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell && currentPiece.y + y >= 0 && currentPiece.y + y < BOARD_HEIGHT) {
            displayBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color
          }
        })
      })
    }
    
    return displayBoard.flatMap((row, y) => 
      row.map((cell, x) => (
        <div
          key={`${y}-${x}`}
          className={`w-6 h-6 border border-gray-600 ${cell ? 'opacity-90' : 'bg-gray-900'}`}
          style={{ backgroundColor: cell || '#1f2937' }}
        />
      ))
    )
  }

  const restartGame = (): void => {
    setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill('')))
    setScore(0)
    setLevel(1)
    setLinesCleared(0)
    setGameOver(false)
    setInternalPaused(false)
    dropTimeRef.current = INITIAL_DROP_TIME
    const firstPiece = createRandomPiece()
    const secondPiece = createRandomPiece()
    setCurrentPiece(firstPiece)
    setNextPiece(secondPiece)
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {/* Main Game Board */}
      <div className="relative">
        <div 
          className="grid bg-gray-800 border-2 border-gray-600 p-2"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, minmax(0, 1fr))`
          }}
        >
          {renderBoard()}
        </div>
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
              <p className="mb-4">Final Score: {score.toLocaleString()}</p>
              <button
                onClick={restartGame}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Next Piece Preview */}
      <div className="bg-gray-800 border-2 border-gray-600 p-4 rounded">
        <h3 className="text-white font-bold mb-2">Next</h3>
        <div 
          className="grid gap-1"
          style={{ 
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(4, minmax(0, 1fr))'
          }}
        >
          {Array.from({ length: 16 }, (_, i) => {
            const x = i % 4
            const y = Math.floor(i / 4)
            const hasBlock = nextPiece?.shape[y]?.[x]
            
            return (
              <div
                key={i}
                className="w-4 h-4 border border-gray-600"
                style={{ 
                  backgroundColor: hasBlock ? nextPiece?.color : '#1f2937'
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
})

TetrisGame.displayName = 'TetrisGame'
export default TetrisGame