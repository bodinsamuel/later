import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import type { TimePeriod } from '../types';

const dayOfWeekCount: TimePeriod<'dc', 'dcExtent', 'dcStart', 'dcEnd'> = {
  name: 'day of week count',
  range: 604800,
  val(d) {
    return d.dc || (d.dc = Math.floor((Day.val(d) - 1) / 7) + 1);
  },
  isValid(d, value) {
    return (
      this.val(d) === value ||
      (value === 0 && Day.val(d) > Day.extent(d)[1] - 7)
    );
  },
  extent(d) {
    return d.dcExtent || (d.dcExtent = [1, Math.ceil(Day.extent(d)[1] / 7)]);
  },
  start(d) {
    return (
      d.dcStart ||
      (d.dcStart = laterDate.next(
        Year.val(d),
        Month.val(d),
        Math.max(1, (this.val(d) - 1) * 7 + 1 || 1)
      ))
    );
  },
  end(d) {
    return (
      d.dcEnd ||
      (d.dcEnd = laterDate.prev(
        Year.val(d),
        Month.val(d),
        Math.min(this.val(d) * 7, Day.extent(d)[1])
      ))
    );
  },
  next(d, value) {
    value = value > this.extent(d)[1] ? 1 : value;
    let month = laterDate.nextRollover(d, value, this, Month);
    const dcMax = this.extent(month)[1];
    value = value > dcMax ? 1 : value;
    const next = laterDate.next(
      Year.val(month),
      Month.val(month),
      value === 0 ? Day.extent(month)[1] - 6 : 1 + 7 * (value - 1)
    );
    if (next.getTime() <= d.getTime()) {
      // @ts-expect-error
      month = Month.next(d, Month.val(d) + 1);
      return laterDate.next(
        Year.val(month),
        Month.val(month),
        value === 0 ? Day.extent(month)[1] - 6 : 1 + 7 * (value - 1)
      );
    }

    return next;
  },
  prev(d, value) {
    const month = laterDate.prevRollover(d, value, this, Month);
    const dcMax = this.extent(month)[1];
    value = value > dcMax ? dcMax : value || dcMax;
    return this.end(
      laterDate.prev(Year.val(month), Month.val(month), 1 + 7 * (value - 1))
    );
  }
};

export default dayOfWeekCount;
