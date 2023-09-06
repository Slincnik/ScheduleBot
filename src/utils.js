import fs from 'fs';

const getWeek = function (nowDate) {
  var date = new Date(nowDate.getTime());
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return (
    1 +
    Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
  );
};

export const getWeekNumber = (nowDate) => {
  const firstSeptemberDate = new Date(2023, 8, 1, 3, 0, 0, 0);

  const numberTheWeek = getWeek(nowDate);
  const numberTheWeekSeptember = getWeek(firstSeptemberDate);

  return numberTheWeek - numberTheWeekSeptember + 1;
};

export const parityOfWeek = () => {
  var d0 = new Date().getTime(),
    d = new Date(new Date().getFullYear(), 0, 1),
    d1 = d.getTime(),
    dd = d.getDay(),
    re = Math.floor((d0 - d1) / 8.64e7) + (dd ? dd - 1 : 6);

  return Math.floor(re / 7) % 2 ? 'numerator' : 'denominator';
};

export const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)));

export const numberCouples = {
  '15:15-16:50': '5-я',
  '17:00-18:30': '6-я',
  '18:45-20:15': '7-я',
};

export const parityWeek = {
  numerator: 'числитель',
  denominator: 'знаменатель',
};
