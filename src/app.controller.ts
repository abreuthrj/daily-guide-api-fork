import { Controller, Get, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import * as fs from 'fs';
import { AppService } from './app.service';
import { AstroService } from './astro/astro.service';
import { DynamoDBService } from './aws/dynamodb/dynamodb.service';
import { Development } from './decorator/development.decorator';
import { Public } from './decorator/public.decorator';
import { Result } from './entity/result.entity';
import { UserGenerator } from './generator/user-generator.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userGenerator: UserGenerator,
    private readonly dynamoDBService: DynamoDBService,
    private readonly astroService: AstroService,
  ) {}

  @Development()
  @Public()
  @Get()
  getHello(): string {
    return `${process.env.NODE_ENV}
${process.env.NODE_TYPE}
${this.appService.getHello()}
    `;
  }

  @Public()
  @Get('health')
  healthCheck(): boolean {
    return this.appService.healthCheck();
  }

  @Development()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Genenrate users from json',
    type: Result,
  })
  @Post('/generate-users')
  async generateUsers(): Promise<any> {
    // const generatedUsers = await this.userGenerator.generateUsers();
    const users = JSON.parse(fs.readFileSync('users.json').toString()) as any[];

    users.forEach((user) => {
      user.displayName = user.name;
      user.language = 'pt-BR';
    });

    const generatedStories = await this.userGenerator.generateStories(users);

    return generatedStories;
  }

  @Development()
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Genenrate users planets from json',
    type: Result,
  })
  @Post('/generate-planets')
  async generatePlanets(): Promise<any> {
    // const generatedUsers = await this.userGenerator.generateUsers();
    const users = JSON.parse(fs.readFileSync('users.json').toString()) as any[];

    users.forEach((user) => {
      user.displayName = user.name;
      user.language = 'pt-BR';
      user.utcOffset = -3;
      user.birthdate = new Date(user.birthdate);
    });

    for (const user of users) {
      user.planets = await this.astroService.planetsForUser(user);
    }

    return users;
  }

  @Development()
  @Public()
  @Get('dynamodb')
  async dynamodb(): Promise<any> {
    return await this.dynamoDBService.scan('story-categories');
  }
}
