'use client'

import React, { useState, useEffect, useCallback, useRef, JSX } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TetrisGame from '@/components/TetrisGame'
import GameStats from '@/components/GameStats'
import MobileControls from '@/components/MobileControls'
import PieceNotification from '@/components/PieceNotification'

import { sdk } from '@farcaster/miniapp-sdk'

interface TetrisGameRef {
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  hardDrop: () => void
  softDrop: () => void
  isPaused: boolean
  pauseGame: () => void
  resumeGame: () => void
}

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

export default function TetrisPage(): JSX.Element {
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(void 0)
            } else {
              window.addEventListener('load', () => resolve(void 0), { once: true })
            }
          })
        }
        
        await sdk.actions.ready()
        console.log('Farcaster SDK initialized successfully - app fully loaded')
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error)
        setTimeout(async () => {
          try {
            await sdk.actions.ready()
            console.log('Farcaster SDK initialized on retry')
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError)
          }
        }, 1000)
      }
    }

    initializeFarcaster()
  }, [])

  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [totalBlocksCleared, setTotalBlocksCleared] = useState<number>(0)
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([])
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0)
  const [completedPuzzles, setCompletedPuzzles] = useState<number>(0)
  const [score, setScore] = useState<number>(0)
  const [level, setLevel] = useState<number>(1)
  const [linesCleared, setLinesCleared] = useState<number>(0)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [showNotification, setShowNotification] = useState<boolean>(false)
  const [notificationMessage, setNotificationMessage] = useState<string>('')
  const tetrisRef = useRef<TetrisGameRef>(null)

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize puzzle pieces (6x4 grid = 24 pieces)
  useEffect(() => {
    const initializePuzzle = () => {
      const pieces: PuzzlePiece[] = []
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 6; col++) {
          pieces.push({
            id: row * 6 + col,
            unlocked: false,
            position: { row, col },
            placed: false
          })
        }
      }
      return pieces
    }

    const savedProgress = localStorage.getItem('tetris-puzzle')
    if (savedProgress) {
      try {
        const data: PuzzleState = JSON.parse(savedProgress)
        setPuzzlePieces(data.pieces || initializePuzzle())
        setTotalBlocksCleared(data.totalBlocks || 0)
        setCurrentPuzzleIndex(data.currentPuzzleIndex || 0)
        setCompletedPuzzles(data.completedPuzzles || 0)
      } catch (error) {
        console.error('Failed to load saved progress:', error)
        setPuzzlePieces(initializePuzzle())
      }
    } else {
      setPuzzlePieces(initializePuzzle())
    }
  }, [])

  // Save progress to localStorage
  useEffect(() => {
    if (puzzlePieces.length > 0) {
      const progress: PuzzleState = {
        pieces: puzzlePieces,
        totalBlocks: totalBlocksCleared,
        currentPuzzleIndex: currentPuzzleIndex,
        completedPuzzles: completedPuzzles
      }
      localStorage.setItem('tetris-puzzle', JSON.stringify(progress))
    }
  }, [puzzlePieces, totalBlocksCleared, currentPuzzleIndex, completedPuzzles])

  // Generate puzzle pieces based on progress
  const generatePuzzlePieces = useCallback((collectionLevel: number): PuzzlePiece[] => {
    const piecesToUnlock = Math.min(collectionLevel, 24) // Maximum 24 pieces
    
    return puzzlePieces.map((piece, index) => ({
      ...piece,
      unlocked: index < piecesToUnlock
    }))
  }, [puzzlePieces])

  // Handle blocks cleared from Tetris
  const handleBlocksCleared = useCallback((blocks: number, lines: number, currentScore: number, currentLevel: number) => {
    setTotalBlocksCleared(prev => {
      const newTotal = prev + blocks
      
      // Calculate how many puzzle pieces should be unlocked based on 20-30% more challenging milestones
      // Using 7 blocks per piece to make it more challenging (about 25% harder than before)
      const totalPiecesToUnlock = 24
      const blocksPerPiece = 7 // Increased from 5 to 7 for more challenge (about 25% harder)
      const piecesToUnlock = Math.min(Math.floor(newTotal / blocksPerPiece), totalPiecesToUnlock)
      
      const currentUnlockedCount = puzzlePieces.filter(p => p.unlocked).length
      
      if (piecesToUnlock > currentUnlockedCount) {
        const newPieces = generatePuzzlePieces(piecesToUnlock)
        setPuzzlePieces(newPieces)
        
        // Show notification
        setTimeout(() => {
          const newlyUnlocked = piecesToUnlock - currentUnlockedCount
          setNotificationMessage(`You received ${newlyUnlocked} new jigsaw ${newlyUnlocked === 1 ? 'piece' : 'pieces'}! You now have ${piecesToUnlock}/24 pieces for Puzzle #${currentPuzzleIndex + 1}. Visit the puzzle page to assemble them!`)
          setShowNotification(true)
        }, 500)
      }
      
      return newTotal
    })
    setLinesCleared(lines)
    setScore(currentScore)
    setLevel(currentLevel)
  }, [puzzlePieces, generatePuzzlePieces, currentPuzzleIndex])

  // Mobile control handlers
  const handleMobileControl = useCallback((action: string) => {
    if (!tetrisRef.current) return
    
    switch (action) {
      case 'left':
        tetrisRef.current.moveLeft()
        break
      case 'right':
        tetrisRef.current.moveRight()
        break
      case 'rotate':
        tetrisRef.current.rotate()
        break
      case 'drop':
        tetrisRef.current.hardDrop()
        break
      case 'down':
        tetrisRef.current.softDrop()
        break
    }
  }, [])

  // Keyboard controls for desktop
  useEffect(() => {
    if (!gameStarted) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!tetrisRef.current) return
      
      switch (e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          tetrisRef.current.moveLeft()
          break
        case 'd':
        case 'arrowright':
          tetrisRef.current.moveRight()
          break
        case 'w':
        case 'arrowup':
        case ' ':
          tetrisRef.current.rotate()
          break
        case 's':
        case 'arrowdown':
          tetrisRef.current.softDrop()
          break
        case 'enter':
          tetrisRef.current.hardDrop()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStarted])

  const unlockedPiecesCount = puzzlePieces.filter(p => p.unlocked).length

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="p-8 bg-white/10 backdrop-blur-sm border-white/20 text-center max-w-md">
          <h1 className="text-4xl font-bold text-white mb-4">🧩 Pokémon Jigsaw Quest</h1>
          <p className="text-white/80 mb-6">
            Play Tetris to unlock Pokémon jigsaw pieces! Clear blocks to collect puzzle pieces and reveal the hidden Pokémon picture.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setGameStarted(true)}
              size="lg"
              className="bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-semibold px-8 py-3 text-lg"
            >
              Start Playing
            </Button>
            <Button 
              onClick={() => window.location.href = '/puzzle'}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg"
            >
              View Puzzle ({unlockedPiecesCount}/24 pieces)
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 md:p-4">
      {/* Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <Button 
          onClick={() => window.location.href = '/puzzle'}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2"
        >
          🧩 Puzzle ({unlockedPiecesCount}/24)
        </Button>
      </div>

      {/* Game Stats */}
      <GameStats 
        score={score}
        level={level}
        linesCleared={linesCleared}
        blocksCleared={totalBlocksCleared}
        jigsawPieces={unlockedPiecesCount}
        isMobile={isMobile}
      />

      {/* Desktop Controls Info */}
      {!isMobile && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-gray-800/80 text-white px-4 py-2 rounded-lg text-sm z-40">
          <div className="flex gap-4">
            <span>A/← Move Left</span>
            <span>D/→ Move Right</span>
            <span>W/↑/Space Rotate</span>
            <span>S/↓ Soft Drop</span>
            <span>Enter Hard Drop</span>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex justify-center items-center min-h-screen pt-16 md:pt-8">
        <div className="relative">
          <TetrisGame 
            ref={tetrisRef}
            onBlocksCleared={handleBlocksCleared}
            isPaused={false}
          />
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && (
        <MobileControls 
          onControl={handleMobileControl}
          disabled={false}
        />
      )}

      {/* Progress Indicator */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 text-white px-4 py-2 rounded-lg text-sm">
        <div className="flex gap-4 items-center">
          <span>Puzzle pieces: {unlockedPiecesCount}/24</span>
          <span>•</span>
          <span>Next piece in: {7 - (totalBlocksCleared % 7)} blocks</span>
        </div>
      </div>

      {/* Piece Notification */}
      <PieceNotification 
        show={showNotification}
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />
    </div>
  )
}
