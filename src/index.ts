import pkg from '../package.json';

import * as constants from './constants';
import array from './array';
import compile from './compile';
import laterDate from './date';
import day from './day';
import dayOfWeek from './day-of-week';
import dayOfWeekCount from './day-of-week-count';
import dayOfYear from './day-of-year';
import fullDate from './full-date';
import hour from './hour';
import minute from './minute';
import modifier from './modifier';
import month from './month';
import parse from './parse';
import schedule from './schedule';
import second from './second';
import setInterval from './set-interval';
import setTimeout from './set-timeout';
import time from './time';
import weekOfMonth from './week-of-month';
import weekOfYear from './week-of-year';
import year from './year';

const later = {
  version: pkg.version,

  array,
  compile,
  date: laterDate,
  day,
  dayOfWeek,
  dayOfWeekCount,
  dayOfYear,
  fullDate,
  hour,
  minute,
  modifier,
  month,
  parse,
  schedule,
  second,
  setInterval,
  setTimeout,
  time,
  weekOfMonth,
  weekOfYear,
  year,

  ...constants
};

export = later;
