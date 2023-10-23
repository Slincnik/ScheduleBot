'use strict';

import { config } from 'dotenv';

config();

import { Telegraf, Markup } from 'telegraf';
import { DateTime } from 'luxon';
import { CronJob } from 'cron';
import {
  getWeekNumber,
  parityOfWeek,
  parityWeek,
  loadJSON,
  returnScheduleFromDayOfWeek,
  returnCouplesMessage,
  returnScheduleFromWeek,
  BOT_IS_DEV,
} from './src/utils.js';
import { Schedule } from './src/types/index.types.js';
import {
  disableUserSub,
  enableUserSub,
  initialDatabase,
  returnAllSubs,
  returnUserSub,
} from './src/subs.js';

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.telegram.setMyCommands([
  {
    command: 'subscription',
    description: 'Управление подпиской расписаний',
  },
]);

bot.start(async (ctx) => {
  await ctx.reply(
    'Привет',
    Markup.keyboard([
      ['👁 Schedule', 'Вся неделя'],
      ['След.день', 'След.неделя'],
    ]).resize(),
  );
});

const loadScheduleAndReturnAll = (newDate?: DateTime) => {
  const scheduleJson: Schedule[] = loadJSON('./schedule.json');

  const currentDate = newDate ? newDate : DateTime.now();

  const weekNumber = getWeekNumber(currentDate);
  const dayOfWeek = currentDate.setLocale('ru-RU').toLocaleString({ weekday: 'long' });
  const parity = parityOfWeek(currentDate);

  return {
    scheduleJson,
    currentDate,
    weekNumber,
    dayOfWeek,
    parity,
  };
};

bot.command('subscription', async (ctx) => {
  const subscription = await returnUserSub(ctx.message.from.id);
  return ctx.reply(
    `Ваша подписка ${subscription ? 'активна' : 'неактивна'}`,
    Markup.inlineKeyboard([
      Markup.button.callback('Подписаться', 'sub_on'),
      Markup.button.callback('Отписаться', 'sub_off'),
    ]),
  );
});

bot.hears('👁 Schedule', (ctx) => {
  if (Boolean(process.env.IS_DEV) && ctx.message.from.id !== Number(process.env.ADMIN_ID))
    return ctx.reply(BOT_IS_DEV);

  const { scheduleJson, weekNumber, dayOfWeek, parity } = loadScheduleAndReturnAll();

  const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

  if (!findedSchedule?.length) {
    return ctx.reply('Сегодня занятий нету');
  }

  ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n')}
`);
});

bot.hears('След.день', (ctx) => {
  if (Boolean(process.env.IS_DEV) && ctx.message.from.id !== Number(process.env.ADMIN_ID))
    return ctx.reply(BOT_IS_DEV);

  const nextDay = DateTime.now().plus({ day: 1 });

  const { scheduleJson, weekNumber, dayOfWeek, parity } = loadScheduleAndReturnAll(nextDay);

  const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

  if (!findedSchedule?.length) {
    return ctx.reply('Завтра занятий нету');
  }

  ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n')}
`);
});

bot.hears('След.неделя', (ctx) => {
  if (Boolean(process.env.IS_DEV) && ctx.message.from.id !== Number(process.env.ADMIN_ID))
    return ctx.reply(BOT_IS_DEV);

  const nextWeek = DateTime.now().plus({ week: 1 });

  const { scheduleJson, weekNumber, parity } = loadScheduleAndReturnAll(nextWeek);

  const findedSchedule = returnScheduleFromWeek(scheduleJson, parity, weekNumber);

  ctx.reply(
    `Неделя: ${parityWeek[parity]} \n\n${findedSchedule
      .map((value) => {
        if (!value.couples.length) {
          return `🔷🔷 ${value.day} 🔷🔷\nНет пар`;
        }
        return (
          `🔷🔷 ${value.day} 🔷🔷\n` +
          value.couples.map((value) => returnCouplesMessage(value)).join('\n\n')
        );
      })
      .join('\n\n')}`,
  );
});

bot.hears('Вся неделя', (ctx) => {
  if (Boolean(process.env.IS_DEV) && ctx.message.from.id !== Number(process.env.ADMIN_ID))
    return ctx.reply(BOT_IS_DEV);

  const { scheduleJson, weekNumber, parity } = loadScheduleAndReturnAll();

  const findedSchedule = returnScheduleFromWeek(scheduleJson, parity, weekNumber);

  ctx.reply(
    `Неделя: ${parityWeek[parity]} \n\n${findedSchedule
      .map((value) => {
        if (!value.couples.length) {
          return `🔷🔷 ${value.day} 🔷🔷\nНет пар`;
        }
        return (
          `🔷🔷 ${value.day} 🔷🔷\n` +
          value.couples.map((value) => returnCouplesMessage(value)).join('\n\n')
        );
      })
      .join('\n\n')}`,
  );
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

bot.launch();

new CronJob(
  '0 22 * * 0-4',
  async () => {
    const result = await returnAllSubs();

    const nextDay = DateTime.now().plus({ day: 1 });

    const { scheduleJson, weekNumber, dayOfWeek, parity } = loadScheduleAndReturnAll(nextDay);

    const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

    result.map(({ userId }) => {
      if (!findedSchedule?.length) {
        return bot.telegram.sendMessage(userId, 'Завтра занятий нету');
      }
      return bot.telegram.sendMessage(
        userId,
        `🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷\n` +
          findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n'),
      );
    });
  },
  null,
  true,
  'Europe/Moscow',
);

initialDatabase();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
