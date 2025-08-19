'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface MobileControlsProps {
  onControl: (action: string) => void
  disabled: boolean
}

const MobileControls: React.FC<MobileControlsProps> = ({ onControl, disabled }) => {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div className="flex justify-center items-end gap-4">
        {/* Movement Controls */}
        <div className="flex flex-col items-center gap-2">
          <Button
            onTouchStart={() => !disabled && onControl('rotate')}
            onMouseDown={() => !disabled && onControl('rotate')}
            disabled={disabled}
            className="w-16 h-16 rounded-full bg-blue-600/80 hover:bg-blue-700/80 text-white font-bold text-lg disabled:bg-gray-600/50 disabled:text-gray-400 backdrop-blur-sm"
          >
            ↻
          </Button>
          
          <div className="flex gap-2">
            <Button
              onTouchStart={() => !disabled && onControl('left')}
              onMouseDown={() => !disabled && onControl('left')}
              disabled={disabled}
              className="w-14 h-14 rounded-full bg-purple-600/80 hover:bg-purple-700/80 text-white font-bold text-lg disabled:bg-gray-600/50 disabled:text-gray-400 backdrop-blur-sm"
            >
              ←
            </Button>
            
            <Button
              onTouchStart={() => !disabled && onControl('down')}
              onMouseDown={() => !disabled && onControl('down')}
              disabled={disabled}
              className="w-14 h-14 rounded-full bg-yellow-600/80 hover:bg-yellow-700/80 text-white font-bold text-lg disabled:bg-gray-600/50 disabled:text-gray-400 backdrop-blur-sm"
            >
              ↓
            </Button>
            
            <Button
              onTouchStart={() => !disabled && onControl('right')}
              onMouseDown={() => !disabled && onControl('right')}
              disabled={disabled}
              className="w-14 h-14 rounded-full bg-purple-600/80 hover:bg-purple-700/80 text-white font-bold text-lg disabled:bg-gray-600/50 disabled:text-gray-400 backdrop-blur-sm"
            >
              →
            </Button>
          </div>
        </div>

        {/* Drop Control */}
        <div className="flex flex-col items-center">
          <Button
            onTouchStart={() => !disabled && onControl('drop')}
            onMouseDown={() => !disabled && onControl('drop')}
            disabled={disabled}
            className="w-20 h-20 rounded-full bg-red-600/80 hover:bg-red-700/80 text-white font-bold text-sm disabled:bg-gray-600/50 disabled:text-gray-400 backdrop-blur-sm"
          >
            DROP
          </Button>
        </div>
      </div>
      
      {disabled && (
        <div className="text-center mt-2">
          <span className="text-white/70 text-sm bg-gray-800/80 px-3 py-1 rounded-full backdrop-blur-sm">
            Answer the trivia question to continue!
          </span>
        </div>
      )}
    </div>
  )
}
export default MobileControls