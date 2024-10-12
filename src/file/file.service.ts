import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class FileService {
  async getFileUrl(fileId: string): Promise<string> {
    const response = await axios.get(
      `${process.env.TELEGRAM_URL_API}/bot${process.env.BOT_TOKEN}/getFile?file_id=${fileId}`,
    );

    return `${process.env.TELEGRAM_URL_API}/file/bot${process.env.BOT_TOKEN}/${response.data.result.file_path}`;
  }

  async downloadBuffer(fileUrl: string): Promise<Buffer> {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data, 'binary');
  }

  convertBufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }
}
