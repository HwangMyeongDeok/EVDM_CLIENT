import { createAsyncThunk } from "@reduxjs/toolkit";
import type { LoginResponse } from "@/types/api/auth";
import instance from "@/lib/axios";

export const login = createAsyncThunk<
  LoginResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await instance.post<LoginResponse>("/auth/login", credentials);
    return data; 
  } catch {
    return rejectWithValue("Login failed");
  }
});
