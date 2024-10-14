import { Injectable, OnModuleInit } from '@nestjs/common';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;

  constructor(
    private user: UserService,
    private message: MessageService,
  ) {}

  onModuleInit() {
    this.bot = new Telegraf(process.env.BOT_TOKEN);

    this.bot.start(async (ctx) => await this.user.onStart(ctx));

    this.bot.command('registration', async (ctx) => await this.user.registrationComand(ctx));
    this.bot.command('remove', async (ctx) => await this.user.removeComand(ctx));

    this.bot.action('CANCEL', async (ctx) => await this.user.cancelRegistrationAction(ctx));
    this.bot.action('REGISTER', async (ctx) => await this.user.registrationAction(ctx));
    this.bot.action('CONTINUE', async (ctx) => await this.user.registrationAction(ctx));
    this.bot.action('ENABLE_VOICE_INPUT', async (ctx) => this.user.onSelectVoiceMode(ctx, true));
    this.bot.action('DISABLE_VOICE_INPUT', async (ctx) => this.user.onSelectVoiceMode(ctx, false));
    this.bot.action('ESC_REMOVE', async (ctx) => this.user.onActionRemove(ctx, false));
    this.bot.action('CONTINUE_REMOVE', async (ctx) => this.user.onActionRemove(ctx, true));

    this.bot.on('text', async (ctx) => this.message.onTextEvent(ctx));
    this.bot.on('voice', async (ctx) => await this.message.onVoiceMessage(ctx));

    this.bot.launch();
  }
}
