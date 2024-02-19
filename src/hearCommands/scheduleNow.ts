import { CommandHandler } from '../structures/command.js';
import {
  returnAllSchedule,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromDayOfWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: '👁 Schedule',
  async execute(ctx) {
    const { scheduleJson, weekNumber, dayOfWeek, parity } = returnAllSchedule();

    const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

    if (!findedSchedule?.length) {
      return ctx.reply('Сегодня занятий нету');
    }

    return ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value, parity)).join('\n\n')}
  `);
  },
});
