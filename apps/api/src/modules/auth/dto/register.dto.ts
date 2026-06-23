import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { RegisterRequest } from '@edumeet/shared-types';

export class RegisterDto implements RegisterRequest {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string | null;

  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @MinLength(3, { message: 'Tên đăng nhập phải chứa ít nhất 3 ký tự' })
  username: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
  password: string;

  @IsString({ message: 'Tên không hợp lệ' })
  @MinLength(2, { message: 'Tên phải chứa ít nhất 2 ký tự' })
  name: string;
}
