import { CronJob } from 'cron';
import { DateTime } from 'luxon';

import Client from './structures/client.js';
import { subscriptionManager } from './utils/subs.js';
import { CONSTANTS, ScheduleFilter, ScheduleFormatter, ScheduleManager } from './utils/utils.js';

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
  throw new Error('Missing BOT_TOKEN environment variable');
}

export const client = new Client(BOT_TOKEN);

async function initializeBot() {
  await client.init();

  client.start(async (ctx) => {
    await ctx.reply('Привет');
  });
  setupCronJob();
}

function setupCronJob() {
  new CronJob('0 22 * * 0-4', sendNextDaySchedule, null, true, 'Europe/Moscow');
}

async function sendNextDaySchedule() {
  try {
    const subscribers = subscriptionManager.getAll();
    const nextDay = DateTime.now().plus({ day: 1 });
    const { scheduleJson, weekNumber, dayOfWeek, parity } = ScheduleManager.getAllSchedule(nextDay);
    const schedule = ScheduleFilter.getScheduleFromDayOfWeek(
      scheduleJson,
      dayOfWeek,
      parity,
      weekNumber,
    );

    if (!schedule) return;

    for (const userId of subscribers) {
      if (!schedule.length) {
        await client.telegram.sendMessage(userId, 'Завтра занятий нет');
        return;
      }

      const formattedSchedule = ScheduleFormatter.formatDailySchedule({
        day: `${dayOfWeek} (${CONSTANTS.PARITYWEEK[parity]})`,
        couples: schedule,
      });

      await client.telegram.sendMessage(userId, formattedSchedule);
    }
  } catch (error) {
    console.error('Failed to send daily schedule:', error);
  }
}

initializeBot().catch(console.error);

// Enable graceful stop
process.once('SIGINT', () => client.stop('SIGINT'));
process.once('SIGTERM', () => client.stop('SIGTERM'));
