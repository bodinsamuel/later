import laterDate from '../date';
import type { TimePeriod } from '../types';
import Year from './year';

const month: TimePeriod<'M', '', 'MStart', 'MEnd'> = {
  name: 'month',
  range: 2629740,
  val(d) {
    return d.M || (d.M = laterDate.getMonth.call(d) + 1);
  },
  isValid(d, value) {
    return month.val(d) === (value || 12);
  },
  extent() {
    return [1, 12];
  },
  start(d) {
    return d.MStart || (d.MStart = laterDate.next(Year.val(d), month.val(d)));
  },
  end(d) {
    return d.MEnd || (d.MEnd = laterDate.prev(Year.val(d), month.val(d)));
  },
  next(d, value) {
    value = value > 12 ? 1 : value || 12;
    return laterDate.next(Year.val(d) + (value > month.val(d) ? 0 : 1), value);
  },
  prev(d, value) {
    value = value > 12 ? 12 : value || 12;
    return laterDate.prev(Year.val(d) - (value >= month.val(d) ? 1 : 0), value);
  }
};

export default month;
