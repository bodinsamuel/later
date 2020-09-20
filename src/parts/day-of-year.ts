import { DAY } from '../constants';
import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import type { TimePeriod } from '../types';

const dayOfYear: TimePeriod<'dy', 'dyExtent'> = {
  name: 'day of year',
  range: 86400,
  val(d) {
    return (
      d.dy ||
      (d.dy = Math.ceil(
        1 + (Day.start(d).getTime() - Year.start(d).getTime()) / DAY
      ))
    );
  },
  isValid(d, value) {
    return this.val(d) === (value || this.extent(d)[1]);
  },
  extent(d) {
    const year = Year.val(d);
    return d.dyExtent || (d.dyExtent = [1, year % 4 ? 365 : 366]);
  },
  start(d) {
    return Day.start(d);
  },
  end(d) {
    return Day.end(d);
  },
  next(d, value) {
    value = value > this.extent(d)[1] ? 1 : value;
    const year = laterDate.nextRollover(d, value, this, Year);
    const dyMax = this.extent(year)[1];
    value = value > dyMax ? 1 : value || dyMax;
    return laterDate.next(Year.val(year), Month.val(year), value);
  },
  prev(d, value) {
    const year = laterDate.prevRollover(d, value, this, Year);
    const dyMax = this.extent(year)[1];
    value = value > dyMax ? dyMax : value || dyMax;
    return laterDate.prev(Year.val(year), Month.val(year), value);
  }
};

export default dayOfYear;
