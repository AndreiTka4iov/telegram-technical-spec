import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { NotionModule } from './notion/notion.module';
import { TelegramModule } from './telegram/telegram.module';
import { YandexSpeechKitModule } from './yandex-speech-kit/yandex-speech-kit.module';
import { MessageModule } from './message/message.module';
import { ErrorHandlingService } from './error-handling/error-handling.service';
import { ErrorHandlingModule } from './error-handling/error-handling.module';
import { UserModule } from './user/user.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    PrismaModule,
    NotionModule,
    TelegramModule,
    YandexSpeechKitModule,
    FileModule,
    UserModule,
    MessageModule,
    ErrorHandlingModule,
  ],
  controllers: [AppController],
  providers: [AppService, ErrorHandlingService],
})
export class AppModule {}
