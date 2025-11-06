import { useState, useCallback } from 'react';
import { produce, Draft } from 'immer';

/**
 * A custom hook that mimics useState but uses Immer for immutable updates.
 * Allows you to write mutable-style code while maintaining immutability.
 *
 * @example
 * const [state, setState] = useImmerState({ name: '', age: 0 });
 *
 * // Mutable-style update
 * setState(draft => {
 *   draft.name = 'John';
 *   draft.age = 30;
 * });
 *
 * // Or direct replacement (like regular useState)
 * setState({ name: 'Jane', age: 25 });
 */
export function useImmerState<T>(initialState: T | (() => T)) {
  const [state, setStateInternal] = useState<T>(initialState);

  const setState = useCallback((updater: T | ((draft: Draft<T>) => void)) => {
    if (typeof updater === 'function') {
      setStateInternal((currentState) =>
        produce(currentState, updater as (draft: Draft<T>) => void)
      );
    } else {
      setStateInternal(updater);
    }
  }, []);

  return [state, setState] as const;
}
