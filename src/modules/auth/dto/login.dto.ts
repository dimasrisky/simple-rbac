import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    name: 'email',
    description: 'Email pengguna',
    example: '',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    name: 'password',
    description: 'Password pengguna',
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
