import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import type { TimePeriod } from '../types';

const dayOfWeek: TimePeriod<'dw'> = {
  name: 'day of week',
  range: 86400,
  val(d) {
    return d.dw || (d.dw = laterDate.getDay.call(d) + 1);
  },
  isValid(d, value) {
    return this.val(d) === (value || 7);
  },
  extent() {
    return [1, 7];
  },
  start(d) {
    return Day.start(d);
  },
  end(d) {
    return Day.end(d);
  },
  next(d, value) {
    value = value > 7 ? 1 : value || 7;
    return laterDate.next(
      Year.val(d),
      Month.val(d),
      Day.val(d) + (value - this.val(d)) + (value <= this.val(d) ? 7 : 0)
    );
  },
  prev(d, value) {
    value = value > 7 ? 7 : value || 7;
    return laterDate.prev(
      Year.val(d),
      Month.val(d),
      Day.val(d) + (value - this.val(d)) + (value >= this.val(d) ? -7 : 0)
    );
  }
};

export default dayOfWeek;
