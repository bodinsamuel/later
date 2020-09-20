import { NEVER } from '../constants';
import laterDate from '../date';
import type { TimePeriod } from '../types';

const year: TimePeriod = {
  name: 'year',
  range: 31556900,
  val(d) {
    return d.Y || (d.Y = laterDate.getYear.call(d));
  },
  isValid(d, value) {
    return this.val(d) === value;
  },
  extent() {
    return [1970, 2099];
  },
  start(d) {
    return d.YStart || (d.YStart = laterDate.next(this.val(d)));
  },
  end(d) {
    return d.YEnd || (d.YEnd = laterDate.prev(this.val(d)));
  },
  next(d, value) {
    return value > this.val(d) && value <= this.extent()[1]
      ? laterDate.next(value)
      : NEVER;
  },
  prev(d, value) {
    return value < this.val(d) && value >= this.extent()[0]
      ? laterDate.prev(value)
      : NEVER;
  }
};

export default year;
