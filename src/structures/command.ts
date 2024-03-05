import { Context } from 'telegraf';
import { Update, Message } from 'telegraf/types';

type ExecuteContext = Context<{
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}>;

type ExecuteReturn = Promise<void | Message.TextMessage>;

type ExecuteFunction = (ctx: ExecuteContext) => ExecuteReturn;

type TypeExecutedCommand = (ctx: ExecuteContext, args: string[]) => ExecuteReturn;

export type CommandType = {
  name: string;
  isDev?: boolean;
  execute: TypeExecutedCommand;
};

export type ImportCommand = {
  options: CommandType;
  executeCommand: ExecuteFunction;
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
    const args = ctx.message.text.split(' ').slice(1);

    const result = await this.options.execute(ctx, args);

    return result;
  }
}
