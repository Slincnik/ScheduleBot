import { DateTime } from 'luxon';
import { CommandHandler } from '../structures/command.js';
import {
  loadScheduleAndReturnAll,
  parityWeek,
  returnCouplesMessage,
  returnScheduleFromWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: 'След.неделя',
  async execute(ctx) {
    const nextWeek = DateTime.now().plus({ week: 1 });

    const { scheduleJson, weekNumber, parity } = loadScheduleAndReturnAll(nextWeek);

    const findedSchedule = returnScheduleFromWeek(scheduleJson, parity, weekNumber);

    ctx.reply(
      `Неделя: ${parityWeek[parity]} \n\n${findedSchedule
        .map((value) => {
          if (!value.couples.length) {
            return `🔷🔷 ${value.day} 🔷🔷\nНет пар`;
          }
          return (
            `🔷🔷 ${value.day} 🔷🔷\n` +
            value.couples.map((value) => returnCouplesMessage(value, parity)).join('\n\n')
          );
        })
        .join('\n\n')}`,
    );
  },
});
