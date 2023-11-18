import { Context } from 'telegraf';
import { Update, Message } from 'telegraf/types';

type ExecuteContext = Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}>;

type ExecuteReturn = Promise<void | Message.TextMessage | undefined>;

type ExecuteFunction = (ctx: ExecuteContext) => ExecuteReturn;

export type ImportCommand = {
  options: CommandType;
  executeCommand: ExecuteFunction
};

export type CommandType = {
  name: string;
  isDev?: boolean;
  execute: ExecuteFunction;
};

export class CommandHandler {
  private options: CommandType;

  constructor(options: CommandType) {
    this.options = options;
  }

  async executeCommand(ctx: ExecuteContext): ExecuteReturn {
    if (this.options.isDev && ctx.message!.from.id !== Number(process.env.ADMIN_ID)) {
      return ctx.reply('Данная команда предназначена только для разработчиков!');
    }

    await this.options.execute(ctx);
  }
}
