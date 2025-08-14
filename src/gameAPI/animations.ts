export type DomainEvent =
  | { type: 'deal' }
  | { type: 'bet' }
  | { type: 'win' }
  | { type: 'reveal' }
  | { type: 'invalid' };

export function handleDomainEvent(event: DomainEvent, el: HTMLElement): void {
  const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) return;
  const className = `anim-${event.type}`;
  el.classList.add(className);

export interface DomainEvent {
  type: string;
}

export function handleDomainEvent(event: DomainEvent, el: HTMLElement) {
  const mq =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq && mq.matches) return;
  el.classList.add(`anim-${event.type}`);

}
