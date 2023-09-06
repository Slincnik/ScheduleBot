'use strict';

import { config } from 'dotenv';

config();

import { Telegraf, Markup } from 'telegraf';
import { getWeekNumber, parityOfWeek, numberCouples, parityWeek, loadJSON } from './src/utils.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  await ctx.reply(
    'Привет',
    Markup.keyboard([['👁 Schedule', 'Вся неделя']])
      .oneTime()
      .resize(),
  );
});

bot.hears('👁 Schedule', (ctx) => {
  const parsedJSON = loadJSON('./schedule.json');

  const currentDate = new Date();
  const weekNumber = getWeekNumber(currentDate);
  const dayOfWeek = currentDate.toLocaleString('ru-RU', { weekday: 'long' });
  const parity = parityOfWeek();

  const findedSchedule = [...parsedJSON]
    .find(({ day }) => day === dayOfWeek)
    .couples.filter(
      ({ parity: couplesParity, weekNumbers }) =>
        couplesParity === parity && (!weekNumbers || weekNumbers.includes(weekNumber)),
    );

  if (!findedSchedule.length) {
    return ctx.reply('Сегодня занятий нету');
  }

  ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
Неделя: ${weekNumber}
${findedSchedule
  .map(
    (value) =>
      `${numberCouples[value.time]} пара (${value.time}) \n${value.name} [${value.teacher}] [${
        value.auditory
      }]`,
  )
  .join('\n\n')}
`);
});

bot.hears('Вся неделя', (ctx) => {
  const parsedJSON = loadJSON('./schedule.json');

  const currentDate = new Date();
  const weekNumber = getWeekNumber(currentDate);
  const parity = parityOfWeek();

  const findedSchedule = [...parsedJSON].map((value) => {
    return {
      day: value.day,
      couples: value.couples.filter(
        ({ parity: couplesParity, weekNumbers }) =>
          couplesParity === parity && (!weekNumbers || weekNumbers.includes(weekNumber)),
      ),
    };
  });

  ctx.reply(
    `Неделя: ${parityWeek[parity]} \n\n${findedSchedule
      .map((value) => {
        if (!value.couples.length) {
          return `🔷🔷 ${value.day} 🔷🔷\nНет пар`;
        }
        return (
          `🔷🔷 ${value.day} 🔷🔷\n` +
          value.couples
            .map(
              (value) =>
                `${numberCouples[value.time]} пара (${value.time}) \n${value.name} [${
                  value.teacher
                }] [${value.auditory}]`,
            )
            .join('\n\n')
        );
      })
      .join('\n\n')}`,
  );
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
