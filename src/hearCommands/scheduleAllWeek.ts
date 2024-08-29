import { CommandHandler } from '../structures/command.js';
import {
  getAllSchedule,
  parityWeek,
  returnCouplesMessage,
  getScheduleFromWeek,
} from '../utils/utils.js';

export default new CommandHandler({
  name: 'Вся неделя',
  async execute(ctx) {
    const { scheduleJson, weekNumber, parity } = getAllSchedule();

    const findedSchedule = getScheduleFromWeek(scheduleJson, parity, weekNumber);

    ctx.reply(
      `Неделя: ${parityWeek[parity]} \n\n${findedSchedule
        .map((value) => {
          if (!value.couples.length) {
            return `🔷🔷 ${value.day} 🔷🔷\nНет пар`;
          }
          return `🔷🔷 ${value.day} 🔷🔷\n${value.couples
            .map((v) => returnCouplesMessage(v))
            .join('\n\n')}`;
        })
        .join('\n\n')}`,
    );
  },
});
