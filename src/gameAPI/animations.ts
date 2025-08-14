import {
  onDeal,
  onBet,
  onWin,
  onReveal,
  onInvalid,
} from '../animations/presets';

export type DomainEvent = { type: keyof typeof hookMap };

const hookMap = {
  deal: onDeal,
  bet: onBet,
  win: onWin,
  reveal: onReveal,
  invalid: onInvalid,
} as const;

export function useReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion)').matches
  );
}

export function handleDomainEvent(
  event: DomainEvent,
  target: HTMLElement,
): void {
  if (useReducedMotion()) return;
  const hook = hookMap[event.type];
  if (hook) hook(target);
}
