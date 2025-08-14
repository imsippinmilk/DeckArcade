export const Animations = {
  play(name: string, el: HTMLElement): void {
    const mq =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq && mq.matches) return;
    el.classList.add(`anim-${name}`);
  },
};
