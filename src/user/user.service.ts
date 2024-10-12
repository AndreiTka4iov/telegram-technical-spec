import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserSession, UserSessionStep } from './dto/session.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Context, NarrowedContext } from 'telegraf';
import { upserUser } from './dto/user.dto';
import { Update, Message } from 'telegraf/typings/core/types/typegram';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class UserService {
  private userSessions: Map<number, UserSession> = new Map();

  constructor(
    @Inject(forwardRef(() => MessageService))
    private message: MessageService,
    private readonly prisma: PrismaService,
  ) {}

  private getSession(id: number) {
    return this.userSessions.get(id);
  }

  private setSession(id: number, session: UserSession) {
    return this.userSessions.set(id, session);
  }

  private setSessionStep(id: number, step: UserSessionStep) {
    return this.userSessions.set(id, { step });
  }

  private deleteSession(id: number) {
    return this.userSessions.delete(id);
  }

  private async getUserOrSession(id: number) {
    const user = await this.findUserByTelegramId(id);
    const session = this.getSession(id);

    return { user, session, statusUser: user?.status };
  }

  private async getUserAndStatus(id: number) {
    console.log(id);

    const user = await this.findUserByTelegramId(id);

    console.log('user: ', user);

    return { user, statusUser: user?.status };
  }

  async findUserByTelegramId(userId: number) {
    return await this.prisma.user.findUnique({
      where: { telegram_id: userId },
    });
  }

  async upsertUserByTelegramId(userId: number, data: upserUser) {
    return await this.prisma.user.upsert({
      where: { telegram_id: userId },
      create: { telegram_id: userId, ...data },
      update: data,
    });
  }

  async standartCheckUserByTelegramId(userId: number, ctx: Context) {
    const { user, session, statusUser } = await this.getUserOrSession(userId);

    if (statusUser === 'BLOCKED') {
      this.message.onBlocked(ctx);
      throw new Error(`${userId} - заблокирован`);
    }

    if (statusUser !== 'ACTIVE' && !session) {
      this.message.onFirstStart(ctx);
      throw new Error(`${userId} - Не зарегистррированный пользователь`);
    }

    return user;
  }

  async switchByStatus(
    ctx: NarrowedContext<
      Context<Update>,
      {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
      }
    >,
  ) {
    const userId = ctx.from.id;
    const session = this.getSession(userId);

    let result: 'OK' | 'BLOCKED' = 'OK';

    if (!session) return result;

    switch (session.step) {
      case 'ENABLE_VOICE':
        await this.message.questionVoiceMode(ctx);

        result = 'BLOCKED';
        break;
      case 'API_KEY':
        session.apiKey = ctx.message.text;
        this.setSession(userId, session);

        const data: upserUser = {
          first_name: ctx.from.first_name,
          last_name: ctx.from.last_name,
          username: ctx.from.username,
          enable_voice: !!session.enableVoice,
          yandex_token: session.apiKey,
          status: 'ACTIVE',
        };
        await this.upsertUserByTelegramId(userId, data);

        this.deleteSession(userId);

        this.message.finalRegistration(ctx);
        result = 'BLOCKED';
        break;
      default:
        break;
    }

    return result;
  }

  async onStart(ctx: Context) {
    const userId = ctx.from.id;
    const { session, statusUser } = await this.getUserOrSession(userId);

    const exsistOrBlock = statusUser === 'ACTIVE' || statusUser === 'BLOCKED';

    if (exsistOrBlock) return await this.message.onStartActiveOrBlocked(ctx, statusUser);
    if (session) return await this.message.alreadyStartSession(ctx);

    return await this.message.onFirstStart(ctx);
  }

  async registrationComand(ctx: Context) {
    await this.prisma.user;
    const userId = ctx.from.id;
    const { session, statusUser } = await this.getUserOrSession(userId);

    if (statusUser === 'ACTIVE') return await this.message.regAgain(ctx);
    if (session) return await this.message.alreadyStartSession(ctx);

    this.setSessionStep(ctx.from.id, 'ENABLE_VOICE');
    return await this.message.questionVoiceMode(ctx);
  }

  async registrationAction(ctx: Context) {
    const userId = ctx.from.id;

    this.setSessionStep(userId, 'ENABLE_VOICE');
    return await this.message.questionVoiceMode(ctx);
  }

  async cancelRegistrationAction(ctx: Context) {
    const userId = ctx.from.id;

    this.deleteSession(userId);
    return await this.message.canceledRegistration(ctx);
  }

  async onSelectVoiceMode(ctx: Context, enabled: boolean) {
    const userId = ctx.from.id;

    if (enabled) return await this.onEnableVoiceMode(ctx, userId);
    else return await this.onDisableVoiceMode(ctx, userId);
  }

  async onEnableVoiceMode(ctx: Context, userId: number) {
    const { user, statusUser } = await this.getUserAndStatus(userId);

    if (user) this.setSessionStep(userId, 'ENABLE_VOICE');

    const session = this.getSession(userId);
    if (!session) return;

    if (statusUser === 'ACTIVE') {
      session.apiKey = user.yandex_token;

      this.setSession(userId, session);
    }

    session.enableVoice = true;
    session.step = 'API_KEY';

    this.setSession(userId, session);

    return await this.message.enableVoiceMode(ctx);
  }

  async onDisableVoiceMode(ctx: Context, userId: number) {
    const session = this.getSession(userId);
    if (!session) return;

    session.enableVoice = false;
    this.setSession(userId, session);

    await this.message.disableVoiceMode(ctx);

    const data: upserUser = {
      first_name: ctx.from.first_name,
      last_name: ctx.from.last_name,
      username: ctx.from.username,
      enable_voice: !!session.enableVoice,
      yandex_token: session.apiKey,
      status: 'ACTIVE',
    };
    await this.upsertUserByTelegramId(userId, data);

    this.deleteSession(userId);

    return await this.message.finalRegistration(ctx);
  }
}
