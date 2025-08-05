// store.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";

import imageReducer  from './backSlice';
import { useDispatch } from "react-redux";


const reducers = combineReducers({
  procesamiento: imageReducer , 
});

export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();