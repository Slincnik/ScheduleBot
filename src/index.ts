'use strict';

import { Markup } from 'telegraf';

import Client from './structures/client.js';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';
import {
  loadScheduleAndReturnAll,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromDayOfWeek,
} from './utils/utils.js';
import { getAllUsersSubscriptions } from './utils/subs.js';

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN || !BOT_TOKEN.length) {
  throw new TypeError('Missing BOT_TOKEN variables');
}

export const client = new Client(BOT_TOKEN);

client.init();

client.start(async (ctx) => {
  await ctx.reply(
    'Привет',
    Markup.keyboard([
      ['👁 Schedule', 'Вся неделя'],
      ['След.день', 'След.неделя'],
    ]).resize(),
  );
});

client.telegram.setMyCommands([
  {
    command: 'subscription',
    description: 'Управление подпиской расписаний',
  },
]);

new CronJob(
  '0 22 * * 0-4',
  async () => {
    try {
      const result = getAllUsersSubscriptions();

      const nextDay = DateTime.now().plus({ day: 1 });

      const { scheduleJson, weekNumber, dayOfWeek, parity } = loadScheduleAndReturnAll(nextDay);

      const findedSchedule = returnScheduleFromDayOfWeek(
        scheduleJson,
        dayOfWeek,
        parity,
        weekNumber,
      );

      result.map((userId) => {
        if (!findedSchedule?.length) {
          return client.telegram.sendMessage(userId, 'Завтра занятий нету');
        }
        return client.telegram.sendMessage(
          userId,
          `🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷\n` +
            findedSchedule.map((value) => returnCouplesMessage(value, parity)).join('\n\n'),
        );
      });
    } catch (error) {
      console.error('Не смог отправить сообщение', error);
    }
  },
  null,
  true,
  'Europe/Moscow',
);

// Enable graceful stop
process.once('SIGINT', () => client.stop('SIGINT'));
process.once('SIGTERM', () => client.stop('SIGTERM'));
