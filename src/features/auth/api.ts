import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axios";
import type { LoginResponse } from "@/types/api/auth";

export const login = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await axios.post<LoginResponse>("/auth/login", credentials);
    return data; 
  } catch {
    return rejectWithValue("Login failed");
  }
});
