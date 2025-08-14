import { animationTokens } from './tokens';

const style = document.createElement('style');
style.textContent = `
@keyframes deal {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes bet {
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes win {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}
@keyframes reveal {
  from { transform: rotateY(90deg); }
  to { transform: rotateY(0deg); }
}
@keyframes invalid {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.anim-deal { animation: deal ${animationTokens.durationMs.base}ms ${animationTokens.easings.decelerate}; }
.anim-bet { animation: bet ${animationTokens.durationMs.base}ms ${animationTokens.easings.standard}; }
.anim-win { animation: win ${animationTokens.durationMs.slow}ms ${animationTokens.easings.emphasized}; }
.anim-reveal { animation: reveal ${animationTokens.durationMs.slow}ms ${animationTokens.easings.emphasized}; }
.anim-invalid { animation: invalid ${animationTokens.durationMs.fast}ms ${animationTokens.easings.accelerate}; }
`;
document.head.appendChild(style);

const classes = [
  'anim-deal',
  'anim-bet',
  'anim-win',
  'anim-reveal',
  'anim-invalid',
];
function play(el: HTMLElement, cls: string) {
  classes.forEach((c) => el.classList.remove(c));
  void el.offsetWidth;
  el.classList.add(cls);
}

export const onDeal = (el: HTMLElement) => play(el, 'anim-deal');
export const onBet = (el: HTMLElement) => play(el, 'anim-bet');
export const onWin = (el: HTMLElement) => play(el, 'anim-win');
export const onReveal = (el: HTMLElement) => play(el, 'anim-reveal');
export const onInvalid = (el: HTMLElement) => play(el, 'anim-invalid');
