import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { StatusUser } from '@prisma/client';
import { Context, Markup, NarrowedContext } from 'telegraf';
import { MessagesPreset } from './dto/messages.dto';
import { Update, Message } from 'telegraf/typings/core/types/typegram';

import { YandexSpeechKitService } from 'src/yandex-speech-kit/yandex-speech-kit.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MessageService {
  private mp = MessagesPreset;

  constructor(
    @Inject(forwardRef(() => UserService))
    private tu: UserService,
    private speechKit: YandexSpeechKitService,
  ) {}

  onFirstStart(ctx: Context) {
    const markup = Markup.inlineKeyboard([Markup.button.callback('Регистрация', 'REGISTER')]);

    return ctx.reply(this.mp.welcome, markup);
  }

  onStartActiveOrBlocked(ctx: Context, status: StatusUser) {
    if (status === 'BLOCKED') return this.onBlocked(ctx);
    if (status === 'ACTIVE') return ctx.reply(this.mp.alreadyRegistered);
  }

  onBlocked(ctx: Context) {
    return ctx.reply(this.mp.blocked);
  }

  alreadyStartSession(ctx: Context) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Заново', 'REGISTER'),
      Markup.button.callback('Продолжить', 'CONTINUE'),
    ]);

    return ctx.reply(this.mp.alreadyExsistedSession, markup);
  }

  regAgain(ctx: Context) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Нет', 'CANCEL'),
      Markup.button.callback('Да', 'REGISTER'),
    ]);

    return ctx.reply(this.mp.regAgain, markup);
  }

  canceledRegistration(ctx: Context) {
    return ctx.reply(this.mp.canceledRegistration);
  }

  questionVoiceMode(ctx: Context) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Нет', 'DISABLE_VOICE_INPUT'),
      Markup.button.callback('Да', 'ENABLE_VOICE_INPUT'),
    ]);

    return ctx.reply(this.mp.questionVoiceMode, markup);
  }

  enableVoiceMode(ctx: Context) {
    ctx.reply(this.mp.enableVoiceMode);

    this.manualApiKey(ctx);

    return this.enableVoiceModeIsDone(ctx);
  }

  manualApiKey(ctx: Context) {
    return ctx.reply(this.mp.manualApiKey);
  }

  enableVoiceModeIsDone(ctx: Context) {
    return ctx.reply(this.mp.enableVoiceModeIsDone);
  }

  requestEnabledVoiceMode(ctx: Context) {
    const markup = Markup.inlineKeyboard([
      Markup.button.callback('Нет', 'DISABLE_VOICE_INPUT'),
      Markup.button.callback('Да', 'ENABLE_VOICE_INPUT'),
    ]);

    return ctx.reply(this.mp.enableVoiceModeIsDone, markup);
  }

  disableVoiceMode(ctx: Context) {
    return ctx.reply(this.mp.disableVoiceMode);
  }

  finalRegistration(ctx: Context) {
    return ctx.reply(this.mp.finalRegistration);
  }

  async onTextEvent(
    ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >,
  ) {
    try {
      await this.tu.standartCheckUserByTelegramId(ctx.from.id, ctx);

      const status = await this.tu.switchByStatus(ctx);

      if (status === 'BLOCKED') return status;
    } catch (error) {
      Logger.error(error.message);
    }
  }

  async onVoiceMessage(
    ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.VoiceMessage;
        update_id: number;
      }
    >,
  ) {
    try {
      const user = await this.tu.standartCheckUserByTelegramId(ctx.from.id, ctx);

      if (!user.enable_voice) return this.requestEnabledVoiceMode(ctx);

      const fileId = ctx.message.voice.file_id;
      const transcription = await this.speechKit.getTextResult(fileId, user);
      await ctx.reply(`Расшифрованное сообщение: ${transcription}`);
    } catch (error) {
      ctx.reply('Не удалось обработать голосовое сообщение.');
    }
  }
}