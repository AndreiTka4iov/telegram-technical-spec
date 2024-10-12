import { forwardRef, Module } from '@nestjs/common';
import { YandexSpeechKitModule } from 'src/yandex-speech-kit/yandex-speech-kit.module';
import { UserModule } from 'src/user/user.module';
import { MessageService } from './message.service';

@Module({
  imports: [forwardRef(() => UserModule), YandexSpeechKitModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
