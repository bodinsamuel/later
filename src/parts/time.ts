import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import Hour from './hour';
import Minute from './minute';
import Second from './second';
import type { TimePeriod } from '../types';

const time: TimePeriod<'t'> = {
  name: 'time',
  range: 1,
  val(d) {
    return (
      d.t || (d.t = Hour.val(d) * 3600 + Minute.val(d) * 60 + Second.val(d))
    );
  },
  isValid(d, value) {
    return time.val(d) === value;
  },
  extent() {
    return [0, 86399];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    value = value > 86399 ? 0 : value;
    let next = laterDate.next(
      Year.val(d),
      Month.val(d),
      Day.val(d) + (value <= time.val(d) ? 1 : 0),
      0,
      0,
      value
    );
    if (!laterDate.isUTC && next.getTime() < d.getTime()) {
      next = laterDate.next(
        Year.val(next),
        Month.val(next),
        Day.val(next),
        Hour.val(next),
        Minute.val(next),
        value + 7200
      );
    }

    return next;
  },
  prev(d, value) {
    value = value > 86399 ? 86399 : value;
    return laterDate.next(
      Year.val(d),
      Month.val(d),
      Day.val(d) + (value >= time.val(d) ? -1 : 0),
      0,
      0,
      value
    );
  }
};

export default time;
