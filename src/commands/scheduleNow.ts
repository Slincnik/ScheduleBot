import { CommandHandler } from '../structures/command.js';
import {
  getAllSchedule,
  parityWeek,
  getScheduleFromDayOfWeek,
  formatDailySchedule,
} from '../utils/utils.js';

export default new CommandHandler({
  name: 'now',
  description: 'Получить расписание на текущий день',
  async execute(ctx) {
    const { scheduleJson, weekNumber, dayOfWeek, parity } = getAllSchedule();

    const todaySchedule = getScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

    if (!todaySchedule?.length) {
      return ctx.reply('Сегодня занятий нет');
    }

    const formattedSchedule = formatDailySchedule({
      day: `${dayOfWeek} (${parityWeek[parity]})`,
      couples: todaySchedule,
    });

    return ctx.reply(formattedSchedule);
  },
});
