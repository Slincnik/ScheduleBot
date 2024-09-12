import { CommandHandler } from '../structures/command.js';
import { ScheduleFilter, ScheduleFormatter, ScheduleManager } from '../utils/utils.js';

export default new CommandHandler({
  name: 'allweek',
  description: 'Получить расписание на всю неделю',
  async execute(ctx) {
    const { scheduleJson, weekNumber, parity } = ScheduleManager.getAllSchedule();
    const schedule = ScheduleFilter.getScheduleFromWeek(scheduleJson, parity, weekNumber);

    const formattedSchedule = ScheduleFormatter.formatWeekSchedule(schedule, parity);

    ctx.reply(formattedSchedule);
  },
});
