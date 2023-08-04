import {
  Catch,
  ExceptionFilter,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { GuardException } from '../exceptions/guard.exception';
import { ConfigService } from '@nestjs/config';

@Catch(ForbiddenException)
export class GuardExceptionFilter implements ExceptionFilter {
  private readonly DEFAULT_MESSAGE = `Your are not allowed to do this yet. Please contact @${this.configService.get<string>(
    'ADMIN',
  )} if you think this is a mistake`;
  private readonly logger = new Logger(GuardExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception, host): any {
    const tg = TelegrafExecutionContext.create(host);
    const botContext = tg.getContext<Context>();
    const message =
      'text' in botContext.message
        ? `"${botContext.message.text}"`
        : `(not text)`;

    this.logger.warn(
      `Forbidden for user @${
        botContext.from.username || botContext.from.id
      } to write message ${message}`,
    );

    if (exception instanceof GuardException && exception.message) {
      return exception.message;
    }

    return this.DEFAULT_MESSAGE;
  }
}
