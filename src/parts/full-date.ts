import { NEVER } from '../constants';
import type { TimePeriod } from '../types';

const fullDate: TimePeriod = {
  name: 'full date',
  range: 1,
  val(d) {
    return d.fd || (d.fd = d.getTime());
  },
  isValid(d, value) {
    return this.val(d) === value;
  },
  extent() {
    return [0, 3250368e7];
  },
  start(d) {
    return d;
  },
  end(d) {
    return d;
  },
  next(d, value) {
    return this.val(d) < value ? new Date(value) : NEVER;
  },
  prev(d, value) {
    return this.val(d) > value ? new Date(value) : NEVER;
  }
};

export default fullDate;
