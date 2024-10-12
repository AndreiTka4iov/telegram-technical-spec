import { Test, TestingModule } from '@nestjs/testing';
import { YandexSpeechKitService } from './yandex-speech-kit.service';

describe('YandexSpeechKitService', () => {
  let service: YandexSpeechKitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YandexSpeechKitService],
    }).compile();

    service = module.get<YandexSpeechKitService>(YandexSpeechKitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
