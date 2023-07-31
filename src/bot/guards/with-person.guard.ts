import { CanActivate, ExecutionContext, mixin } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../model/user/user.model';
import { Repository } from 'typeorm';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { GuardException } from '../exceptions/guard.exception';

class WithPersonGuardMixin implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(executionContext: ExecutionContext): Promise<boolean> {
    const tg = TelegrafExecutionContext.create(executionContext);
    const botContext = tg.getContext<Context>();
    const user = await this.userRepository.findOneBy({
      id: botContext.from.id,
    });

    if (!user || !user.person) {
      throw new GuardException(
        `You need to specify your ID, please run /start command`,
      );
    }

    return true;
  }
}

export const WithPersonGuard = mixin(WithPersonGuardMixin);
