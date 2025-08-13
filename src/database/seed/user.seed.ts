import { User } from '#/user/entity/user.entity';
import { hash } from 'bcrypt';

export class UserSeed {
  static Entity = User;

  async getItems(): Promise<User[]> {
    const items: Partial<User>[] = [
      {
        email: 'hello@kokedama.cc',
        password: await hash('daily+guide123', 10),
        providerId: 'custom',
        isAnonymous: false,
        displayName: 'Kokedama',
      },
      {
        email: 'abreuthrj@gmail.com',
        password: await hash('daily+guide123', 10),
        providerId: 'custom',
        isAnonymous: false,
        displayName: 'Thiago Abreu',
      },
    ];

    return items.map((item) => {
      const entity = new User();

      for (const key in item) {
        entity[key] = item[key];
      }

      return entity;
    });
  }
}
