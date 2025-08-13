import { AstroService } from '#/astro/astro.service';
import { OpenaiService } from '#/openai/openai.service';
import { StoryService } from '#/story/story.service';
import { UserDto } from '#/user/dto/user.dto';
import { User } from '#/user/entity/user.entity';
import { UserService } from '#/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import { GeneratedStory } from './entity/generated-story';

@Injectable()
export class UserGenerator {
  constructor(
    private readonly userService: UserService,
    private readonly storyService: StoryService,
    private readonly openaiService: OpenaiService,
    private readonly astroService: AstroService,
  ) {}

  async generateUsers(): Promise<User[]> {
    const result = [];

    const users = JSON.parse(fs.readFileSync('users.json').toString());

    for (const user of users) {
      let lookupUser = await User.findOneBy({
        displayName: user.displayName,
      });

      if (!lookupUser) {
        const userDto = new UserDto();

        userDto.dateOfBirth = user.birthdate;
        userDto.displayName = user.displayName;

        lookupUser = await this.userService.update(null, userDto);
      }

      result.push(lookupUser);
    }

    return result;
  }

  async generateStories(users: User[]): Promise<GeneratedStory[]> {
    const result = [];

    const stories = await this.storyService.sequences();

    for (const user of users) {
      try {
        user.planets = await this.astroService.planetsForUser(user);

        const storyCategory = await this.storyService.getById(stories[0].id);

        const promptParams = await this.storyService.getPromptParams(
          user,
          storyCategory.contentPrompt,
        );
        const prompt = this.storyService.prepare(
          storyCategory.contentPrompt,
          promptParams,
        );

        const [content] = await this.openaiService.prompt(user.id, prompt);

        const story = new GeneratedStory();
        story.title = storyCategory.title;
        story.extracted = this.storyService.extractResultParams(content);
        story.raw = content;
        story.prompt = prompt;
        story.displayName = user.displayName;

        result.push(story);
      } catch (error) {
        if (error instanceof UnauthorizedException) {
          continue;
        }

        throw error;
      }
    }

    fs.writeFileSync('users.processed.json', JSON.stringify(result));

    return result;
  }
}
