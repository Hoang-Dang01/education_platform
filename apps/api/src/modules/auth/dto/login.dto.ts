import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest } from '@edumeet/shared-types';

export class LoginDto implements LoginRequest {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;
}
