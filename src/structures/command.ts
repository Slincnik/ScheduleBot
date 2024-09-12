import { Context } from 'telegraf';
import { Update, Message } from 'telegraf/types';

type ExecuteContext = Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}>;

type ExecuteReturn = Promise<void | Message.TextMessage>;

type ExecuteFunction = (ctx: ExecuteContext) => ExecuteReturn;

type CommandExecute = (ctx: ExecuteContext, args: string[]) => ExecuteReturn;

export interface CommandOptions {
  name: string;
  description: string;
  isDev?: boolean;
  execute: CommandExecute;
}

export interface Command {
  options: CommandOptions;
  executeCommand: ExecuteFunction;
}

export class CommandHandler implements Command {
  public options: CommandOptions;

  constructor(options: CommandOptions) {
    this.options = options;
  }

  async executeCommand(ctx: ExecuteContext): ExecuteReturn {
    if (this.isDeveloperCommand(ctx)) {
      return ctx.reply('Данная команда предназначена только для разработчиков!');
    }

    const args = this.parseArguments(ctx);
    return this.options.execute(ctx, args);
  }

  private isDeveloperCommand(ctx: ExecuteContext): boolean {
    return (this.options.isDev ?? false) && ctx.message.from.id !== Number(process.env.ADMIN_ID);
  }

  private parseArguments(ctx: ExecuteContext): string[] {
    return ctx.message.text.split(' ').slice(1);
  }
}
