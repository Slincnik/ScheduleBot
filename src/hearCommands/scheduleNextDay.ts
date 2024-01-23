import { DateTime } from 'luxon';
import { CommandHandler } from '../structures/command.js';
import {
  loadScheduleAndReturnAll,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromDayOfWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: 'След.день',
  async execute(ctx) {
    const nextDay = DateTime.now().plus({ day: 1 });

    const { scheduleJson, weekNumber, dayOfWeek, parity } = loadScheduleAndReturnAll(nextDay);

    const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

    if (!findedSchedule?.length) {
      return ctx.reply('Завтра занятий нету');
    }

    ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value)).join('\n\n')}
  `);
  },
});
