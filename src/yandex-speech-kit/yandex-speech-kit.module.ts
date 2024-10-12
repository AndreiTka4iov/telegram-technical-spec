import { Module } from '@nestjs/common';
import { YandexSpeechKitService } from './yandex-speech-kit.service';
import { FileModule } from 'src/file/file.module';

@Module({
  imports: [FileModule],
  providers: [YandexSpeechKitService],
  exports: [YandexSpeechKitService],
})
export class YandexSpeechKitModule {}
