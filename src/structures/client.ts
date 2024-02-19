import { config } from 'dotenv';
import { Context, Telegraf } from 'telegraf';
import { dirname } from 'path';
import { glob } from 'glob';
import { JSONFileSyncPreset } from 'lowdb/node';

import { CommandType, ImportCommand } from './command.js';

import { BOT_IS_DEV } from '../utils/utils.js';

config();

const { IS_DEV, DATABASE_PATH } = process.env;

export const db = JSONFileSyncPreset<{
  subscription: number[];
}>(DATABASE_PATH, {
  subscription: [],
});

export default class ExtendedClient extends Telegraf<Context> {
  public hearsCommands: Map<string, CommandType> = new Map();

  public commands: Map<string, CommandType> = new Map();

  constructor(token: string, options?: Partial<Telegraf.Options<Context>>) {
    super(token, options);

    this.use(async (ctx, next) => {
      if (IS_DEV === 'true' && ctx.message!.from.id !== Number(process.env.ADMIN_ID)) {
        ctx.reply(BOT_IS_DEV);
        await next();
      }

      await next();
    });
  }

  async init() {
    console.log('Бот запущен');
    await this.registerModules();
    await this.launch();
  }

  // eslint-disable-next-line class-methods-use-this
  async importFile(filePath: string) {
    return (await import(`file://${filePath}`))?.default;
  }

  async registerModules() {
    // eslint-disable-next-line no-underscore-dangle
    const __dirname = dirname(new URL(import.meta.url).pathname);
    // Hears Handler
    const hearsFiles = await glob(`${__dirname}/../hearCommands/*{.ts,.js}`);

    hearsFiles.forEach(async (filePath) => {
      const command: ImportCommand = await this.importFile(filePath);

      if (!command.options.name) return;

      this.hearsCommands.set(command.options.name, command.options);

      this.hears(command.options.name, (ctx) => command.executeCommand(ctx));
    });

    // Command Handler
    const commandFiles = await glob(`${__dirname}/../commands/*{.ts,.js}`);

    commandFiles.forEach(async (filePath) => {
      const command: ImportCommand = await this.importFile(filePath);

      if (!command.options.name) return;

      this.commands.set(command.options.name, command.options);

      this.command(command.options.name, (ctx) => command.executeCommand(ctx));
    });
  }
}
