
import { useEffect } from 'react';
import { Reducer } from '@reduxjs/toolkit';
import { DynamicStore } from '../store/store';

export function useDynamicReducer(key: string, reducer: Reducer) {
  useEffect(() => {
    DynamicStore.addReducer(key, reducer);
    return () => {
      DynamicStore.removeReducer(key);
    };
  }, [key, reducer]);
}
