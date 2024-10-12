import { forwardRef, Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { UserService } from './user.service';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [forwardRef(() => MessageModule), PrismaModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
