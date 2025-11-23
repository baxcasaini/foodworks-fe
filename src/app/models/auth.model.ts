export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Nutritionist {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
}

