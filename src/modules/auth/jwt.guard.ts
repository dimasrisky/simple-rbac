import { ExecutionContext, Injectable } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UnauthorizedException } from 'src/common/bases/exceptions/templates/unauthorized.exception';
import { IJwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      throw new UnauthorizedException();
    }

    return true;
  }

  handleRequest<TUser = IJwtPayload>(
    err: unknown,
    user: TUser,
    info: unknown,
  ): TUser {
    if (info instanceof TokenExpiredError) {
      throw new UnauthorizedException(
        'expiredCredential',
        'Your credentials have expired.',
      );
    } else if (info instanceof JsonWebTokenError) {
      throw new UnauthorizedException(
        'invalidCredential',
        'Your credentials is invalid.',
      );
    } else if (err || !user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
