// ==================================================
// CELEBRATION MODAL COMPONENT  
// Premium celebration system for achievements and milestones
// ==================================================

'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Sparkles, Trophy, Target, DollarSign, TrendingUp, Award } from 'lucide-react'
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { playCelebrationFeedback, initializeCelebrationPreferences } from '@/lib/utils/celebration-sounds'
import type { CelebrationConfig, CelebrationType } from '@/types/gamification'

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  config: CelebrationConfig
}

export function CelebrationModal({ isOpen, onClose, config }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  // Initialize preferences on mount
  useEffect(() => {
    initializeCelebrationPreferences()
  }, [])

  useEffect(() => {
    if (isOpen) {
      // Play premium feedback when modal opens
      playCelebrationFeedback(config.type)
      
      if (config.showConfetti) {
        setShowConfetti(true)
        const timer = setTimeout(() => setShowConfetti(false), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [isOpen, config.showConfetti, config.type])

  const celebrationStyles = {
    subtle: {
      backdrop: 'bg-gradient-to-br from-slate-900/40 via-gray-900/30 to-slate-800/40 backdrop-blur-2xl',
      container: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 via-gray-50/90 to-white/85 backdrop-blur-3xl border border-white/40 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] ring-1 ring-white/20',
      title: 'text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent',
      message: 'text-base text-slate-600 font-medium',
      animation: 'gentle',
      glowColor: 'from-slate-400/20 to-gray-400/20',
      iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
      accentColor: '#64748b'
    },
    medium: {
      backdrop: 'bg-gradient-to-br from-blue-900/50 via-indigo-900/40 to-purple-900/30 backdrop-blur-2xl',
      container: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/95 via-indigo-50/90 to-white/85 backdrop-blur-3xl border border-blue-200/60 shadow-[0_32px_64px_-12px_rgba(59,130,246,0.3)] ring-1 ring-blue-300/30',
      title: 'text-2xl font-bold bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-600 bg-clip-text text-transparent',
      message: 'text-base text-blue-700 font-medium',
      animation: 'bounce',
      glowColor: 'from-blue-400/30 to-indigo-400/20',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      accentColor: '#3b82f6'
    },
    major: {
      backdrop: 'bg-gradient-to-br from-purple-900/60 via-pink-900/50 to-rose-900/40 backdrop-blur-2xl',
      container: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50/95 via-pink-50/90 to-rose-50/85 backdrop-blur-3xl border border-purple-300/60 shadow-[0_32px_64px_-12px_rgba(168,85,247,0.4)] ring-1 ring-purple-300/40',
      title: 'text-3xl font-bold bg-gradient-to-r from-purple-800 via-pink-700 to-rose-600 bg-clip-text text-transparent',
      message: 'text-lg text-purple-700 font-semibold',
      animation: 'dramatic',
      glowColor: 'from-purple-400/40 to-pink-400/30',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      accentColor: '#a855f7'
    },
    epic: {
      backdrop: 'bg-gradient-to-br from-amber-900/70 via-orange-900/60 to-red-900/50 backdrop-blur-2xl',
      container: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-red-50/85 backdrop-blur-3xl border-2 border-amber-300/70 shadow-[0_32px_64px_-12px_rgba(245,158,11,0.5)] ring-1 ring-amber-400/50',
      title: 'text-4xl font-bold bg-gradient-to-r from-amber-800 via-orange-700 to-red-600 bg-clip-text text-transparent drop-shadow-sm',
      message: 'text-xl text-orange-800 font-bold',
      animation: 'explosive',
      glowColor: 'from-amber-400/50 to-orange-400/40',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      accentColor: '#f59e0b'
    }
  }

  const style = celebrationStyles[config.type as keyof typeof celebrationStyles] || celebrationStyles.subtle

  const containerVariants = {
    gentle: {
      initial: { scale: 0.95, opacity: 0, y: 20, rotateX: -10 },
      animate: { 
        scale: 1, 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: { 
          type: 'spring', 
          stiffness: 300, 
          damping: 25,
          opacity: { duration: 0.4 },
          y: { type: 'spring', stiffness: 400, damping: 30 }
        }
      },
      exit: { scale: 0.95, opacity: 0, y: -10, transition: { duration: 0.2 } }
    },
    bounce: {
      initial: { scale: 0.2, opacity: 0, rotate: -180, y: 100 },
      animate: { 
        scale: [0.2, 1.15, 0.95, 1.02, 1], 
        opacity: 1,
        rotate: 0,
        y: 0,
        transition: { 
          type: 'spring', 
          stiffness: 260, 
          damping: 12,
          scale: { times: [0, 0.4, 0.7, 0.9, 1], duration: 1.2 },
          rotate: { type: 'spring', stiffness: 300, damping: 20 },
          opacity: { duration: 0.4 }
        }
      },
      exit: { scale: 0.8, opacity: 0, rotate: 180, transition: { duration: 0.3 } }
    },
    dramatic: {
      initial: { scale: 0.3, opacity: 0, rotate: -45, y: -50, x: -50 },
      animate: { 
        scale: [0.3, 1.2, 0.9, 1.05, 1], 
        opacity: 1, 
        rotate: [0, 15, -5, 2, 0],
        y: 0,
        x: 0,
        transition: { 
          type: 'spring', 
          stiffness: 200, 
          damping: 15,
          scale: { times: [0, 0.5, 0.75, 0.9, 1], duration: 1.5 },
          rotate: { times: [0, 0.3, 0.6, 0.8, 1], duration: 1.5 },
          opacity: { duration: 0.5 }
        }
      },
      exit: { scale: 0.4, opacity: 0, rotate: 45, y: 50, transition: { duration: 0.4 } }
    },
    explosive: {
      initial: { scale: 0.1, opacity: 0, rotate: -360, y: 200, filter: 'blur(20px)' },
      animate: { 
        scale: [0.1, 1.4, 0.8, 1.1, 1], 
        opacity: 1,
        rotate: 0,
        y: 0,
        filter: 'blur(0px)',
        transition: { 
          type: 'spring',
          stiffness: 150,
          damping: 10,
          scale: { times: [0, 0.4, 0.7, 0.9, 1], duration: 1.8 },
          rotate: { duration: 1.2, ease: 'easeOut' },
          filter: { duration: 0.6 },
          opacity: { duration: 0.6 }
        }
      },
      exit: { scale: 0.2, opacity: 0, rotate: 360, filter: 'blur(10px)', transition: { duration: 0.5 } }
    }
  }

  const animation = containerVariants[style.animation as keyof typeof containerVariants] || containerVariants.gentle

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
          <DialogOverlay className={cn(style.backdrop)} />
          <DialogContent className="border-0 bg-transparent p-0 shadow-none">
            <motion.div
              className={cn(
                'relative mx-auto max-w-lg overflow-hidden',
                style.container
              )}
              variants={animation}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {/* Animated Background Glow */}
              <motion.div 
                className={cn('absolute inset-0 bg-gradient-to-br opacity-30', style.glowColor)}
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
              
              {/* Floating Particles */}
              <FloatingParticles type={config.type} />
              
              {/* Enhanced Confetti */}
              {showConfetti && <EnhancedConfettiEffect type={config.type} />}

              {/* Close button */}
              <motion.button
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110"
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4 text-gray-600" />
              </motion.button>

              <div className="relative z-10 px-8 py-12 text-center">
                {/* Premium Icon Container */}
                <motion.div 
                  className="mx-auto mb-8 flex h-24 w-24 items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    y: [0, -8, 0]
                  }}
                  transition={{
                    scale: { delay: 0.2, type: 'spring', stiffness: 200 },
                    rotate: { delay: 0.2, duration: 0.8 },
                    y: { delay: 1, duration: 2, repeat: Infinity, ease: 'easeInOut' }
                  }}
                >
                  {config.icon ? (
                    <div className={cn(
                      'flex h-full w-full items-center justify-center rounded-2xl shadow-2xl ring-4 ring-white/30',
                      style.iconBg
                    )}>
                      <span className="text-5xl drop-shadow-lg">{config.icon}</span>
                    </div>
                  ) : (
                    <div className={cn(
                      'flex h-full w-full items-center justify-center rounded-2xl shadow-2xl ring-4 ring-white/30',
                      style.iconBg
                    )}>
                      <Premium3DIcon type={config.type} />
                    </div>
                  )}
                </motion.div>

                {/* Animated Title */}
                <motion.h2 
                  className={cn('mb-4 font-black leading-tight tracking-tight', style.title)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {config.title}
                </motion.h2>

                {/* Animated Message */}
                <motion.p 
                  className={cn('mb-8 leading-relaxed', style.message)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {config.message}
                </motion.p>

                {/* Premium Action Button */}
                <motion.button
                  onClick={onClose}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 active:scale-95',
                    style.iconBg
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {config.type === 'epic' ? 'Amazing!' : config.type === 'major' ? 'Fantastic!' : config.type === 'medium' ? 'Great!' : 'Nice!'}
                  </span>
                </motion.button>
              </div>

              {/* Enhanced Sparkle Layer */}
              <EnhancedSparkleLayer type={config.type} />
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

// ==================================================
// PREMIUM 3D ICON COMPONENT
// ==================================================

interface Premium3DIconProps {
  type: CelebrationType
}

function Premium3DIcon({ type }: Premium3DIconProps) {
  const iconMap = {
    subtle: <Target className="h-12 w-12 text-white drop-shadow-2xl" />,
    medium: <TrendingUp className="h-12 w-12 text-white drop-shadow-2xl" />,
    major: <Trophy className="h-12 w-12 text-white drop-shadow-2xl" />,
    epic: <Award className="h-12 w-12 text-white drop-shadow-2xl" />
  }

  return (
    <motion.div
      animate={{
        rotateY: [0, 15, -15, 0],
        rotateX: [0, -10, 10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {iconMap[type]}
    </motion.div>
  )
}

// ==================================================
// FLOATING PARTICLES
// ==================================================

interface FloatingParticlesProps {
  type: CelebrationType
}

function FloatingParticles({ type }: FloatingParticlesProps) {
  const particleCount = type === 'epic' ? 20 : type === 'major' ? 15 : type === 'medium' ? 10 : 5
  const particles = Array.from({ length: particleCount }, (_, i) => i)
  
  const colors = {
    subtle: ['#64748b', '#94a3b8'],
    medium: ['#3b82f6', '#6366f1'],
    major: ['#a855f7', '#ec4899'],
    epic: ['#f59e0b', '#ef4444']
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {particles.map(i => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full opacity-60"
          style={{
            backgroundColor: colors[type][i % 2],
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

// ==================================================
// ENHANCED CONFETTI EFFECT
// ==================================================

interface EnhancedConfettiEffectProps {
  type: CelebrationType
}

function EnhancedConfettiEffect({ type }: EnhancedConfettiEffectProps) {
  const confettiCount = type === 'epic' ? 100 : type === 'major' ? 60 : 40
  const confettiPieces = Array.from({ length: confettiCount }, (_, i) => i)
  
  const shapes = ['circle', 'square', 'triangle']
  const colors = {
    subtle: ['#64748b', '#94a3b8', '#cbd5e1'],
    medium: ['#3b82f6', '#6366f1', '#8b5cf6'],
    major: ['#a855f7', '#ec4899', '#f472b6'],
    epic: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6']
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {confettiPieces.map(i => {
        const shape = shapes[i % shapes.length]
        const isLarge = Math.random() > 0.7
        
        return (
          <motion.div
            key={i}
            className={cn(
              'absolute opacity-90',
              shape === 'circle' && 'rounded-full',
              shape === 'square' && 'rounded-sm',
              shape === 'triangle' && 'rotate-45',
              isLarge ? 'h-4 w-4' : 'h-2 w-2'
            )}
            style={{
              backgroundColor: colors[type][i % colors[type].length],
              left: `${Math.random() * 100}%`,
              top: `-${isLarge ? 20 : 10}px`,
            }}
            initial={{ 
              y: -20, 
              opacity: 1, 
              rotate: 0,
              scale: isLarge ? 1.2 : 1
            }}
            animate={{
              y: window.innerHeight + 100,
              opacity: [1, 1, 0],
              rotate: Math.random() * 1080,
              x: Math.random() * 200 - 100,
              scale: [1, 1.2, 0.8]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              ease: 'easeOut',
              delay: Math.random() * 3,
              opacity: { times: [0, 0.8, 1], duration: 4 }
            }}
          />
        )
      })}
    </div>
  )
}

// ==================================================
// ENHANCED SPARKLE LAYER
// ==================================================

interface EnhancedSparkleLayerProps {
  type: CelebrationType
}

function EnhancedSparkleLayer({ type }: EnhancedSparkleLayerProps) {
  if (type === 'subtle') return null
  
  const sparkleCount = type === 'epic' ? 12 : type === 'major' ? 8 : 4
  const sparkles = Array.from({ length: sparkleCount }, (_, i) => i)
  
  const positions = sparkles.map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }))

  return (
    <div className="pointer-events-none absolute inset-0">
      {sparkles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${positions[i].x}%`,
            top: `${positions[i].y}%`,
          }}
          initial={{ scale: 0, rotate: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.5, 0], 
            rotate: [0, 180, 360],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            delay: Math.random() * 2,
            ease: 'easeInOut'
          }}
        >
          <Sparkles className={cn(
            'text-yellow-300 drop-shadow-lg',
            type === 'epic' ? 'h-6 w-6' : type === 'major' ? 'h-5 w-5' : 'h-4 w-4'
          )} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  )
}

// ==================================================
// CONFETTI EFFECT (Legacy - keeping for compatibility)
// ==================================================

function ConfettiEffect() {
  return <EnhancedConfettiEffect type="medium" />
}

// ==================================================
// SPARKLE EFFECT
// ==================================================

interface SparkleEffectProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

function SparkleEffect({ position }: SparkleEffectProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  return (
    <motion.div
      className={cn('absolute', positionClasses[position])}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1,
        ease: 'easeInOut'
      }}
    >
      <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
    </motion.div>
  )
}

// ==================================================
// CELEBRATION TOAST
// ==================================================

interface CelebrationToastProps {
  config: CelebrationConfig
  onDismiss: () => void
}

export function CelebrationToast({ config, onDismiss }: CelebrationToastProps) {
  // Play premium feedback for toasts
  useEffect(() => {
    // Only play feedback for medium and major toasts to avoid overwhelming
    if (config.type === 'medium' || config.type === 'major') {
      playCelebrationFeedback(config.type)
    }
    
    if (config.duration) {
      const timer = setTimeout(onDismiss, config.duration)
      return () => clearTimeout(timer)
    }
  }, [config.duration, onDismiss, config.type])

  const toastStyles = {
    subtle: {
      container: 'relative overflow-hidden bg-gradient-to-r from-white/95 via-gray-50/90 to-white/85 backdrop-blur-2xl border border-gray-200/50 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] ring-1 ring-white/20',
      iconBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
      title: 'text-slate-800 font-bold',
      message: 'text-slate-600 font-medium',
      glowColor: 'from-slate-400/10 to-gray-400/10'
    },
    medium: {
      container: 'relative overflow-hidden bg-gradient-to-r from-blue-50/95 via-indigo-50/90 to-white/85 backdrop-blur-2xl border border-blue-200/50 shadow-[0_20px_40px_-12px_rgba(59,130,246,0.25)] ring-1 ring-blue-200/30',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      title: 'text-blue-800 font-bold',
      message: 'text-blue-700 font-medium',
      glowColor: 'from-blue-400/20 to-indigo-400/10'
    },
    major: {
      container: 'relative overflow-hidden bg-gradient-to-r from-purple-50/95 via-pink-50/90 to-rose-50/85 backdrop-blur-2xl border border-purple-200/50 shadow-[0_20px_40px_-12px_rgba(168,85,247,0.3)] ring-1 ring-purple-200/40',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      title: 'text-purple-800 font-bold',
      message: 'text-purple-700 font-semibold',
      glowColor: 'from-purple-400/30 to-pink-400/20'
    },
    epic: {
      container: 'relative overflow-hidden bg-gradient-to-r from-amber-50/95 via-orange-50/90 to-red-50/85 backdrop-blur-2xl border border-amber-200/60 shadow-[0_20px_40px_-12px_rgba(245,158,11,0.4)] ring-1 ring-amber-300/50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      title: 'text-amber-900 font-bold',
      message: 'text-orange-800 font-bold',
      glowColor: 'from-amber-400/40 to-orange-400/30'
    }
  }

  const style = toastStyles[config.type as keyof typeof toastStyles] || toastStyles.subtle

  return (
    <motion.div
      className={cn(
        'flex items-center space-x-5 rounded-2xl p-6 max-w-lg mx-4',
        style.container
      )}
      initial={{ scale: 0.85, opacity: 0, y: 50, rotateX: -15 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 25,
          opacity: { duration: 0.4 }
        }
      }}
      exit={{ 
        scale: 0.85, 
        opacity: 0, 
        y: -30, 
        transition: { duration: 0.2 } 
      }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Subtle animated glow */}
      <motion.div 
        className={cn('absolute inset-0 bg-gradient-to-r opacity-20 rounded-2xl', style.glowColor)}
        animate={{
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Floating micro particles for epic/major */}
      {(config.type === 'epic' || config.type === 'major') && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-current opacity-40"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random(),
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced Icon */}
      <motion.div 
        className="flex-shrink-0 relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          y: config.type === 'epic' ? [0, -3, 0] : 0
        }}
        transition={{
          scale: { delay: 0.1, type: 'spring', stiffness: 300 },
          rotate: { delay: 0.1, duration: 0.6 },
          y: config.type === 'epic' ? { 
            delay: 0.8, 
            duration: 2, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          } : {}
        }}
      >
        <div className={cn(
          'flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ring-2 ring-white/30',
          style.iconBg
        )}>
          <span className="text-3xl drop-shadow-lg">{config.icon || '🎉'}</span>
        </div>
      </motion.div>

      {/* Enhanced Content */}
      <div className="flex-1 min-w-0 relative z-10">
        <motion.h4 
          className={cn('text-lg mb-1.5 leading-tight', style.title)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {config.title}
        </motion.h4>
        <motion.p 
          className={cn('text-sm leading-relaxed', style.message)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {config.message}
        </motion.p>
      </div>

      {/* Enhanced Close button */}
      <motion.button
        className="relative z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 flex-shrink-0"
        onClick={onDismiss}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
      >
        <X className="h-4 w-4 text-gray-600" />
      </motion.button>
    </motion.div>
  )
}

// ==================================================
// CELEBRATION MANAGER
// ==================================================

interface CelebrationManagerProps {
  celebrations: CelebrationConfig[]
  onDismiss: (index: number) => void
}

export function CelebrationManager({ celebrations, onDismiss }: CelebrationManagerProps) {
  const [activeModal, setActiveModal] = useState<CelebrationConfig | null>(null)
  const [toasts, setToasts] = useState<CelebrationConfig[]>([])

  useEffect(() => {
    celebrations.forEach((celebration, index) => {
      if (celebration.type === 'major' || celebration.type === 'epic') {
        // Show as modal for major celebrations
        setActiveModal(celebration)
      } else {
        // Show as toast for subtle/medium celebrations
        setToasts(prev => [...prev, celebration])
      }
    })
  }, [celebrations])

  const closeModal = () => {
    setActiveModal(null)
    // Find and dismiss the modal celebration
    const modalIndex = celebrations.findIndex(c => 
      c.type === 'major' || c.type === 'epic'
    )
    if (modalIndex !== -1) {
      onDismiss(modalIndex)
    }
  }

  const dismissToast = (toast: CelebrationConfig) => {
    setToasts(prev => prev.filter(t => t !== toast))
    const toastIndex = celebrations.findIndex(c => c === toast)
    if (toastIndex !== -1) {
      onDismiss(toastIndex)
    }
  }

  return (
    <>
      {/* Modal celebrations */}
      {activeModal && (
        <CelebrationModal
          isOpen={!!activeModal}
          onClose={closeModal}
          config={activeModal}
        />
      )}

      {/* Toast celebrations - Center screen with backdrop */}
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <div key={index} className="pointer-events-auto">
              <motion.div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <div className="relative z-10">
                <CelebrationToast
                  config={toast}
                  onDismiss={() => dismissToast(toast)}
                />
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}