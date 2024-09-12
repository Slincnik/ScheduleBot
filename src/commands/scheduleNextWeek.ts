import { DateTime } from 'luxon';
import { CommandHandler } from '../structures/command.js';
import { ScheduleFilter, ScheduleFormatter, ScheduleManager } from '../utils/utils.js';

export default new CommandHandler({
  name: 'nextweek',
  description: 'Получить расписание на следующую неделю',
  async execute(ctx) {
    const nextWeek = DateTime.now().plus({ week: 1 });
    const { scheduleJson, weekNumber, parity } = ScheduleManager.getAllSchedule(nextWeek);
    const schedule = ScheduleFilter.getScheduleFromWeek(scheduleJson, parity, weekNumber);

    const formattedSchedule = ScheduleFormatter.formatWeekSchedule(schedule, parity);
    ctx.reply(formattedSchedule);
  },
});
