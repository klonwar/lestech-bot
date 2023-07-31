import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { adminUsername } from '../bot.constants';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  private static readonly DEFAULT_MESSAGE = `Error occurred. Please try again later or contact @${adminUsername}`;

  private readonly logger = new Logger(AnyExceptionFilter.name);

  catch(exception, host): any {
    const tg = TelegrafExecutionContext.create(host);
    const botContext = tg.getContext<Context>();
    const message =
      'text' in botContext.message
        ? `"${botContext.message.text}"`
        : `(not text)`;

    this.logger.error(
      `Exception caught when user @${
        botContext.from.username || botContext.from.id
      } wrote message ${message}`,
    );
    this.logger.error(exception.stack);

    return AnyExceptionFilter.DEFAULT_MESSAGE;
  }
}
