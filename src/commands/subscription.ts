import { Markup } from 'telegraf';
import { CommandHandler } from '../structures/command.js';
import { disableUserSub, enableUserSub, returnUserSub } from '../utils/subs.js';
import { bot } from '../index.js';

export default new CommandHandler({
  name: 'subscription',
  async execute(ctx) {
    const subscription = await returnUserSub(ctx.message.from.id);

    return ctx.reply(
      `Ваша подписка ${subscription ? 'активна' : 'неактивна'}`,
      Markup.inlineKeyboard([
        Markup.button.callback('Подписаться', 'sub_on'),
        Markup.button.callback('Отписаться', 'sub_off'),
      ]),
    );
  },
});

bot.action('sub_on', async (ctx) => {
  const result = await enableUserSub(ctx.from!.id);
  await ctx.deleteMessage();
  if (!result) {
    await ctx.sendMessage('У вас уже есть подписка');
    return;
  }
  await ctx.sendMessage('Вы подписались на рассылку расписания');
});

bot.action('sub_off', async (ctx) => {
  const result = await disableUserSub(ctx.from!.id);
  await ctx.deleteMessage();
  if (!result) {
    await ctx.sendMessage('У вас нету подписки');
    return;
  }
  await ctx.sendMessage('Вы отписались от рассылки расписания');
});
