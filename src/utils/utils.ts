import fs from 'fs';
import { DateTime } from 'luxon';
import { Couples, Parity, Schedule } from '../types/index.types.js';

export const numberCouples = {
  '15:15-16:50': '5-я',
  '17:00-18:35': '6-я',
  '18:40-20:05': '7-я',
};

export const parityWeek = {
  numerator: 'числитель',
  denominator: 'знаменатель',
};

export const subgroupParityWeek = {
  numerator: '1 п/г',
  denominator: '2 п/г',
};

export const BOT_IS_DEV = 'Бот на данный момент находится в разработке. Скоро верну прод';

const FIRST_SEPTEMBER_DATE = DateTime.fromObject({ month: 9, day: 1, year: 2023 }).startOf('week');

export const getWeekNumber = (date: DateTime = DateTime.now()): number => {
  const diffInWeeks = date.diff(FIRST_SEPTEMBER_DATE, 'weeks').weeks;
  return Math.floor(diffInWeeks + 1);
};

export const parityOfWeek = (date: DateTime = DateTime.now()): Parity =>
  date.weekNumber % 2 ? 'numerator' : 'denominator';

export const returnCouplesMessage = (couples: Couples): string =>
  `${numberCouples[couples.time as keyof typeof numberCouples]} пара (${couples.time}) ${
    couples.subgroup ? '(2 п/г)' : ''
  } \n${couples.name} [${couples.teacher}] [${couples.auditory}]`;

export const getScheduleFromDayOfWeek = (
  scheduleJson: Schedule[],
  dayOfWeek: string,
  parity: Parity,
  weekNumber: number,
): Couples[] | undefined =>
  scheduleJson
    .find(({ day }) => day === dayOfWeek)
    ?.couples?.filter(
      ({ parity: coupleParity, weekNumbers }) =>
        coupleParity.includes(parity) && (!weekNumbers || weekNumbers.includes(weekNumber)),
    );

export const getScheduleFromWeek = (
  scheduleJson: Schedule[],
  parity: Parity,
  weekNumber: number,
): { day: string; couples: Couples[] }[] =>
  scheduleJson.map(({ day, couples }) => ({
    day,
    couples: couples.filter(
      ({ parity: couplesParity, weekNumbers }) =>
        couplesParity.includes(parity) && (!weekNumbers || weekNumbers.includes(weekNumber)),
    ),
  }));

export const loadJSON = <T>(path: string): T => {
  const readFile = fs.readFileSync(new URL(path, import.meta.url), 'utf-8');
  return JSON.parse(readFile);
};

export function formatWeekSchedule(schedules: Schedule[], parity: Parity) {
  const header = `Неделя: ${parityWeek[parity]}\n\n`;

  const dailySchedules = schedules.map(formatDailySchedule).join('\n\n');

  return header + dailySchedules;
}

export function formatDailySchedule({ day, couples }: Schedule) {
  const header = `🔷🔷 ${day} 🔷🔷\n`;

  if (!couples.length) {
    return header + 'Нет пар';
  }

  const main = couples.map(returnCouplesMessage).join('\n\n');

  return header + main;
}

export const getAllSchedule = (date: DateTime = DateTime.now()) => {
  const scheduleJson: Schedule[] = loadJSON<Schedule[]>('./schedule.json');
  const weekNumber = getWeekNumber(date);
  const dayOfWeek = date.setLocale('ru-RU').toLocaleString({ weekday: 'long' });
  const parity = parityOfWeek(date);

  return {
    scheduleJson,
    currentDate: date,
    weekNumber,
    dayOfWeek,
    parity,
  };
};
