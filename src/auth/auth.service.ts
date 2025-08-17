import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

type ApiResponse = {
  metaData: {
    success: boolean;
    message: string;
    status: number;
  };
  token?: string;
  refreshToken?: string;
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

  async login(user: { id: number; username: string }): Promise<ApiResponse> {
    const payload = { id: user.id, username: user.username };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET!,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: '30m',
    });

    return {
      metaData: {
        success: true,
        message: 'Token Berhasil Diperbarui',
        status: HttpStatus.OK,
      },
      token: accessToken,
      refreshToken: refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        id: number;
        username: string;
      }>(refreshToken, { secret: process.env.JWT_REFRESH_SECRET! });

      const newAccessToken = await this.jwtService.signAsync(
        { id: payload.id, username: payload.username },
        { secret: process.env.JWT_SECRET!, expiresIn: '15m' },
      );

      return {
        metaData: {
          success: true,
          message: 'Token Berhasil Diperbarui',
          status: HttpStatus.OK,
        },
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new HttpException(
        {
          metaData: {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            status: HttpStatus.UNAUTHORIZED,
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
