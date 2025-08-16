import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { tb_user } from '@prisma/client';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt_auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getData(): Promise<tb_user> {
    return this.userService.get();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async postData(
    @Body() body: { name: string; username: string; password: string },
  ): Promise<tb_user> {
    return this.userService.post(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async detailData(@Param('id') id: number): Promise<tb_user> {
    return this.userService.detail(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteData(@Param('id') id: number): Promise<tb_user> {
    return this.userService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async putData(
    @Param('id') id: number,
    @Body() body: { name: string; username: string; password: string },
  ): Promise<tb_user> {
    return this.userService.put(id, body);
  }
}
