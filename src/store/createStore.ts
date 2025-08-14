// Tiny observable store (zustand-like) with no external deps.
export type SetState<T> = (
  patch: Partial<T> | ((prev: T) => Partial<T>),
) => void;
export type GetState<T> = () => T;
export type Unsubscribe = () => void;

export function createStore<T>(
  init: (set: SetState<T>, get: GetState<T>) => T,
): {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (fn: (s: T) => void) => Unsubscribe;
} {
  let state: T;
  const listeners = new Set<(s: T) => void>();
  const get = () => state;
  const set: SetState<T> = (patch) => {
    const next = {
      ...state,
      ...(typeof patch === 'function' ? (patch as any)(state) : patch),
    };
    state = next;
    listeners.forEach((l) => l(state));
  };
  state = init(set, get);
  return {
    getState: get,
    setState: set,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
