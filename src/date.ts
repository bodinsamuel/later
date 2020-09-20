import { SEC } from './constants';
import day from './parts/day';
import { TimePeriod } from './types';

let isUTC = false;
const proto = Date.prototype;
let name = 'get';

function timezone(useLocalTime: boolean) {
  isUTC = !useLocalTime;

  name = useLocalTime ? 'get' : 'getUTC';
}

function build(
  Y: number,
  M: number,
  D: number,
  h: number,
  m: number,
  s: number
) {
  return isUTC
    ? new Date(Date.UTC(Y, M, D, h, m, s))
    : new Date(Y, M, D, h, m, s);
}

function UTC() {
  timezone(false);
}

function localTime() {
  timezone(true);
}

function next(
  Y: number,
  M?: number,
  D?: number,
  h?: number,
  m?: number,
  s?: number
) {
  return build(
    Y,
    M !== undefined ? M - 1 : 0,
    D !== undefined ? D : 1,
    h || 0,
    m || 0,
    s || 0
  );
}

function nextRollover(d, value, constraint, period: TimePeriod) {
  const cur = constraint.val(d);
  const max = constraint.extent(d)[1];
  return (value || max) <= cur || value > max
    ? new Date(period.end(d).getTime() + SEC)
    : period.start(d);
}

function previous(
  Y: number,
  M?: number,
  D?: number,
  h?: number,
  m?: number,
  s?: number
) {
  // we compare lenght because it's easy and number are 0 based so we would need to check for undefined for each values
  const { length } = arguments;
  M = length < 2 ? 11 : M - 1;
  D = length < 3 ? day.extent(date.next(Y, M + 1))[1] : D;
  h = length < 4 ? 23 : h;
  m = length < 5 ? 59 : m;
  s = length < 6 ? 59 : s;

  return build(Y, M, D, h, m, s);
}

function previousRollover(d, value, constraint, period: TimePeriod) {
  const cur = constraint.val(d);
  return value >= cur || !value // @ts-expect-error
    ? period.start(period.prev(d, period.val(d) - 1))
    : period.start(d);
}

const date = {
  timezone,
  UTC,
  localTime,
  next,
  nextRollover,
  prev: previous,
  prevRollover: previousRollover,
  build,

  get isUTC(): boolean {
    return isUTC;
  },
  get getYear(): typeof Date.prototype.getFullYear {
    return proto[name + 'FullYear'];
  },
  get getMonth(): typeof Date.prototype.getMonth {
    return proto[name + 'Month'];
  },
  get getDate(): typeof Date.prototype.getDate {
    return proto[name + 'Date'];
  },
  get getDay(): typeof Date.prototype.getDay {
    return proto[name + 'Day'];
  },
  get getHour(): typeof Date.prototype.getHours {
    return proto[name + 'Hours'];
  },
  get getMin(): typeof Date.prototype.getMinutes {
    return proto[name + 'Minutes'];
  },
  get getSec(): typeof Date.prototype.getSeconds {
    return proto[name + 'Seconds'];
  }
};

export default date;
