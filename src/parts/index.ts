import year from './year';
import month from './month';
import day from './day';
import hour from './hour';
import minute from './minute';
import second from './second';
import type { Key, TimePeriod } from '../types';
import dayOfWeekCount from './day-of-week-count';
import dayOfWeek from './day-of-week';
import dayOfYear from './day-of-year';
import fullDate from './full-date';
import time from './time';
import weekOfMonth from './week-of-month';
import weekOfYear from './week-of-year';

export const fullName = {
  year,
  month,
  day,
  hour,
  minute,
  second,
  dayOfWeekCount,
  dayOfWeek,
  dayOfYear,
  fullDate,
  time,
  weekOfMonth,
  weekOfYear
};

export const parts: Record<Key, TimePeriod> = {
  Y: year,
  M: month,
  D: day,
  h: hour,
  m: minute,
  s: second,
  dc: dayOfWeekCount,
  dw: dayOfWeek,
  d: dayOfWeek,
  dy: dayOfYear,
  fd: fullDate,
  t: time,
  wm: weekOfMonth,
  wy: weekOfYear
};
