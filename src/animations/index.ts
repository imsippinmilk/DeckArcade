// A tiny WAAPI wrapper exposing play/stop/register/useReducedMotion with your preset names.
type PresetName =
  | 'dealCard'
  | 'flipCard'
  | 'chipSlide'
  | 'chipStackBounce'
  | 'winConfetti'
  | 'highlightPulse'
  | 'shakeInvalid'
  | 'clockTick'
  | 'modalIn'
  | 'modalOut'
  | 'toastIn'
  | 'toastOut'
  | 'pttIndicator';

type PresetDef = {
  keyframes: string; // CSS @keyframes name
  durationMs: number;
  easing: string;
  distance?: string; // optional semantic param
};

const registry = new Map<PresetName, PresetDef>();

const defaults: Record<PresetName, PresetDef> = {
  dealCard: {
    keyframes: 'card-deal',
    durationMs: 220,
    easing: 'var(--ease-decelerate)',
    distance: '18vw',
  },
  flipCard: {
    keyframes: 'card-flip-3d',
    durationMs: 320,
    easing: 'var(--ease-emphasized)',
  },
  chipSlide: {
    keyframes: 'chip-slide',
    durationMs: 220,
    easing: 'var(--ease-standard)',
    distance: '12vw',
  },
  chipStackBounce: {
    keyframes: 'stack-bounce',
    durationMs: 150,
    easing: 'var(--ease-springy)',
  },
  winConfetti: {
    keyframes: 'confetti-pop',
    durationMs: 500,
    easing: 'var(--ease-decelerate)',
  },
  highlightPulse: {
    keyframes: 'pulse',
    durationMs: 320,
    easing: 'var(--ease-emphasized)',
  },
  shakeInvalid: {
    keyframes: 'shake',
    durationMs: 150,
    easing: 'var(--ease-accelerate)',
  },
  clockTick: {
    keyframes: 'tick',
    durationMs: 220,
    easing: 'var(--ease-standard)',
  },
  modalIn: {
    keyframes: 'fade-scale-in',
    durationMs: 220,
    easing: 'var(--ease-decelerate)',
  },
  modalOut: {
    keyframes: 'fade-scale-out',
    durationMs: 150,
    easing: 'var(--ease-accelerate)',
  },
  toastIn: {
    keyframes: 'slide-in-up',
    durationMs: 220,
    easing: 'var(--ease-decelerate)',
  },
  toastOut: {
    keyframes: 'slide-out-down',
    durationMs: 150,
    easing: 'var(--ease-accelerate)',
  },
  pttIndicator: {
    keyframes: 'glow',
    durationMs: 320,
    easing: 'var(--ease-emphasized)',
  },
};

for (const [k, v] of Object.entries(defaults)) registry.set(k as PresetName, v);

export const Animations = {
  register(name: PresetName, def: PresetDef) {
    registry.set(name, def);
  },
  play(name: PresetName, el: Element, opts?: KeyframeAnimationOptions) {
    if (!el || !name) return;
    if (Animations.useReducedMotion()) return;
    const def = registry.get(name);
    if (!def) return;
    return (
      (el as HTMLElement).animate({ opacity: [0.96, 1] }, { duration: 1 }) && // warm-up for Safari
      (el as HTMLElement).animate(
        [
          { offset: 0, easing: def.easing },
          { offset: 1, easing: def.easing },
        ],
        { duration: def.durationMs, fill: 'both', ...(opts ?? {}) },
      )
    );
  },
  stop(el: Element, name?: PresetName) {
    const anims = (el as HTMLElement).getAnimations?.() ?? [];
    for (const a of anims) {
      if (!name || (a.effect as any)?.name === name) a.cancel();
    }
  },
  useReducedMotion(): boolean {
    return (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    );
  },
};
