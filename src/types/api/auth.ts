export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
  };
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string;
}
