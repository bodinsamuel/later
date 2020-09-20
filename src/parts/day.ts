import { DAYS_IN_MONTH } from '../constants';
import laterDate from '../date';
import Year from './year';
import Month from './month';
import DayOfYear from './day-of-year';
import type { TimePeriod } from '../types';

const day: TimePeriod = {
  name: 'day',
  range: 86400,
  val(d) {
    return d.D || (d.D = laterDate.getDate.call(d));
  },
  isValid(d, value) {
    return this.val(d) === (value || this.extent(d)[1]);
  },
  extent(d) {
    if (d.DExtent) return d.DExtent;
    const month = Month.val(d);
    let max = DAYS_IN_MONTH[month - 1];
    if (month === 2 && DayOfYear.extent(d)[1] === 366) {
      max += 1;
    }

    return (d.DExtent = [1, max]);
  },
  start(d) {
    return (
      d.DStart ||
      (d.DStart = laterDate.next(Year.val(d), Month.val(d), this.val(d)))
    );
  },
  end(d) {
    return (
      d.DEnd ||
      (d.DEnd = laterDate.prev(Year.val(d), Month.val(d), this.val(d)))
    );
  },
  next(d, value) {
    value = value > this.extent(d)[1] ? 1 : value;
    const month = laterDate.nextRollover(d, value, this, Month);
    const DMax = this.extent(month)[1];
    value = value > DMax ? 1 : value || DMax;
    return laterDate.next(Year.val(month), Month.val(month), value);
  },
  prev(d, value) {
    const month = laterDate.prevRollover(d, value, this, Month);
    const DMax = this.extent(month)[1];
    return laterDate.prev(
      Year.val(month),
      Month.val(month),
      value > DMax ? DMax : value || DMax
    );
  }
};

export default day;
