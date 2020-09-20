import * as constants from './constants';
import array from './array';
import compile from './compile';
import laterDate from './date';
import modifier from './modifier';
import parse from './parse';
import schedule from './schedule';
import setInterval from './set-interval';
import setTimeout from './set-timeout';
import * as parts from './parts';
// import Later from './defTypes';

const later = {
  version: '__VERSION__',

  array,
  compile,
  date: laterDate,
  modifier,
  parse,
  schedule,
  setInterval,
  setTimeout,

  ...parts.parts,
  ...parts.fullName,
  ...constants
};

export type later = typeof later;

export default later;
