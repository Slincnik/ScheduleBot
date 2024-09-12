import { DateTime } from 'luxon';
import { CommandHandler } from '../structures/command.js';
import { ScheduleFilter, ScheduleFormatter, ScheduleManager } from '../utils/utils.js';

export default new CommandHandler({
  name: 'nextday',
  description: 'Получить расписание на следующий день',
  async execute(ctx) {
    const nextDay = DateTime.now().plus({ days: 1 });
    const { scheduleJson, weekNumber, dayOfWeek, parity } = ScheduleManager.getAllSchedule(nextDay);
    const schedule = ScheduleFilter.getScheduleFromDayOfWeek(
      scheduleJson,
      dayOfWeek,
      parity,
      weekNumber,
    );

    if (!schedule?.length) {
      return ctx.reply('Завтра занятий нет');
    }

    const formattedSchedule = ScheduleFormatter.formatDailySchedule({
      day: `${dayOfWeek} (${parity === 'numerator' ? 'числитель' : 'знаменатель'})`,
      couples: schedule,
    });

    return ctx.reply(formattedSchedule);
  },
});
