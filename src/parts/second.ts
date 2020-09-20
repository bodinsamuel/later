import { SEC } from '../constants';
import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import Hour from './hour';
import Minute from './minute';
import type { TimePeriod } from '../types';

const second: TimePeriod<'s'> = {
  name: 'second',
  range: 1,
  val(d) {
    return d.s || (d.s = laterDate.getSec.call(d));
  },
  isValid(d, value) {
    return second.val(d) === value;
  },
  extent() {
    return [0, 59];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    const s = second.val(d);
    const inc = value > 59 ? 60 - s : value <= s ? 60 - s + value : value - s;
    let next = new Date(d.getTime() + inc * SEC);
    if (!laterDate.isUTC && next.getTime() <= d.getTime()) {
      next = new Date(d.getTime() + (inc + 7200) * SEC);
    }

    return next;
  },
  prev(d, value) {
    value = value > 59 ? 59 : value;
    return laterDate.prev(
      Year.val(d),
      Month.val(d),
      Day.val(d),
      Hour.val(d),
      Minute.val(d) + (value >= second.val(d) ? -1 : 0),
      value
    );
  }
};

export default second;
