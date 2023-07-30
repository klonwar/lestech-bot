import { BotCommand } from 'typegram';

export enum AvailableCommands {
  START = 'start',
  CHECK = 'check',
  TOP = 'top',
}

export const BotCommandsDescriptions: Record<AvailableCommands, string> = {
  [AvailableCommands.START]: 'Set/Change your ID',
  [AvailableCommands.CHECK]: 'Check updates and get info about you',
  [AvailableCommands.TOP]: 'Get top of bot users',
};

export const myCommands: BotCommand[] = Object.entries(
  BotCommandsDescriptions,
).map(([key, value]) => ({
  command: key,
  description: value,
}));
