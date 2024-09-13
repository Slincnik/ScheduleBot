import fs from 'fs';
import { DateTime } from 'luxon';
import { Couples, Parity, Schedule } from '../types/index.types.js';

// Constants
const CONSTANTS = {
  NUMBERCOUPLES: {
    '15:15-16:50': '5-я',
    '17:00-18:35': '6-я',
    '18:40-20:05': '7-я',
  },
  PARITYWEEK: {
    numerator: 'числитель',
    denominator: 'знаменатель',
  },
  SUBGROUP: {
    numerator: '1 п/г',
    denominator: '2 п/г',
  },
  BOT_IS_DEV: 'Бот на данный момент находится в разработке. Скоро верну прод',
  FIRST_SEPTEMBER_DATE: (date: DateTime = DateTime.now()) =>
    date
      .set({ month: 9, day: 1 })
      .minus({ years: date.month < 9 ? 1 : 0 })
      .startOf('week'),
};

class DateManager {
  static getWeekNumber(date: DateTime = DateTime.now()): number {
    const diffInWeeks = date.diff(CONSTANTS.FIRST_SEPTEMBER_DATE(date), 'weeks').weeks;
    return Math.floor(diffInWeeks + 1);
  }

  static parityOfWeek(date: DateTime = DateTime.now()): Parity {
    return date.weekNumber % 2 ? 'denominator' : 'numerator';
  }
}

class ScheduleLoader {
  static loadJSON<T>(path: string): T {
    const readFile = fs.readFileSync(new URL(path, import.meta.url), 'utf-8');
    return JSON.parse(readFile);
  }
}

class ScheduleFormatter {
  static returnCouplesMessage(couples: Couples): string {
    return `${CONSTANTS.NUMBERCOUPLES[couples.time as keyof typeof CONSTANTS.NUMBERCOUPLES]} пара (${couples.time}) ${
      couples.subgroup ? '(2 п/г)' : ''
    } \n${couples.name} [${couples.teacher}] [${couples.auditory}]`;
  }

  static formatWeekSchedule(schedules: Schedule[], parity: Parity): string {
    const header = `Неделя: ${CONSTANTS.PARITYWEEK[parity]}\n\n`;
    const dailySchedules = schedules.map(ScheduleFormatter.formatDailySchedule).join('\n\n');
    return header + dailySchedules;
  }

  static formatDailySchedule({ day, couples }: Schedule): string {
    const header = `🔷🔷 ${day} 🔷🔷\n`;
    if (!couples.length) {
      return header + 'Нет пар';
    }
    const main = couples.map(ScheduleFormatter.returnCouplesMessage).join('\n\n');
    return header + main;
  }
}

class ScheduleFilter {
  static getScheduleFromDayOfWeek(
    scheduleJson: Schedule[],
    dayOfWeek: string,
    parity: Parity,
    weekNumber: number,
  ): Couples[] | undefined {
    return scheduleJson
      .find(({ day }) => day === dayOfWeek)
      ?.couples?.filter(
        ({ parity: coupleParity, weekNumbers }) =>
          coupleParity.includes(parity) && (!weekNumbers || weekNumbers.includes(weekNumber)),
      );
  }

  static getScheduleFromWeek(
    scheduleJson: Schedule[],
    parity: Parity,
    weekNumber: number,
  ): { day: string; couples: Couples[] }[] {
    return scheduleJson.map(({ day, couples }) => ({
      day,
      couples: couples.filter(
        ({ parity: couplesParity, weekNumbers }) =>
          couplesParity.includes(parity) && (!weekNumbers || weekNumbers.includes(weekNumber)),
      ),
    }));
  }
}

class ScheduleManager {
  static getAllSchedule(date: DateTime = DateTime.now()) {
    const scheduleJson: Schedule[] = ScheduleLoader.loadJSON<Schedule[]>('./schedule.json');
    const weekNumber = DateManager.getWeekNumber(date);
    const dayOfWeek = date.setLocale('ru-RU').toLocaleString({ weekday: 'long' });
    const parity = DateManager.parityOfWeek(date);

    return {
      scheduleJson,
      currentDate: date,
      weekNumber,
      dayOfWeek,
      parity,
    };
  }
}

export {
  CONSTANTS,
  DateManager,
  ScheduleLoader,
  ScheduleFormatter,
  ScheduleFilter,
  ScheduleManager,
};
