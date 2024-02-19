import { Markup } from 'telegraf';
import { CommandHandler } from '../structures/command.js';
import {
  disableUserSubscription,
  enableUserSubscription,
  getUserSubscription,
} from '../utils/subs.js';
import { client } from '../index.js';

export default new CommandHandler({
  name: 'subscription',
  async execute(ctx) {
    const subscription = getUserSubscription(ctx.message.from.id);

    return ctx.reply(
      `Ваша подписка ${subscription ? 'активна' : 'неактивна'}`,
      Markup.inlineKeyboard([
        Markup.button.callback('Подписаться', 'sub_on'),
        Markup.button.callback('Отписаться', 'sub_off'),
      ]),
    );
  },
});

client.action('sub_on', async (ctx) => {
  const result = enableUserSubscription(ctx.from!.id);
  await ctx.deleteMessage();
  if (!result) {
    await ctx.sendMessage('У вас уже есть подписка');
    return;
  }
  await ctx.sendMessage('Вы подписались на рассылку расписания');
});

client.action('sub_off', async (ctx) => {
  const result = disableUserSubscription(ctx.from!.id);
  await ctx.deleteMessage();
  if (!result) {
    await ctx.sendMessage('У вас нету подписки');
    return;
  }
  await ctx.sendMessage('Вы отписались от рассылки расписания');
});
