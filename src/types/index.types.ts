export type Schedule = {
  day: string;
  couples: Couples[];
};

export type Couples = {
  name: string;
  auditory: string;
  teacher: string;
  time: string;
  parity: Parity;
  weekNumbers?: number[];
};

export type Subscription = {
  userId: number;
};

export type Parity = 'numerator' | 'denominator';
