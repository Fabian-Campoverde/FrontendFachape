import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { ProcesarImagenPayload } from "../models/types";

export const procesarImagenThunk = createAsyncThunk(
  "image/procesarImagen",
  async ({ image, action, escalaPx }: ProcesarImagenPayload, thunkAPI) => {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("action", action);
    if (typeof escalaPx === "number" && !isNaN(escalaPx)) {
  formData.append("scale", escalaPx.toString());
}

    try {
      const response = await axios.post(
        "https://66c9b75f3498.ngrok-free.app/api/procesar-imagen/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data","X-Requested-With": "XMLHttpRequest", },
          responseType: "blob",
        }
      );
      
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      return { action, imageUrl };
    } catch (error: any) {
      return thunkAPI.rejectWithValue({ action, error: error.message });
    }
  }
);

interface ImageState {
  results: { [action: string]: string };
  loading: { [action: string]: boolean };
  error: { [action: string]: string };
}

const initialState: ImageState = {
  results: {},
  loading: {},
  error: {},
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(procesarImagenThunk.pending, (state, action) => {
        const { action: name } = action.meta.arg;
        state.loading[name] = true;
        state.error[name] = "";
      })
      .addCase(procesarImagenThunk.fulfilled, (state, action) => {
        const { action: name, imageUrl } = action.payload;
        state.loading[name] = false;
        state.results[name] = imageUrl;
      })
      .addCase(procesarImagenThunk.rejected, (state, action: any) => {
        const { action: name, error } = action.payload || {};
        state.loading[name] = false;
        state.error[name] = error || "Error desconocido";
      });
  },
});



export default imageSlice.reducer;