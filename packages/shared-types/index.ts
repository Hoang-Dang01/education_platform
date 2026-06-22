export type UserRole = 'student' | 'teacher' | 'manager' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type MeetingStatus = 'live' | 'scheduled';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  role: string;
  name: string;
  status: string;
}

export interface AuthResponse {
  user: AuthUserDto;
  accessToken: string;
}
