export type Parity = 'numerator' | 'denominator';

export type ScheduleParity = ['numerator' | 'denominator'];

export type Couples = {
  name: string;
  auditory: string;
  teacher: string;
  time: string;
  subgroup: boolean;
  parity: ScheduleParity;
  weekNumbers?: number[];
};

export type Schedule = {
  day: string;
  couples: Couples[];
};

export type Subscription = {
  userId: number;
};
