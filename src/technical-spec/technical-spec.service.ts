import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TechnicalSpecService {
  private readonly apiUrl = process.env.OPENAI_API_URL;
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private axios: AxiosInstance;

  private readonly testTask = `Создай задачу на основе текста, разультат должен быть в формате json. 
  Задача: создать бота в телеграм для создания задач с голосовым вводом, дедлайн 2 месяца с начала текущей даты. бот должен уметь распозновывать голосовые сообщения. Также составь стек технологий для Node js для этого проекта.`;

  constructor() {
    this.axios = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  async sendMessageToChatGPT(message: string) {
    try {
      const response = await this.axios.post('', {
        model: 'gpt-4',
        messages: [{ role: 'user', content: message }],
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      Logger.error(error.message);

      throw error;
    }
  }
}
