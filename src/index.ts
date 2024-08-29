import { Markup } from 'telegraf';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';
import Client from './structures/client.js';

import {
  getAllSchedule,
  parityWeek,
  returnCouplesMessage,
  getScheduleFromDayOfWeek,
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

      const { scheduleJson, weekNumber, dayOfWeek, parity } = getAllSchedule(nextDay);

      const findedSchedule = getScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

      result.forEach(async (userId) => {
        if (!findedSchedule?.length) {
          await client.telegram.sendMessage(userId, 'Завтра занятий нету');
          return;
        }
        await client.telegram.sendMessage(
          userId,
          `🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷\n${findedSchedule
            .map((value) => returnCouplesMessage(value))
            .join('\n\n')}`,
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
