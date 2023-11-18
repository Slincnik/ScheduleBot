import { DateTime } from 'luxon';
import { CommandHandler } from '../structures/command.js';
import {
  loadScheduleAndReturnAll,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: 'Вся неделя',
  async execute(ctx) {
    const { scheduleJson, weekNumber, parity } = loadScheduleAndReturnAll();

    const findedSchedule = returnScheduleFromWeek(scheduleJson, parity, weekNumber);

    ctx.reply(
      `Неделя: ${parityWeek[parity]} \n\n${findedSchedule
        .map((value) => {
          if (!value.couples.length) {
            return `🔷🔷 ${value.day} 🔷🔷\nНет пар`;
          }
          return (
            `🔷🔷 ${value.day} 🔷🔷\n` +
            value.couples.map((value) => returnCouplesMessage(value)).join('\n\n')
          );
        })
        .join('\n\n')}`,
    );
  },
});
