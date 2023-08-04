import { Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ConfigService } from '@nestjs/config';

@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  private readonly DEFAULT_MESSAGE = `Error occurred. Please try again later or contact @${this.configService.get<string>(
    'ADMIN',
  )}`;

  private readonly logger = new Logger(AnyExceptionFilter.name);

  constructor(private configService: ConfigService) {}

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

    return this.DEFAULT_MESSAGE;
  }
}
