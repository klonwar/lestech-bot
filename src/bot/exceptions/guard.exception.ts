import { ForbiddenException } from '@nestjs/common';

export class GuardException extends ForbiddenException {}
