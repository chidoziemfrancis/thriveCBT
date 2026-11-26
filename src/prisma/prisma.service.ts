import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { ConfigService } from '../config/config.service.js';
import { PrismaClient } from '../generated/prisma/client.js';

// Connects on first query, so the app can start and report itself unhealthy if the database is down.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({ connectionString: config.get('DATABASE_URL') }),
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
