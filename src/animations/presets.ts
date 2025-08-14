import { animationTokens } from './tokens';

/**
 * Default animation presets. Each preset defines a keyframe name,
 * duration and easing function. Distances are specified as CSS
 * length values and should be interpreted relative to the current
 * layout. These presets correspond to the definitions in the
 * specification and can be passed to the Animations.play API.
 */
export const presets = {
  dealCard: {
    keyframes: 'card-deal',
    durationMs: animationTokens.durationMs.base,
    easing: animationTokens.easings.decelerate,
    distance: '18vw'
  },
  flipCard: {
    keyframes: 'card-flip-3d',
    durationMs: animationTokens.durationMs.slow,
    easing: animationTokens.easings.emphasized
  },
  chipSlide: {
    keyframes: 'chip-slide',
    durationMs: animationTokens.durationMs.base,
    easing: animationTokens.easings.standard,
    distance: '12vw'
  },
  chipStackBounce: {
    keyframes: 'stack-bounce',
    durationMs: animationTokens.durationMs.fast,
    easing: animationTokens.easings.springy
  },
  winConfetti: {
    keyframes: 'confetti-pop',
    durationMs: animationTokens.durationMs.xSlow,
    easing: animationTokens.easings.decelerate
  },
  highlightPulse: {
    keyframes: 'pulse',
    durationMs: animationTokens.durationMs.slow,
    easing: animationTokens.easings.emphasized
  },
  shakeInvalid: {
    keyframes: 'shake',
    durationMs: animationTokens.durationMs.fast,
    easing: animationTokens.easings.accelerate
  },
  clockTick: {
    keyframes: 'tick',
    durationMs: animationTokens.durationMs.base,
    easing: animationTokens.easings.standard
  },
  modalIn: {
    keyframes: 'fade-scale-in',
    durationMs: animationTokens.durationMs.base,
    easing: animationTokens.easings.decelerate
  },
  modalOut: {
    keyframes: 'fade-scale-out',
    durationMs: animationTokens.durationMs.fast,
    easing: animationTokens.easings.accelerate
  },
  toastIn: {
    keyframes: 'slide-in-up',
    durationMs: animationTokens.durationMs.base,
    easing: animationTokens.easings.decelerate
  },
  toastOut: {
    keyframes: 'slide-out-down',
    durationMs: animationTokens.durationMs.fast,
    easing: animationTokens.easings.accelerate
  },
  pttIndicator: {
    keyframes: 'glow',
    durationMs: animationTokens.durationMs.slow,
    easing: animationTokens.easings.emphasized
  }
};