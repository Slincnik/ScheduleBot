import { CommandHandler } from '../structures/command.js';
import {
  loadScheduleAndReturnAll,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromDayOfWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: '👁 Schedule',
  async execute(ctx) {
    const { scheduleJson, weekNumber, dayOfWeek, parity } = loadScheduleAndReturnAll();

    const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

    if (!findedSchedule?.length) {
      return ctx.reply('Сегодня занятий нету');
    }

    ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
  ${findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n')}
  `);
  },
});
