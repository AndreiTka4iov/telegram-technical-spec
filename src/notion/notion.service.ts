import { create } from './dto/create';
import { Client } from '@notionhq/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NotionService {
  async create(data: create) {
    const token = process.env.PORTFOLIO_TOKEN;
    const notion = new Client({ auth: token || data.token });

    if (!data.telegram) data.telegram = 'unspecified';
    if (!data.email) data.email = 'unspecified';

    await notion.pages.create({
      parent: {
        type: 'database_id',
        database_id: data.database,
      },
      properties: {
        Name: {
          title: [
            {
              type: 'text',
              text: {
                content: 'new Message from portfolio',
              },
            },
          ],
        },
        Status: {
          select: {
            name: 'New',
          },
        },
        Email: {
          email: data.email,
        },
        Telegram: {
          url: data.telegram,
        },
        userName: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: data.name,
              },
            },
          ],
        },
        Message: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: data.message,
              },
            },
          ],
        },
      },
    });
  }
}
