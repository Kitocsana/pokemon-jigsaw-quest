'use client'

import React, { useState, useEffect, useCallback, JSX } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PuzzlePiece {
  id: number
  unlocked: boolean
  position: { row: number; col: number }
  placed: boolean
}

interface PuzzleState {
  pieces: PuzzlePiece[]
  totalBlocks: number
  currentPuzzleIndex: number
  completedPuzzles: number
}

// Collection of different Pokémon images for variety
const POKEMON_IMAGES = [
  { 
    id: 25, 
    name: 'Pikachu', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
  },
  { 
    id: 6, 
    name: 'Charizard', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png'
  },
  { 
    id: 3, 
    name: 'Venusaur', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png'
  },
  { 
    id: 9, 
    name: 'Blastoise', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png'
  },
  { 
    id: 150, 
    name: 'Mewtwo', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png'
  },
  { 
    id: 151, 
    name: 'Mew', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png'
  },
  { 
    id: 144, 
    name: 'Articuno', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png'
  },
  { 
    id: 145, 
    name: 'Zapdos', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png'
  },
  { 
    id: 146, 
    name: 'Moltres', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png'
  },
  { 
    id: 149, 
    name: 'Dragonite', 
    url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png'
  }
]

interface JigsawPieceProps {
  row: number
  col: number
  isPlaced: boolean
  onClick?: () => void
  className?: string
  size?: number
  pokemonImageUrl: string
}

const JigsawPiece: React.FC<JigsawPieceProps> = ({ row, col, isPlaced, onClick, className = '', size = 80, pokemonImageUrl }) => {
  // Generate jigsaw piece shape with tabs and blanks based on position
  const hasTopTab = row > 0 && (row + col) % 3 === 0
  const hasRightTab = col < 5 && (row + col) % 3 === 1
  const hasBottomTab = row < 3 && (row + col) % 3 === 2
  const hasLeftTab = col > 0 && (row + col) % 2 === 0

  // Pokémon image URL is now passed as prop for dynamic puzzle generation
  
  // Calculate the piece's portion of the image (6x4 grid = 24 pieces)
  const pieceWidth = 100 / 6 // Each piece is 1/6 of total width
  const pieceHeight = 100 / 4 // Each piece is 1/4 of total height

  // Create SVG path for jigsaw piece shape
  const createJigsawPath = () => {
    const tabRadius = size * 0.15
    const center = size / 2
    
    let path = `M 10,10 `

    // Top edge
    if (hasTopTab) {
      path += `L ${center - tabRadius},10 C ${center - tabRadius},${10 - tabRadius} ${center + tabRadius},${10 - tabRadius} ${center + tabRadius},10 `
    }
    path += `L ${size - 10},10 `

    // Right edge  
    path += `L ${size - 10},${center - tabRadius} `
    if (hasRightTab) {
      path += `C ${size - 10 + tabRadius},${center - tabRadius} ${size - 10 + tabRadius},${center + tabRadius} ${size - 10},${center + tabRadius} `
    }
    path += `L ${size - 10},${size - 10} `

    // Bottom edge
    path += `L ${center + tabRadius},${size - 10} `
    if (hasBottomTab) {
      path += `C ${center + tabRadius},${size - 10 + tabRadius} ${center - tabRadius},${size - 10 + tabRadius} ${center - tabRadius},${size - 10} `
    }
    path += `L 10,${size - 10} `

    // Left edge
    path += `L 10,${center + tabRadius} `
    if (hasLeftTab) {
      path += `C ${10 - tabRadius},${center + tabRadius} ${10 - tabRadius},${center - tabRadius} 10,${center - tabRadius} `
    }
    path += `L 10,10 Z`

    return path
  }

  return (
    <div className={`relative cursor-pointer transition-all duration-300 ${className}`} onClick={onClick}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <filter id={`shadow-${row}-${col}`}>
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
          </filter>
        </defs>
        <defs>
          <pattern id={`image-${row}-${col}`} patternUnits="objectBoundingBox" width="1" height="1">
            <image 
              href={pokemonImageUrl} 
              width={size * 6} 
              height={size * 4}
              x={-col * size} 
              y={-row * size}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        </defs>
        <path
          d={createJigsawPath()}
          fill={`url(#image-${row}-${col})`}
          stroke="#2a2a2a"
          strokeWidth="2"
          filter={isPlaced ? `url(#shadow-${row}-${col})` : undefined}
          className={`transition-all duration-300 ${isPlaced ? 'opacity-90' : 'opacity-70'}`}
        />

      </svg>
    </div>
  )
}

export default function PuzzlePage(): JSX.Element {
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([])
  const [totalBlocksCleared, setTotalBlocksCleared] = useState<number>(0)
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null)
  const [puzzleComplete, setPuzzleComplete] = useState<boolean>(false)
  const [showSolution, setShowSolution] = useState<boolean>(false)
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0)
  const [completedPuzzles, setCompletedPuzzles] = useState<number>(0)

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('tetris-puzzle')
    if (savedProgress) {
      try {
        const data: PuzzleState = JSON.parse(savedProgress)
        setPuzzlePieces(data.pieces || [])
        setTotalBlocksCleared(data.totalBlocks || 0)
        setCurrentPuzzleIndex(data.currentPuzzleIndex || 0)
        setCompletedPuzzles(data.completedPuzzles || 0)
        
        // Check if puzzle is complete
        const pieces = data.pieces || []
        if (pieces.length > 0 && pieces.every((p: PuzzlePiece) => p.unlocked && p.placed)) {
          setPuzzleComplete(true)
          setShowSolution(true)
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error)
      }
    }
  }, [])

  // Save progress to localStorage
  const saveProgress = useCallback((pieces: PuzzlePiece[]) => {
    const progress: PuzzleState = {
      pieces: pieces,
      totalBlocks: totalBlocksCleared,
      currentPuzzleIndex: currentPuzzleIndex,
      completedPuzzles: completedPuzzles
    }
    localStorage.setItem('tetris-puzzle', JSON.stringify(progress))
  }, [totalBlocksCleared, currentPuzzleIndex, completedPuzzles])

  // Handle piece placement
  const placePiece = useCallback((pieceId: number, targetRow: number, targetCol: number) => {
    const piece = puzzlePieces.find(p => p.id === pieceId)
    if (!piece || !piece.unlocked) return

    // Check if this is the correct position for the piece
    const isCorrectPosition = piece.position.row === targetRow && piece.position.col === targetCol

    if (isCorrectPosition) {
      const updatedPieces = puzzlePieces.map(p => 
        p.id === pieceId ? { ...p, placed: true } : p
      )
      setPuzzlePieces(updatedPieces)
      saveProgress(updatedPieces)
      setSelectedPiece(null)

      // Check if puzzle is complete
      const allUnlockedPlaced = updatedPieces
        .filter(p => p.unlocked)
        .every(p => p.placed)
      
      if (allUnlockedPlaced && updatedPieces.filter(p => p.unlocked).length === 24) {
        setPuzzleComplete(true)
        setShowSolution(true)
        const currentPokemon = POKEMON_IMAGES[currentPuzzleIndex]
        setTimeout(() => {
          // Show completion notification with custom UI instead of alert
          const notification = document.createElement('div')
          notification.innerHTML = `
            <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div class="bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm border-yellow-400/50 border rounded-xl p-8 text-center max-w-md">
                <div class="text-6xl mb-4">🏆</div>
                <h2 class="text-3xl font-bold text-yellow-400 mb-4">Puzzle Complete!</h2>
                <p class="text-white text-xl mb-4">
                  Amazing! You've revealed <strong>${currentPokemon.name}</strong>!
                </p>
                <button onclick="this.parentElement.parentElement.remove()" class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-lg mb-4">
                  🎊 Awesome!
                </button>
              </div>
            </div>
          `
          document.body.appendChild(notification)
          
          // Auto-remove after 5 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification)
            }
          }, 5000)
        }, 500)
        
        // Update completed puzzles count
        setCompletedPuzzles(prev => prev + 1)
      }
    } else {
      // Wrong position - show feedback
      setTimeout(() => {
        // Create a simple notification instead of alert
        const notification = document.createElement('div')
        notification.innerHTML = '❌ That piece doesn&apos;t belong there! Try matching the image pattern.'
        notification.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-6 py-3 rounded-lg font-semibold z-50 animate-pulse'
        document.body.appendChild(notification)
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification)
          }
        }, 2000)
      }, 100)
    }
  }, [puzzlePieces, saveProgress, currentPuzzleIndex])

  // Render the jigsaw puzzle grid
  const renderJigsawGrid = (): JSX.Element => {
    const grid = []
    for (let row = 0; row < 4; row++) {
      const rowElements = []
      for (let col = 0; col < 6; col++) {
        const piece = puzzlePieces.find(p => p.position.row === row && p.position.col === col)
        const isSlotFilled = piece?.placed || showSolution
        
        rowElements.push(
          <div
            key={`${row}-${col}`}
            className={`flex items-center justify-center transition-all duration-300 ${
              isSlotFilled
                ? 'scale-100'
                : 'scale-95 opacity-50'
            }`}
            onClick={() => {
              if (selectedPiece !== null && !isSlotFilled) {
                placePiece(selectedPiece, row, col)
              }
            }}
          >
            {isSlotFilled ? (
              <JigsawPiece 
                row={row} 
                col={col} 
                isPlaced={true}
                className="hover:scale-105"
                pokemonImageUrl={POKEMON_IMAGES[currentPuzzleIndex].url}
              />
            ) : selectedPiece !== null ? (
              <div className="w-20 h-20 border-2 border-dashed border-yellow-400 rounded-lg flex items-center justify-center bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors">
                <span className="text-yellow-400 text-sm font-semibold">Drop Here?</span>
              </div>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              </div>
            )}
          </div>
        )
      }
      grid.push(
        <div key={row} className="flex justify-center gap-2">
          {rowElements}
        </div>
      )
    }
    return <div className="space-y-2">{grid}</div>
  }

  // Render available jigsaw pieces
  const renderAvailableJigsawPieces = (): JSX.Element => {
    const unlockedPieces = puzzlePieces.filter(p => p.unlocked && !p.placed)
    
    if (unlockedPieces.length === 0) {
      return (
        <div className="text-center text-white/60">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg mb-2">
            {puzzlePieces.filter(p => p.unlocked).length === 0 
              ? 'No jigsaw pieces unlocked yet!' 
              : 'All unlocked pieces have been placed!'}
          </p>
          <p className="text-sm">
            {puzzlePieces.filter(p => p.unlocked).length === 0
              ? 'Play Tetris and clear blocks to unlock Pokémon jigsaw pieces.'
              : 'Excellent work! Keep playing to unlock more pieces.'}
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center">
          {unlockedPieces.map((piece) => (
            <div
              key={piece.id}
              className={`transition-all duration-200 hover:scale-110 ${
                selectedPiece === piece.id
                  ? 'scale-105 drop-shadow-lg ring-4 ring-yellow-400/50'
                  : 'hover:drop-shadow-md'
              }`}
              onClick={() => setSelectedPiece(selectedPiece === piece.id ? null : piece.id)}
            >
              <JigsawPiece 
                row={piece.position.row} 
                col={piece.position.col} 
                isPlaced={false}
                className="hover:drop-shadow-lg"
                size={70}
                pokemonImageUrl={POKEMON_IMAGES[currentPuzzleIndex].url}
              />
            </div>
          ))}
        </div>
        
        <div className="text-center text-white/70 text-sm bg-white/5 rounded-lg p-3">
          {selectedPiece !== null ? (
            <p className="font-semibold text-yellow-400">
              🎯 Piece selected! Click anywhere on the puzzle grid to try placing it.
            </p>
          ) : (
            <p>
              Click on a jigsaw piece above to select it, then click on the puzzle grid to place it!
            </p>
          )}
        </div>
      </div>
    )
  }

  // Get completion percentage
  const getCompletionPercentage = (): number => {
    const unlockedPieces = puzzlePieces.filter(p => p.unlocked)
    const placedPieces = puzzlePieces.filter(p => p.unlocked && p.placed)
    return unlockedPieces.length > 0 ? (placedPieces.length / unlockedPieces.length) * 100 : 0
  }

  // Get level title based on progress
  const getProgressLevel = (): { title: string; color: string } => {
    const completion = getCompletionPercentage()
    
    if (completion === 0) return { title: "Pokémon Trainer", color: "text-gray-400" }
    if (completion < 25) return { title: "Puzzle Explorer", color: "text-blue-400" }
    if (completion < 50) return { title: "Jigsaw Specialist", color: "text-green-400" }
    if (completion < 75) return { title: "Puzzle Master", color: "text-purple-400" }
    if (completion < 100) return { title: "Legendary Assembler", color: "text-yellow-400" }
    return { title: "Pokémon Jigsaw Champion", color: "text-red-400" }
  }

  const progressLevel = getProgressLevel()
  const unlockedCount = puzzlePieces.filter(p => p.unlocked).length
  const placedCount = puzzlePieces.filter(p => p.placed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Button 
          onClick={() => window.location.href = '/'}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-4 py-2"
        >
          🎮 Back to Game
        </Button>
      </div>

      <div className="max-w-7xl mx-auto pt-16">
        {/* Header */}
        <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20 text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-4">🧩 {POKEMON_IMAGES[currentPuzzleIndex].name} Jigsaw Puzzle</h1>
          <div className="flex justify-center items-center gap-4 mb-4 flex-wrap">
            <div className={`px-4 py-2 rounded-full bg-white/10 ${progressLevel.color} font-semibold`}>
              {progressLevel.title}
            </div>
            <div className="text-white/70">
              Progress: {placedCount}/{unlockedCount} pieces placed
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          <p className="text-white/80">
            {unlockedCount === 0 
              ? "Play Tetris to start unlocking Pokémon jigsaw pieces!"
              : placedCount === unlockedCount && unlockedCount === 24
              ? "Jigsaw complete! You've revealed the legendary Pokémon!"
              : placedCount === unlockedCount
              ? "All unlocked pieces placed! Play more Tetris to unlock remaining pieces."
              : "Drag the jigsaw pieces to their correct positions to reveal the hidden Pokémon!"}
          </p>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Jigsaw Puzzle Grid */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <h2 className="text-2xl font-bold text-white text-center mb-4">🎯 {POKEMON_IMAGES[currentPuzzleIndex].name} Puzzle (6×4)</h2>
            <div className="flex justify-center">
              <div className="w-full max-w-lg">
                {renderJigsawGrid()}
              </div>
            </div>
            {selectedPiece !== null && (
              <div className="text-center text-yellow-400 text-sm mt-4 font-semibold animate-pulse bg-yellow-400/10 rounded-lg p-2">
                🎯 Piece selected - Find its perfect spot by matching the image pattern!
              </div>
            )}
          </Card>

          {/* Available Jigsaw Pieces */}
          <Card className="p-6 bg-white/10 backdrop-blur-sm border-white/20">
            <h2 className="text-2xl font-bold text-white text-center mb-4">📦 Available Jigsaw Pieces</h2>
            {renderAvailableJigsawPieces()}
            
            {unlockedCount > 0 && (
              <div className="mt-6 text-center">
                <div className="text-white/70 text-sm space-y-1 bg-white/5 rounded-lg p-4">
                  <p><span className="font-semibold text-white">Unlocked:</span> {unlockedCount}/24 pieces</p>
                  <p><span className="font-semibold text-white">Placed correctly:</span> {placedCount}/{unlockedCount}</p>
                  <p><span className="font-semibold text-white">Total blocks cleared:</span> {totalBlocksCleared}</p>
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <p className="text-xs text-white/50">Every 7 blocks cleared = 1 new piece</p>
                    <p className="text-xs text-white/50">Completed puzzles: {completedPuzzles}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Victory Message */}
        {puzzleComplete && (
          <Card className="mt-6 p-8 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm border-yellow-400/50 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4">Legendary Achievement Unlocked!</h2>
            <p className="text-white text-xl mb-4">
              Incredible! You've successfully assembled the complete {POKEMON_IMAGES[currentPuzzleIndex].name} jigsaw puzzle!
            </p>
            <p className="text-2xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-6">
              &ldquo;{POKEMON_IMAGES[currentPuzzleIndex].name} Has Been Revealed!&rdquo;
            </p>
            <p className="text-white/80 mb-6">
              Your puzzle-solving mastery and Tetris skills have uncovered {POKEMON_IMAGES[currentPuzzleIndex].name}! You are truly a Pokémon Jigsaw Champion!
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  // Start next puzzle instead of clearing everything
                  const nextPuzzleIndex = (currentPuzzleIndex + 1) % POKEMON_IMAGES.length
                  const newProgress: PuzzleState = {
                    pieces: Array.from({ length: 24 }, (_, i) => ({
                      id: i,
                      unlocked: false,
                      position: { row: Math.floor(i / 6), col: i % 6 },
                      placed: false
                    })),
                    totalBlocks: 0,
                    currentPuzzleIndex: nextPuzzleIndex,
                    completedPuzzles: completedPuzzles + 1
                  }
                  localStorage.setItem('tetris-puzzle', JSON.stringify(newProgress))
                  window.location.href = '/'
                }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3"
              >
                🎮 Next Pokémon Puzzle
              </Button>
              <Button
                onClick={() => setShowSolution(false)}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3"
              >
                🔍 Hide Solution
              </Button>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6 p-6 bg-white/5 backdrop-blur-sm border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">📚 How To Play Pokémon Jigsaw Quest</h3>
          <div className="text-white/70 space-y-2 text-sm">
            <p>🎮 <strong>Play Tetris:</strong> Clear blocks to unlock authentic jigsaw puzzle pieces</p>
            <p>🧩 <strong>Unlock System:</strong> Every 7 blocks cleared unlocks a new jigsaw piece (20-30% more challenging!)</p>
            <p>🎯 <strong>Assembly:</strong> Click on available pieces to select them, then click on the correct spot</p>
            <p>🔍 <strong>Placement:</strong> Each jigsaw piece has unique tabs and blanks - only one correct position</p>
            <p>🏆 <strong>Victory:</strong> Assemble all 24 pieces to reveal the complete hidden Pokémon picture</p>
            <p>💾 <strong>Progress:</strong> Your puzzle progress is automatically saved, continue anytime!</p>
          </div>
        </Card>
      </div>
    </div>
  )
}