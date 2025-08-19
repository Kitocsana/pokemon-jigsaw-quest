'use client'

import React, { JSX, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface PieceNotificationProps {
  show: boolean
  message: string
  onClose: () => void
  duration?: number
}

export default function PieceNotification({ show, message, onClose, duration = 8000 }: PieceNotificationProps): JSX.Element | null {
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // Wait for animation to complete
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  const handleViewPiece = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
      router.push('/puzzle')
    }, 300)
  }

  const handleContinuePlaying = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  if (!show && !isVisible) return null

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl shadow-2xl border border-white/20 backdrop-blur-sm max-w-md">
        <div className="text-center">
          <div className="text-4xl mb-3">🧩</div>
          <h3 className="text-xl font-bold mb-2">Puzzle Piece Unlocked!</h3>
          <p className="text-white/90 mb-4">{message}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleViewPiece}
              className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
            >
              🔍 View Piece
            </button>
            
            <button
              onClick={handleContinuePlaying}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            >
              🎮 Continue Playing
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}