import { WEEK } from '../constants';
import laterDate from '../date';
import Year from './year';
import Month from './month';
import day from './day';
import dayOfWeek from './day-of-week';
import type { TimePeriod } from '../types';

const weekOfYear: TimePeriod = {
  name: 'week of year (ISO)',
  range: 604800,
  val(d) {
    if (d.wy) return d.wy;
    const wThur = dayOfWeek.next(this.start(d), 5);
    const YThur = dayOfWeek.next(Year.prev(wThur, Year.val(wThur) - 1), 5);
    return (d.wy = 1 + (wThur && YThur ? Math.ceil((wThur.getTime() - YThur.getTime()) / WEEK) : 0));
  },
  isValid(d, value) {
    return this.val(d) === (value || this.extent(d)[1]);
  },
  extent(d) {
    if (d.wyExtent) return d.wyExtent;
    const year = dayOfWeek.next(this.start(d), 5);
    const dwFirst = dayOfWeek.val(Year.start(year));
    const dwLast = dayOfWeek.val(Year.end(year));
    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52]);
  },
  start(d) {
    return (
      d.wyStart ||
      (d.wyStart = laterDate.next(
        Year.val(d),
        Month.val(d),
        day.val(d) - (dayOfWeek.val(d) > 1 ? dayOfWeek.val(d) - 2 : 6)
      ))
    );
  },
  end(d) {
    return (
      d.wyEnd ||
      (d.wyEnd = laterDate.prev(
        Year.val(d),
        Month.val(d),
        day.val(d) + (dayOfWeek.val(d) > 1 ? 8 - dayOfWeek.val(d) : 0)
      ))
    );
  },
  next(d, value) {
    value = value > this.extent(d)[1] ? 1 : value;
    const wyThur = dayOfWeek.next(this.start(d), 5);
    let year = laterDate.nextRollover(wyThur, value, this, Year);
    if (this.val(year) !== 1) {
      year = dayOfWeek.next(year, 2);
    }

    const wyMax = this.extent(year)[1];
    const wyStart = this.start(year);
    value = value > wyMax ? 1 : value || wyMax;
    return laterDate.next(
      Year.val(wyStart),
      Month.val(wyStart),
      day.val(wyStart) + 7 * (value - 1)
    );
  },
  prev(d, value) {
    const wyThur = dayOfWeek.next(this.start(d), 5);
    let year = laterDate.prevRollover(wyThur, value, this, Year);
    if (this.val(year) !== 1) {
      year = dayOfWeek.next(year, 2);
    }

    const wyMax = this.extent(year)[1];
    const wyEnd = this.end(year);
    value = value > wyMax ? wyMax : value || wyMax;
    return this.end(
      laterDate.next(
        Year.val(wyEnd),
        Month.val(wyEnd),
        day.val(wyEnd) + 7 * (value - 1)
      )
    );
  }
};

export default weekOfYear;
