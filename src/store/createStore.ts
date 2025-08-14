export function createStore<T>(init: () => T) {
  let state = init();
  return {
    getState() {
      return state;
    },
    setState(partial: Partial<T>) {
      state = { ...state, ...partial };
    },
  };
}
