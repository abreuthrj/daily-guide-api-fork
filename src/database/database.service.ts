import { Result } from '#/entity/result.entity';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
// import { StoryCategorySeed } from './seed/story-category.seed';
import { UserSeed } from './seed/user.seed';

@Injectable()
export class DatabaseService {
  static seedList = [UserSeed];

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async seed(): Promise<Result> {
    const result = new Result();

    await this.entityManager.transaction(async (manager) => {
      for (const Seed of DatabaseService.seedList) {
        const seed = new Seed();
        await manager.save(await seed.getItems());
      }

      result.success = true;
    });

    return result;
  }

  async unseed(): Promise<Result> {
    const result = new Result();

    await this.entityManager.transaction(async (manager) => {
      for (const Seed of DatabaseService.seedList) {
        await manager.clear(Seed.Entity);
      }

      result.success = true;
    });

    return result;
  }

  async flush(): Promise<Result> {
    const result = new Result();

    await this.entityManager.connection.dropDatabase();
    await this.sync();
    await this.seed();

    result.success = true;

    return result;
  }

  async sync(): Promise<Result> {
    const result = new Result();

    await this.entityManager.connection.synchronize();
    result.success = true;

    return result;
  }
}
