import { DateTime } from 'luxon';
import { CommandHandler } from '../structures/command.js';
import { getAllSchedule, getScheduleFromWeek, formatWeekSchedule } from '../utils/utils.js';

export default new CommandHandler({
  name: 'nextweek',
  description: 'Получить расписание на следующую неделю',
  async execute(ctx) {
    const nextWeek = DateTime.now().plus({ week: 1 });
    const { scheduleJson, weekNumber, parity } = getAllSchedule(nextWeek);
    const schedule = getScheduleFromWeek(scheduleJson, parity, weekNumber);

    const formattedSchedule = formatWeekSchedule(schedule, parity);
    ctx.reply(formattedSchedule);
  },
});
