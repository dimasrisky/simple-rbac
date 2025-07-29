import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ForbiddenException } from '../bases/exceptions/templates/forbiden.exception';
import { ROLE_KEY } from '../decorators/role.decorator';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const getRole = this.reflector.get<string>(ROLE_KEY, context.getHandler());
    const request: Express.Request = context.switchToHttp().getRequest();
    const user: User = request.user! as User;
    if (user.role !== getRole)
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    return true;
  }
}
