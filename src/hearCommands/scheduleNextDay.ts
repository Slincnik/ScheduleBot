import { DateTime } from 'luxon';
import { CommandHandler } from '../structures/command.js';
import {
  returnAllSchedule,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromDayOfWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: 'След.день',
  async execute(ctx) {
    const nextDay = DateTime.now().plus({ day: 1 });

    const { scheduleJson, weekNumber, dayOfWeek, parity } = returnAllSchedule(nextDay);

    const findedSchedule = returnScheduleFromDayOfWeek(scheduleJson, dayOfWeek, parity, weekNumber);

    if (!findedSchedule?.length) {
      return ctx.reply('Завтра занятий нету');
    }

    return ctx.reply(`🔷🔷 ${dayOfWeek} (${parityWeek[parity]}) 🔷🔷
${findedSchedule.map((value) => returnCouplesMessage(value, parity)).join('\n\n')}
  `);
  },
});
