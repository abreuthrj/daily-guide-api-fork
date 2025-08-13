import { OpenAIConfig } from '#/config/interfaces/openai-config.interface';
import openaiConfig from '#/config/openai-config';
import { User } from '#/user/entity/user.entity';
import { HttpUtil } from '#/utils/http';
import { Inject, Injectable } from '@nestjs/common';
import { CompletionResponse } from './interfaces/completion-response.interface';

@Injectable()
export class OpenaiService {
  private readonly httpUtil: HttpUtil;

  constructor(
    @Inject(openaiConfig.KEY) private readonly openaiConfig: OpenAIConfig,
  ) {
    this.httpUtil = new HttpUtil();
    this.httpUtil.setup('https://api.openai.com/v1', {
      headers: {
        Authorization: `Bearer ${openaiConfig.secret_key}`,
      },
    });
  }

  async autocomplete(
    userId: string,
    prompt: string,
    max_tokens?: number,
  ): Promise<CompletionResponse> {
    const data = {
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: max_tokens ?? 500,
      user: userId,
    };

    const result = await this.httpUtil.post<CompletionResponse>(
      '/chat/completions',
      data,
    );

    return result.data;
  }

  async prompt(userId: string, prompt: string): Promise<string[]> {
    const result = await this.autocomplete(userId, prompt);

    return result.choices.map((choice) => choice.message.content.trim());
  }

  async translate(user: User, text: string, size?: number): Promise<string> {
    const result = await this.autocomplete(
      user.id,
      `Traduza para a lingua "${user.language}" e faça um resumo do texto a seguir: ${text}`,
    );

    return result.choices[0].message.content.trim();
  }
}
