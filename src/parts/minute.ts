import { MIN, SEC } from '../constants';
import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import Hour from './hour';
import Second from './second';
import type { TimePeriod } from '../types';

const minute: TimePeriod<'m', '', 'mStart', 'mEnd'> = {
  name: 'minute',
  range: 60,
  val(d) {
    return d.m || (d.m = laterDate.getMin.call(d));
  },
  isValid(d, value) {
    return minute.val(d) === value;
  },
  extent() {
    return [0, 59];
  },
  start(d) {
    return (
      d.mStart ||
      (d.mStart = laterDate.next(
        Year.val(d),
        Month.val(d),
        Day.val(d),
        Hour.val(d),
        minute.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.mEnd ||
      (d.mEnd = laterDate.prev(
        Year.val(d),
        Month.val(d),
        Day.val(d),
        Hour.val(d),
        minute.val(d)
      ))
    );
  },
  next(d, value) {
    const m = minute.val(d);
    const s = Second.val(d);
    const inc = value > 59 ? 60 - m : value <= m ? 60 - m + value : value - m;
    let next = new Date(d.getTime() + inc * MIN - s * SEC);
    if (!laterDate.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 120) * MIN - s * SEC);
    }

    return next;
  },
  prev(d, value) {
    value = value > 59 ? 59 : value;
    return laterDate.prev(
      Year.val(d),
      Month.val(d),
      Day.val(d),
      Hour.val(d) + (value >= minute.val(d) ? -1 : 0),
      value
    );
  }
};

export default minute;
