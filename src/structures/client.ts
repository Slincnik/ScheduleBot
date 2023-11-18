import { Telegraf, Context } from 'telegraf';
import { dirname } from 'path';
import { glob } from 'glob';

import { CommandType, ImportCommand } from './command.js';
import { initialDatabase } from '../utils/subs.js';

export class ExtendedTelegrafClient extends Telegraf {
  public hearsCommands: Map<string, CommandType> = new Map();
  public commands: Map<string, CommandType> = new Map();

  constructor(token: string, options?: Partial<Telegraf.Options<Context>>) {
    super(token, options);
  }

  async startBot() {
    console.log('Бот запущен');
    await initialDatabase();
    this.registerModules();
    await this.launch();
  }
  async importFile(filePath: string) {
    return (await import(`file://${filePath}`))?.default;
  }

  async registerModules() {
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
