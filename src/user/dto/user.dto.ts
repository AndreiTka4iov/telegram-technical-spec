import { user } from '@prisma/client';

export type upserUser = Omit<user, 'id' | 'telegram_id' | 'createdAt'>;
