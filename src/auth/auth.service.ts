import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { tb_user } from '@prisma/client';

type ApiResponse<T> = {
  metaData: {
    success: boolean;
    message: string;
    status: number;
  };
  result?: T;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.prisma.tb_user.findFirst({
      where: {
        username,
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        {
          metaData: {
            success: false,
            message: 'Username / Password Salah !',
            status: HttpStatus.UNAUTHORIZED,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  async login(user: {
    id: number;
    username: string;
  }): Promise<ApiResponse<tb_user>> {
    const payload = { id: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);

    throw new HttpException(
      {
        metaData: {
          success: true,
          message: '',
          status: HttpStatus.OK,
        },
        token: token,
      },
      HttpStatus.OK,
    );
  }
}
