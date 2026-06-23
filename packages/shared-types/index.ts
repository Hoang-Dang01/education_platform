export type UserRole = 'student' | 'teacher' | 'manager' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type MeetingStatus = 'live' | 'scheduled';

export interface RegisterRequest {
  email?: string | null;
  username: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUserDto {
  id: string;
  username: string;
  email?: string | null;
  role: string;
  name: string;
  status: string;
  mustChangePassword?: boolean;
}

export interface AuthResponse {
  user: AuthUserDto;
  accessToken: string;
}
