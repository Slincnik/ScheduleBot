import { config } from 'dotenv';
import { Context, Telegraf } from 'telegraf';
import { dirname } from 'path';
import { glob } from 'glob';
import { JSONFileSyncPreset } from 'lowdb/node';

import { Command, CommandOptions } from './command.js';
import { CONSTANTS } from '../utils/utils.js';

config();

const { IS_DEV, DATABASE_PATH } = process.env;

export const db = JSONFileSyncPreset<{
  subscription: number[];
}>(DATABASE_PATH, {
  subscription: [],
});

export default class ExtendedClient extends Telegraf<Context> {
  private hearsCommands: Map<string, CommandOptions> = new Map();
  private commands: Map<string, CommandOptions> = new Map();

  constructor(token: string, options?: Partial<Telegraf.Options<Context>>) {
    super(token, options);
    this.setupMiddleware();
  }

  private setupMiddleware() {
    this.use(async (ctx, next) => {
      if (IS_DEV === 'true' && ctx.message?.from.id !== Number(process.env.ADMIN_ID)) {
        await ctx.reply(CONSTANTS.BOT_IS_DEV);
      }
      await next();
    });
  }

  async init() {
    console.log('Бот запущен');
    await this.registerModules();
    await this.launch();
  }

  private async importFile(filePath: string) {
    return (await import(`file://${filePath}`))?.default;
  }

  private async registerModules() {
    const __dirname = dirname(new URL(import.meta.url).pathname);
    await this.registerCommands(__dirname);
  }

  private async registerCommands(baseDir: string) {
    const commandFiles = await glob(`${baseDir}/../commands/*{.ts,.js}`);
    let registeredCount = 0;

    for (const filePath of commandFiles) {
      try {
        await this.registerCommand(filePath, this.commands, (command) =>
          this.command(command.options.name, (ctx) => command.executeCommand(ctx)),
        );
        registeredCount++;
      } catch (error) {
        console.error(`Error registering command from ${filePath}:`, error);
      }
    }

    console.log(`Total commands registered: ${registeredCount}`);
    await this.setCommandDescriptions();
  }

  private async registerCommand(
    filePath: string,
    commandMap: Map<string, CommandOptions>,
    registerFn: (command: Command) => void,
  ) {
    const command: Command = await this.importFile(filePath);
    if (command?.options?.name) {
      commandMap.set(command.options.name, command.options);
      registerFn(command);
    }
  }

  private async setCommandDescriptions() {
    const commands = Array.from(this.commands.values()).map((command) => ({
      command: command.name,
      description: command.description,
    }));
    await this.telegram.setMyCommands(commands);
  }
}
