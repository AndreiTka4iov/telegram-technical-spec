import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [UserModule, MessageModule],
  providers: [TelegramService],
})
export class TelegramModule {}
