/**
 * Animation API used by game modules. Games can call these
 * functions to trigger predefined animation presets. The actual
 * implementation will be provided in a later development stage,
 * potentially using a library such as Framer Motion or CSS keyframes.
 */
export function play(presetName: string, target: HTMLElement, options?: Record<string, unknown>): void {
  // TODO: play the named animation on the target element
}

export function stop(target: HTMLElement, presetName: string): void {
  // TODO: stop the animation
}

export function register(presetName: string, presetDef: unknown): void {
  // TODO: allow new animation presets to be registered at runtime
}

export function useReducedMotion(): boolean {
  // TODO: detect OS/Browser setting for reduced motion
  return false;
}