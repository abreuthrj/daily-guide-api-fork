export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Choice {
  message: Message;
  index: number;
  logprobs?: any;
  finish_reason: 'stop' | 'length';
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
}
