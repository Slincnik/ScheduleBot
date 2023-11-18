'use strict';

import { config } from 'dotenv';
import { Markup } from 'telegraf';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';

import { ExtendedTelegrafClient } from './structures/client.js';
import { returnAllSubs } from './utils/subs.js';
import {
  BOT_IS_DEV,
  loadScheduleAndReturnAll,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromDayOfWeek,
} from './utils/utils.js';

config();

const { BOT_TOKEN, IS_DEV } = process.env;

if (!BOT_TOKEN || !BOT_TOKEN.length) {
  throw new TypeError('Missing BOT_TOKEN variables');
}

export const bot = new ExtendedTelegrafClient(BOT_TOKEN);

bot.startBot();

bot.start(async (ctx) => {
  await ctx.reply(
    'Привет',
    Markup.keyboard([
      ['👁 Schedule', 'Вся неделя'],
      ['След.день', 'След.неделя'],
    ]).resize(),
  );
});

bot.use(async (ctx, next) => {
  if (IS_DEV === 'true' && ctx.message!.from.id !== Number(process.env.ADMIN_ID)) {
    ctx.reply(BOT_IS_DEV);
    await next();
  }

  await next();
});

bot.telegram.setMyCommands([
  {
    command: 'subscription',
    description: 'Управление подпиской расписаний',
  },
]);

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

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
