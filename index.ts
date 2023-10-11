'use strict';

import { config } from 'dotenv';

config();

import { Telegraf, Markup } from 'telegraf';
import { DateTime } from 'luxon';
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

const bot = new Telegraf(process.env.BOT_TOKEN as string);

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

bot.hears('👁 Schedule', (ctx) => {
  if (process.env.IS_DEV && ctx.message.from.id !== Number(process.env.ADMIN_ID)) return ctx.reply(BOT_IS_DEV);

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
  if (process.env.IS_DEV && ctx.message.from.id !== Number(process.env.ADMIN_ID)) return ctx.reply(BOT_IS_DEV);

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
  if (process.env.IS_DEV && ctx.message.from.id !== Number(process.env.ADMIN_ID)) return ctx.reply(BOT_IS_DEV);

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
  if (process.env.IS_DEV && ctx.message.from.id !== Number(process.env.ADMIN_ID)) return ctx.reply(BOT_IS_DEV);

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

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
