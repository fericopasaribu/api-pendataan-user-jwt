import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { tb_user } from '@prisma/client';
import { genSalt, hash } from 'bcrypt-ts';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async get(): Promise<tb_user> {
    const data = await this.prisma.tb_user.findMany();

    if (!data) {
      throw new HttpException(
        {
          metaData: {
            success: false,
            message: 'Data User Tidak Ditemukan !',
            status: HttpStatus.NOT_FOUND,
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    throw new HttpException(
      {
        metaData: {
          success: true,
          message: '',
          status: HttpStatus.OK,
        },
        result: data,
      },
      HttpStatus.OK,
    );
  }

  async post(data: {
    name: string;
    username: string;
    password: string;
  }): Promise<tb_user> {
    const check = await this.prisma.tb_user.findFirst({
      where: { username: data.username },
    });

    if (check) {
      throw new HttpException(
        {
          metaData: {
            success: false,
            message: 'Data User Gagal Disimpan ! (Username Sudah Digunakan !)',
            status: HttpStatus.CONFLICT,
          },
        },
        HttpStatus.CONFLICT,
      );
    }

    // hashing
    const salt = await genSalt(12);
    const hashedPassword = await hash(data.password, salt);

    await this.prisma.tb_user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
      },
    });

    throw new HttpException(
      {
        metaData: {
          success: true,
          message: 'Data User Berhasil Disimpan',
          status: HttpStatus.CREATED,
        },
      },
      HttpStatus.CREATED,
    );
  }

  async detail(id: number): Promise<tb_user> {
    try {
      const data = await this.prisma.tb_user.findFirst({
        where: { id: Number(id) },
      });

      if (!data) {
        throw new HttpException(
          {
            metaData: {
              success: false,
              message: 'Data User Tidak Ditemukan !',
              status: HttpStatus.NOT_FOUND,
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          metaData: {
            success: true,
            message: '',
            status: HttpStatus.OK,
          },
          result: data,
        },
        HttpStatus.OK,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          metaData: {
            success: false,
            // message: error instanceof Error && error.name,
            message: 'Parameter ID Harus Angka !',
            status: HttpStatus.BAD_REQUEST,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: number): Promise<tb_user> {
    try {
      const data = await this.prisma.tb_user.findFirst({
        where: { id: Number(id) },
      });

      if (!data) {
        throw new HttpException(
          {
            metaData: {
              success: false,
              message: 'Data User Tidak Ditemukan !',
              status: HttpStatus.NOT_FOUND,
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.tb_user.delete({
        where: {
          id: Number(id),
        },
      });

      throw new HttpException(
        {
          metaData: {
            success: true,
            message: 'Data User Berhasil Dihapus',
            status: HttpStatus.OK,
          },
        },
        HttpStatus.OK,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          metaData: {
            success: false,
            message: 'Parameter ID Harus Angka !',
            status: HttpStatus.BAD_REQUEST,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async put(
    id: number,
    data: {
      name: string;
      username: string;
      password: string;
    },
  ): Promise<tb_user> {
    try {
      const check = await this.prisma.tb_user.findFirst({
        where: { id: Number(id) },
      });

      if (!check) {
        throw new HttpException(
          {
            metaData: {
              success: false,
              message: 'Data User Tidak Ditemukan !',
              status: HttpStatus.NOT_FOUND,
            },
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const existing = await this.prisma.tb_user.findFirst({
        where: {
          username: data.username,
          id: {
            not: Number(id),
          },
        },
      });

      if (existing) {
        throw new HttpException(
          {
            metaData: {
              success: false,
              message: 'Data User Gagal Diubah ! (Username Sudah Digunakan !)',
              status: HttpStatus.CONFLICT,
            },
          },
          HttpStatus.CONFLICT,
        );
      }

      if (data.password === '**********') {
        await this.prisma.tb_user.update({
          data: {
            name: data.name,
            username: data.username,
          },
          where: { id: Number(id) },
        });
      } else {
        // hashing
        const salt = await genSalt(12);
        const hashedPassword = await hash(data.password, salt);

        await this.prisma.tb_user.update({
          data: {
            name: data.name,
            username: data.username,
            password: hashedPassword,
          },
          where: { id: Number(id) },
        });
      }

      throw new HttpException(
        {
          metaData: {
            success: true,
            message: 'Data User Berhasil Diubah',
            status: HttpStatus.CREATED,
          },
        },
        HttpStatus.CREATED,
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          metaData: {
            success: false,
            message: 'Parameter ID Harus Angka !',
            status: HttpStatus.BAD_REQUEST,
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
