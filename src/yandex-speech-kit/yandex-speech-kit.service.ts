import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { getRecognitionResult } from './dto/getRecognition.dto';
import { FileService } from 'src/file/file.service';
import { user } from '@prisma/client';

@Injectable()
export class YandexSpeechKitService {
  constructor(private file: FileService) {}
  async getTextResult(fileId: string, user: user) {
    const apiKey = user.yandex_token;
    const fileUrl = await this.file.getFileUrl(fileId);
    const audioBuffer = await this.file.downloadBuffer(fileUrl);

    try {
      return await this.sendVoiceToYandexV1(audioBuffer, apiKey);
    } catch (error) {
      const base64Audio = this.file.convertBufferToBase64(audioBuffer);
      const operationId = await this.sendAudioToYandexV3(base64Audio, apiKey);

      return await this.pollYandexOperation(operationId, apiKey);
    }
  }

  private async sendVoiceToYandexV1(buffer: Buffer, apiKey: string) {
    try {
      const response = await axios.post('https://stt.api.cloud.yandex.net/speech/v1/stt:recognize', buffer, {
        params: {
          lang: 'ru-RU',
        },
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          'Content-Type': 'application/ogg',
        },
      });
      return response.data.result;
    } catch (error) {
      throw Error(error);
    }
  }

  private async sendAudioToYandexV3(base64Audio: string, apiKey: string) {
    try {
      const requestBody = {
        recognitionModel: {
          model: 'general',
          audioFormat: {
            containerAudio: {
              containerAudioType: 'OGG_OPUS',
            },
          },
          textNormalization: {
            textNormalization: 'TEXT_NORMALIZATION_ENABLED',
            profanityFilter: true,
            literatureText: true,
          },
        },
        content: base64Audio,
      };

      const response = await axios.post(`https://stt.api.cloud.yandex.net/stt/v3/recognizeFileAsync`, requestBody, {
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data.id;
    } catch (error) {
      throw Error(error);
    }
  }

  private async pollYandexOperation(operationId: string, apiKey: string) {
    let isCompleted = false;
    let transcription = '';

    try {
      while (!isCompleted) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const response = await axios.get(
          `https://stt.api.cloud.yandex.net/stt/v3/getRecognition?operationId=${operationId}`,
          {
            headers: {
              Authorization: `Api-Key ${apiKey}`,
            },
          },
        );

        const value = this.findTextValue(response.data);
        if (!!value) {
          isCompleted = true;
          transcription = value;
        }
      }

      return transcription;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private findTextValue(data: string): string | null {
    const arr = data.split('\n').filter((str) => str.trim() !== '');
    const recognition = arr.map((str) => JSON.parse(str).result as getRecognitionResult);
    const finalRefinement = recognition.find((obj) => 'finalRefinement' in obj);
    if (!finalRefinement) return null;

    const alternatives = finalRefinement.finalRefinement.normalizedText.alternatives;
    const resultValue = alternatives[alternatives.length - 1].text;

    return resultValue;
  }
}
