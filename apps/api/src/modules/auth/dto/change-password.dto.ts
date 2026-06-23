import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Mật khẩu cũ phải là chuỗi' })
  oldPassword: string;

  @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
  @MinLength(8, { message: 'Mật khẩu mới phải chứa ít nhất 8 ký tự' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số',
  })
  newPassword: string;
}
