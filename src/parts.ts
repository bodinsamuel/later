import Year from './year';
import Month from './month';
import Day from './day';
import Hour from './hour';
import Minute from './minute';
import Second from './second';
import { Key, TimePeriod } from './types';
import dayOfWeekCount from './day-of-week-count';
import dayOfWeek from './day-of-week';
import dayOfYear from './day-of-year';
import fullDate from './full-date'
import time from './time';
import weekOfMonth from './week-of-month';
import weekOfYear from './week-of-year';

const refs: Record<Key, TimePeriod> = {
  Y: Year,
  M: Month,
  D: Day,
  h: Hour,
  m: Minute,
  s: Second,
  dc: dayOfWeekCount,
  dw: dayOfWeek,
  dy: dayOfYear,
  fd: fullDate,
  t: time,
  wm: weekOfMonth,
  wy: weekOfYear
};

export default refs;
