// src/prisma/prisma.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // super() {}

  async onModuleInit() {
    await (this.$connect as () => Promise<void>)();
  }
  async onModuleDestroy() {
    await (this.$disconnect as () => Promise<void>)();
  }
}
