import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateSwaggerExample } from 'src/common/swagger/swagger-example.response';
import { RegisterDto } from './dto/register.dto';
import { ResponseRegisterDto } from './dto/response-register.dto';
import { plainToInstance } from 'class-transformer';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResponseVerifyDto } from './dto/response-verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseLoginDto } from './dto/response-login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @CreateSwaggerExample(
    RegisterDto,
    ResponseRegisterDto,
    false,
    'Untuk melakukan Pendaftaran pengguna',
  )
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);

    return {
      data: plainToInstance(ResponseRegisterDto, result, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Post('verify-otp')
  @CreateSwaggerExample(
    VerifyOtpDto,
    ResponseVerifyDto,
    false,
    'Untuk Verifikasi Otp pengguna',
  )
  async verifyOtp(@Body() verifyDto: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(
      verifyDto.email,
      verifyDto.otp,
    );

    return {
      data: plainToInstance(ResponseVerifyDto, result, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Post('login')
  @CreateSwaggerExample(
    LoginDto,
    ResponseLoginDto,
    false,
    'Untuk Login Pengguna',
  )
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      data: plainToInstance(ResponseLoginDto, result, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
