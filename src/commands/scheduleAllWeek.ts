import { CommandHandler } from '../structures/command.js';
import { getAllSchedule, getScheduleFromWeek, formatWeekSchedule } from '../utils/utils.js';

export default new CommandHandler({
  name: 'allweek',
  description: 'Получить расписание на всю неделю',
  async execute(ctx) {
    const { scheduleJson, weekNumber, parity } = getAllSchedule();
    const schedule = getScheduleFromWeek(scheduleJson, parity, weekNumber);

    const formattedSchedule = formatWeekSchedule(schedule, parity);

    ctx.reply(formattedSchedule);
  },
});
