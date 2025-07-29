import { BaseEntity } from 'src/common/bases/base.entity';
import { Column, Entity } from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import { Role } from '../enums/Role';

@Entity()
export class User extends BaseEntity implements IUser {
  @Column({ name: 'username', unique: false, nullable: false })
  username: string;

  @Column({ name: 'email', unique: false, nullable: false })
  email: string;

  @Column({ name: 'password', unique: false, nullable: false })
  password: string;

  @Column({
    name: 'role',
    unique: false,
    nullable: false,
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ name: 'is_active', unique: false, nullable: false, default: false })
  isActive: boolean;
}
