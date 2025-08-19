'use client'

import React from 'react'

interface GameStatsProps {
  score: number
  level: number
  linesCleared: number
  blocksCleared: number
  jigsawPieces: number
  isMobile: boolean
}

const GameStats: React.FC<GameStatsProps> = ({
  score,
  level,
  linesCleared,
  blocksCleared,
  jigsawPieces,
  isMobile
}) => {
  return (
    <div className={`fixed ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} z-40`}>
      <div className="bg-gray-800/90 backdrop-blur-sm text-white rounded-lg p-3 min-w-[140px]">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Score:</span>
            <span className="font-mono font-semibold text-yellow-400">
              {score.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Level:</span>
            <span className="font-mono font-semibold text-blue-400">
              {level}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Lines:</span>
            <span className="font-mono font-semibold text-green-400">
              {linesCleared}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Blocks:</span>
            <span className="font-mono font-semibold text-purple-400">
              {blocksCleared}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t border-gray-600 pt-1 mt-2">
            <span className="text-gray-300">🧩 Pieces:</span>
            <span className="font-mono font-semibold text-pink-400">
              {jigsawPieces}/24
            </span>
          </div>
          
          {!isMobile && (
            <div className="text-xs text-gray-400 mt-2 pt-1 border-t border-gray-600">
              Mobile: {isMobile ? 'Yes' : 'No'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default GameStats;