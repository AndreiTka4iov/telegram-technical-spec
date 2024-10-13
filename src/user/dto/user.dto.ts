import { User } from '@prisma/client';

export type upserUser = Omit<User, 'id' | 'telegram_id' | 'createdAt'>;
