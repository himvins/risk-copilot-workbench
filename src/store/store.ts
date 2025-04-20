
import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';

// This will hold our dynamic reducers
const staticReducers = {};

export type RootState = {
  [key: string]: any;
};

export class DynamicStore {
  private static reducers: { [key: string]: Reducer } = { ...staticReducers };
  private static store = configureStore({
    reducer: staticReducers
  });

  static getStore() {
    return this.store;
  }

  static addReducer(key: string, reducer: Reducer) {
    if (!key || this.reducers[key]) {
      return;
    }

    this.reducers[key] = reducer;
    this.store = configureStore({
      reducer: combineReducers(this.reducers)
    });
  }

  static removeReducer(key: string) {
    if (!key || !this.reducers[key]) {
      return;
    }

    delete this.reducers[key];
    this.store = configureStore({
      reducer: combineReducers(this.reducers)
    });
  }
}

export const store = DynamicStore.getStore();
