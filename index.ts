'use strict';

import { config } from 'dotenv';

config();

import { Telegraf, Markup } from 'telegraf';
import {
  getWeekNumber,
  parityOfWeek,
  numberCouples,
  parityWeek,
  loadJSON,
  returnScheduleFromDayOfWeek,
  returnCouplesMessage,
  returnScheduleFromWeek,
} from './src/utils.js';
import { Couples, Parity, Schedule } from './src/types/index.types.js';

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

const loadJsonAndReturnedAll = (newDate?: Date) => {
  const scheduleJson: Schedule[] = loadJSON('./schedule.json');

  const currentDate = new Date();

  if (newDate) {
    currentDate.setTime(newDate.getTime());
  }

  const weekNumber = getWeekNumber(currentDate);
  const dayOfWeek = currentDate.toLocaleString('ru-RU', { weekday: 'long' });
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
  const { scheduleJson, weekNumber, dayOfWeek, parity } = loadJsonAndReturnedAll();

  const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

  if (!findedSchedule?.length) {
    return ctx.reply('Сегодня занятий нету');
  }

  ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n')}
`);
});

bot.hears('След.день', (ctx) => {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(nextDay.getHours() + 3);

  const { scheduleJson, weekNumber, dayOfWeek, parity } = loadJsonAndReturnedAll(nextDay);

  const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

  if (!findedSchedule?.length) {
    return ctx.reply('Завтра занятий нету');
  }

  ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n')}
`);
});

bot.hears('След.неделя', (ctx) => {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(nextWeek.getHours() + 3);

  const { scheduleJson, weekNumber, parity } = loadJsonAndReturnedAll(nextWeek);

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
  const { scheduleJson, weekNumber, parity } = loadJsonAndReturnedAll();

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
