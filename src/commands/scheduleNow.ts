import { CommandHandler } from '../structures/command.js';
import { CONSTANTS, ScheduleFilter, ScheduleFormatter, ScheduleManager } from '../utils/utils.js';

export default new CommandHandler({
  name: 'now',
  description: 'Получить расписание на текущий день',
  async execute(ctx) {
    const { scheduleJson, weekNumber, dayOfWeek, parity } = ScheduleManager.getAllSchedule();

    const todaySchedule = ScheduleFilter.getScheduleFromDayOfWeek(
      scheduleJson,
      dayOfWeek,
      parity,
      weekNumber,
    );

    if (!todaySchedule?.length) {
      return ctx.reply('Сегодня занятий нет');
    }

    const formattedSchedule = ScheduleFormatter.formatDailySchedule({
      day: `${dayOfWeek} (${CONSTANTS.PARITYWEEK[parity]})`,
      couples: todaySchedule,
    });

    return ctx.reply(formattedSchedule);
  },
});
