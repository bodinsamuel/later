export const CRON_NAMES = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
  SUN: 1,
  MON: 2,
  TUE: 3,
  WED: 4,
  THU: 5,
  FRI: 6,
  SAT: 7
};

export const REPLACEMENTS = {
  '* * * * * *': '0/1 * * * * *',
  '@YEARLY': '0 0 1 1 *',
  '@ANNUALLY': '0 0 1 1 *',
  '@MONTHLY': '0 0 1 * *',
  '@WEEKLY': '0 0 * * 0',
  '@DAILY': '0 0 * * *',
  '@HOURLY': '0 * * * *'
};


export type CronField = 's' |'m' |'h' |'D' |'M' |'Y' |'d';

export const FIELDS: Record<CronField, number[]> = {
  s: [0, 0, 59],
  m: [1, 0, 59],
  h: [2, 0, 23],
  D: [3, 1, 31],
  M: [4, 1, 12],
  Y: [6, 1970, 2099],
  d: [5, 1, 7, 1]
};

export const TOKENTYPES = {
  eof: /^$/,
  rank: /^((\d+)(st|nd|rd|th)?)\b/,
  time: /^(((0?[1-9]|1[0-2]):[0-5]\d(\s)?(am|pm))|((0?\d|1\d|2[0-3]):[0-5]\d))\b/,
  dayName: /^((sun|mon|tue(s)?|wed(nes)?|thu(r(s)?)?|fri|sat(ur)?)(day)?)\b/,
  monthName: /^(jan(uary)?|feb(ruary)?|ma((r(ch)?)?|y)|apr(il)?|ju(ly|ne)|aug(ust)?|oct(ober)?|(sept|nov|dec)(ember)?)\b/,
  yearIndex: /^(\d{4})\b/,
  every: /^every\b/,
  after: /^after\b/,
  before: /^before\b/,
  second: /^(s|sec(ond)?(s)?)\b/,
  minute: /^(m|min(ute)?(s)?)\b/,
  hour: /^(h|hour(s)?)\b/,
  day: /^(day(s)?( of the month)?)\b/,
  dayInstance: /^day instance\b/,
  dayOfWeek: /^day(s)? of the week\b/,
  dayOfYear: /^day(s)? of the year\b/,
  weekOfYear: /^week(s)?( of the year)?\b/,
  weekOfMonth: /^week(s)? of the month\b/,
  weekday: /^weekday\b/,
  weekend: /^weekend\b/,
  month: /^month(s)?\b/,
  year: /^year(s)?\b/,
  between: /^between (the)?\b/,
  start: /^(start(ing)? (at|on( the)?)?)\b/,
  at: /^(at|@)\b/,
  and: /^(,|and\b)/,
  except: /^(except\b)/,
  also: /(also)\b/,
  first: /^(first)\b/,
  last: /^last\b/,
  in: /^in\b/,
  of: /^of\b/,
  onthe: /^on the\b/,
  on: /^on\b/,
  through: /(-|^(to|through)\b)/
};

export const TEXT_NAMES = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
  '1st': 1,
  fir: 1,
  '2nd': 2,
  sec: 2,
  '3rd': 3,
  thi: 3,
  '4th': 4,
  for: 4
};
