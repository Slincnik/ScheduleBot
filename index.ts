'use strict';

import { config } from 'dotenv';

config();

import { Telegraf, Markup } from 'telegraf';
import { getWeekNumber, parityOfWeek, numberCouples, parityWeek, loadJSON } from './src/utils.js';
import { Schedule } from './src/types/index.types.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  await ctx.reply(
    'Привет',
    Markup.keyboard([['👁 Schedule', 'Вся неделя']])
      .oneTime()
      .resize(),
  );
});

const loadJsonAndReturnedAll = () => {
  const scheduleJson: Schedule[] = loadJSON('./schedule.json');

  const currentDate = new Date();
  const weekNumber = getWeekNumber(currentDate);
  const dayOfWeek = currentDate.toLocaleString('ru-RU', { weekday: 'long' });
  const parity = parityOfWeek();

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
  const findedSchedule = scheduleJson
    .find(({ day }) => day === dayOfWeek)
    ?.couples.filter(
      ({ parity: coupleParity, weekNumbers }) =>
        coupleParity === parity && (!weekNumbers || weekNumbers.includes(weekNumber)),
    );

  if (!findedSchedule?.length) {
    return ctx.reply('Сегодня занятий нету');
  }

  ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
Неделя: ${weekNumber}
${findedSchedule
  .map(
    (value) =>
      //@ts-ignore
      `${numberCouples[value.time]} пара (${value.time}) \n${value.name} [${value.teacher}] [${
        value.auditory
      }]`,
  )
  .join('\n\n')}
`);
});

bot.hears('Вся неделя', (ctx) => {
  const { scheduleJson, weekNumber, parity } = loadJsonAndReturnedAll();

  const findedSchedule = [...scheduleJson].map((value) => {
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
                //@ts-ignore
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
