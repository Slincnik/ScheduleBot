import fs from 'fs';
import { DateTime } from 'luxon';
import { Couples, Parity, Schedule } from '../types/index.types.js';

/**
 * Берет текущую дату и возвращает номер недели от 1 сентября
 * @returns {number}
 */
export const getWeekNumber = (newDate?: DateTime): number => {
  const firstSeptemberDate = DateTime.fromObject({ month: 9, day: 1, year: 2023 }).startOf('week');

  // Получаем текущую дату или нужную нам дату
  const nowDate = newDate ? newDate : DateTime.now();

  // Вычисляем разницу в неделях между нынешней датой и 1 сентября 2023 года
  const diffInWeeks = nowDate.diff(firstSeptemberDate, 'weeks').weeks;

  return Math.floor(diffInWeeks + 1);
};

/**
 * @param {DateTime=} newDate - Необязательный аргумент, устанавливается нужная дата.
 * Берет последний день недели и возвращает чётность недели
 * @returns {Parity}
 */
export const parityOfWeek = (newDate: DateTime | undefined = DateTime.now()): Parity => {
  const weekNumber = newDate.weekNumber;

  return weekNumber % 2 ? 'numerator' : 'denominator';
};

export const returnCouplesMessage = (couples: Couples, parity: Parity) => {
  //@ts-ignore
  return `${numberCouples[couples.time]} пара (${couples.time}) ${
    couples.subgroup ? `(${subgroupParityWeek[parity]})` : ''
  } \n${couples.name} [${couples.teacher}] [${couples.auditory}]`;
};

export const returnScheduleFromDayOfWeek = (
  scheduleJson: Schedule[],
  dayOfWeek: string,
  parity: Parity,
  weekNumber: number,
) => {
  return [...scheduleJson]
    .find(({ day }) => day === dayOfWeek)
    ?.couples?.filter(
      ({ parity: coupleParity, weekNumbers }) =>
        coupleParity.includes(parity) && (!weekNumbers || weekNumbers.includes(weekNumber)),
    );
};

export const returnScheduleFromWeek = (
  scheduleJson: Schedule[],
  parity: Parity,
  weekNumber: number,
) => {
  return [...scheduleJson].map((value) => {
    return {
      day: value.day,
      couples: value.couples.filter(
        ({ parity: couplesParity, weekNumbers }) =>
          couplesParity.includes(parity) && (!weekNumbers || weekNumbers.includes(weekNumber)),
      ),
    };
  });
};

export const loadJSON = (path: string) => {
  const readFile = fs.readFileSync(new URL(path, import.meta.url)) as unknown as string;
  return JSON.parse(readFile);
};

export const loadScheduleAndReturnAll = (newDate?: DateTime) => {
  const scheduleJson: Schedule[] = loadJSON('./schedule.json');

  const currentDate = newDate ? newDate : DateTime.now();

  const weekNumber = getWeekNumber(currentDate);
  const dayOfWeek = currentDate.setLocale('ru-RU').toLocaleString({ weekday: 'long' });
  const parity = parityOfWeek(currentDate);

  return {
    scheduleJson,
    currentDate,
    weekNumber,
    dayOfWeek,
    parity,
  };
};

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

export const BOT_IS_DEV = 'Бот на данный момент находиться в разработке. Скоро верну прод';
