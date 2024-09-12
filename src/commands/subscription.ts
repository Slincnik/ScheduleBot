import { Markup } from 'telegraf';
import { CommandHandler } from '../structures/command.js';
import { subscriptionManager } from '../utils/subs.js';
import { client } from '../index.js';

export default new CommandHandler({
  name: 'subscription',
  description: 'Управление подпиской на рассылку расписания',
  async execute(ctx) {
    const subscription = subscriptionManager.getUser(ctx.message.from.id);

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
  const result = subscriptionManager.toggle(ctx.from!.id);
  await ctx.deleteMessage();
  if (!result) {
    await ctx.sendMessage('У вас уже есть подписка');
    return;
  }
  await ctx.sendMessage('Вы подписались на рассылку расписания');
});

client.action('sub_off', async (ctx) => {
  const result = subscriptionManager.toggle(ctx.from!.id);
  await ctx.deleteMessage();
  if (!result) {
    await ctx.sendMessage('У вас нету подписки');
    return;
  }
  await ctx.sendMessage('Вы отписались от рассылки расписания');
});
