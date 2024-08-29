import { CommandHandler } from '../structures/command.js';
import {
  getAllSchedule,
  parityWeek,
  returnCouplesMessage,
  getScheduleFromDayOfWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: '👁 Schedule',
  async execute(ctx) {
    const { scheduleJson, weekNumber, dayOfWeek, parity } = getAllSchedule();

    const findedSchedule = getScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

    if (!findedSchedule?.length) {
      return ctx.reply('Сегодня занятий нету');
    }

    return ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n')}
  `);
  },
});
