// ==================================================
// CELEBRATION SOUNDS & HAPTIC UTILITIES
// Premium audio and haptic feedback for gamification
// ==================================================

import type { CelebrationType } from '@/types/gamification'

// User preferences for audio feedback
let audioEnabled = false
let hapticsEnabled = true

export function setAudioEnabled(enabled: boolean) {
  audioEnabled = enabled
}

export function setHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled
}

export function getAudioEnabled(): boolean {
  return audioEnabled
}

export function getHapticsEnabled(): boolean {
  return hapticsEnabled
}

// Premium haptic feedback patterns
export const HAPTIC_PATTERNS = {
  subtle: [40],
  medium: [60, 30, 60],
  major: [80, 50, 80, 30, 100],
  epic: [120, 80, 120, 80, 200, 100, 250]
} as const

// Musical note frequencies for celebration sounds
const CELEBRATION_FREQUENCIES = {
  subtle: [523.25], // C5
  medium: [523.25, 659.25], // C5, E5
  major: [523.25, 659.25, 783.99], // C5, E5, G5
  epic: [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
} as const

/**
 * Play haptic feedback based on celebration type
 */
export function playHapticFeedback(type: CelebrationType): void {
  if (!hapticsEnabled || !('vibrate' in navigator)) {
    return
  }

  try {
    navigator.vibrate(HAPTIC_PATTERNS[type])
  } catch (error) {
    console.warn('Haptic feedback not supported:', error)
  }
}

/**
 * Play premium audio feedback for celebrations
 */
export function playAudioFeedback(type: CelebrationType): void {
  if (!audioEnabled || typeof window === 'undefined' || !window.AudioContext) {
    return
  }

  try {
    const audioContext = new window.AudioContext()
    const frequencies = CELEBRATION_FREQUENCIES[type]
    const baseVolume = type === 'epic' ? 0.12 : type === 'major' ? 0.10 : 0.08
    
    frequencies.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      // Create a more pleasant sound with multiple harmonics
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      // Smooth envelope for pleasant sound
      const startTime = audioContext.currentTime + index * 0.15
      const attackTime = 0.02
      const decayTime = 0.4
      
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(baseVolume, startTime + attackTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + decayTime)
      
      oscillator.start(startTime)
      oscillator.stop(startTime + decayTime)
    })
  } catch (error) {
    console.warn('Audio feedback not supported:', error)
  }
}

/**
 * Play complete feedback (both haptic and audio) for celebrations
 */
export function playCelebrationFeedback(type: CelebrationType): void {
  playHapticFeedback(type)
  if (audioEnabled) {
    // Small delay to sync with visual animation
    setTimeout(() => playAudioFeedback(type), 100)
  }
}

/**
 * Initialize audio preferences from local storage
 */
export function initializeCelebrationPreferences(): void {
  if (typeof window === 'undefined') return

  try {
    const storedAudioPref = localStorage.getItem('celebration-audio-enabled')
    const storedHapticsPref = localStorage.getItem('celebration-haptics-enabled')
    
    audioEnabled = storedAudioPref ? JSON.parse(storedAudioPref) : false
    hapticsEnabled = storedHapticsPref ? JSON.parse(storedHapticsPref) : true
  } catch (error) {
    console.warn('Failed to load celebration preferences:', error)
  }
}

/**
 * Save preferences to local storage
 */
export function saveCelebrationPreferences(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('celebration-audio-enabled', JSON.stringify(audioEnabled))
    localStorage.setItem('celebration-haptics-enabled', JSON.stringify(hapticsEnabled))
  } catch (error) {
    console.warn('Failed to save celebration preferences:', error)
  }
}