import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CommandBodyPipe implements PipeTransform {
  transform(value: any) {
    return value.replace(/\/[a-zA-Z]+\s*/, '');
  }
}
