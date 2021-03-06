import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import type { TimePeriod } from '../types';

const hour: TimePeriod<'h', '', 'hStart', 'hEnd'> = {
  name: 'hour',
  range: 3600,
  val(d) {
    return d.h || (d.h = laterDate.getHour.call(d));
  },
  isValid(d, value) {
    return hour.val(d) === value;
  },
  extent() {
    return [0, 23];
  },
  start(d) {
    return (
      d.hStart ||
      (d.hStart = laterDate.next(
        Year.val(d),
        Month.val(d),
        Day.val(d),
        hour.val(d)
      ))
    );
  },
  end(d) {
    return (
      d.hEnd ||
      (d.hEnd = laterDate.prev(
        Year.val(d),
        Month.val(d),
        Day.val(d),
        hour.val(d)
      ))
    );
  },
  next(d, value) {
    value = value > 23 ? 0 : value;
    let next = laterDate.next(
      Year.val(d),
      Month.val(d),
      Day.val(d) + (value <= hour.val(d) ? 1 : 0),
      value
    );
    if (!laterDate.isUTC && next.getTime() <= d.getTime()) {
      next = laterDate.next(
        Year.val(next),
        Month.val(next),
        Day.val(next),
        value + 1
      );
    }

    return next;
  },
  prev(d, value) {
    value = value > 23 ? 23 : value;
    return laterDate.prev(
      Year.val(d),
      Month.val(d),
      Day.val(d) + (value >= hour.val(d) ? -1 : 0),
      value
    );
  }
};

export default hour;
