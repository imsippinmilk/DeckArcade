export type SetState<T> = (
  partial: Partial<T> | ((state: T) => Partial<T>),
) => void;
export type GetState<T> = () => T;

export interface Store<T> {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: (listener: (state: T) => void) => () => void;
}

export function createStore<T>(
  initializer: (set: SetState<T>, get: GetState<T>) => T,
): Store<T> {
  let state: T;
  const listeners = new Set<(state: T) => void>();

  const setState: SetState<T> = (partial) => {
    const partialState =
      typeof partial === 'function'
        ? (partial as (s: T) => Partial<T>)(state)
        : partial;
    state = { ...state, ...partialState };
    listeners.forEach((l) => l(state));
  };

  const getState: GetState<T> = () => state;

  state = initializer(setState, getState);

  return {
    getState,
    setState,
    subscribe(listener: (state: T) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
