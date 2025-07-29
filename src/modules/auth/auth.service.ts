import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserRepository } from '../user/user.repository';
import * as bcrypt from 'bcrypt';
import { IResponseRegister } from './interfaces/response-register.interface';
import Redis from 'ioredis';
import { IResponseVerifiyOtp } from './interfaces/response-verify-otp.interface';
import { MailService } from './mail.service';
import { LoginDto } from './dto/login.dto';
import { ResponseLoginDto } from './dto/response-login.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from 'src/common/bases/exceptions/templates/unauthorized.exception';

@Injectable()
export class AuthService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  private generateOtp() {
    const otp = Math.floor(10000 + Math.random() * 90000);
    return otp.toString();
  }

  async register(payload: RegisterDto): Promise<IResponseRegister> {
    const _createUser = {
      ...payload,
      password: bcrypt.hashSync(payload.password, 10),
    };
    const otp = this.generateOtp();
    const user = this.userRepository.create(_createUser);
    await this.userRepository.save(user);

    await this.redisClient.set(`otp:${payload.email}`, otp, 'EX', 50000);

    await this.mailService.sendMail(
      payload.email,
      'OTP Verification',
      `<h1>otp: ${otp}</h1>`,
    );

    return {
      status: 'success',
      detail:
        'akun berhasi terdaftar, kami akan mengirimkan kode ke email anda',
    } as IResponseRegister;
  }

  async verifyOtp(email: string, otp: string): Promise<IResponseVerifiyOtp> {
    const getOtp = await this.redisClient.get(`otp:${email}`);
    if (getOtp === otp) {
      await this.userRepository.update({ email }, { isActive: true });
      await this.redisClient.del(`otp:${email}`);
      return {
        status: 'success',
        detail: 'your account has been activated',
      };
    } else {
      return {
        status: 'failed',
        detail: 'your failed to activated',
      };
    }
  }

  async login(loginDto: LoginDto): Promise<ResponseLoginDto> {
    const findUser = await this.userRepository.findOne({
      where: {
        email: loginDto.email,
      },
    });

    if (!findUser) {
      throw new UnauthorizedException('Password atau email salah');
    }

    if (bcrypt.compareSync(loginDto.password, findUser.password) === false) {
      throw new UnauthorizedException('Password atau email salah');
    }

    const token = this.jwtService.sign({
      username: findUser.username,
      id: findUser.id,
      email: findUser.email,
      role: findUser.role,
    });

    return {
      accessToken: token,
    };
  }
}
