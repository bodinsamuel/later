import { WEEK } from './constants';
import laterDate from './date';
import Year from './year';
import Month from './month';
import Day from './day';
import DayOfWeek from './day-of-week';

const weekOfYear = {
  name: 'week of year (ISO)',
  range: 604800,
  val(d) {
    if (d.wy) return d.wy;
    const wThur = DayOfWeek.next(this.start(d), 5);
    const YThur = DayOfWeek.next(Year.prev(wThur, Year.val(wThur) - 1), 5);
    return (d.wy = 1 + Math.ceil((wThur.getTime() - YThur.getTime()) / WEEK));
  },
  isValid(d, value) {
    return this.val(d) === (value || this.extent(d)[1]);
  },
  extent(d) {
    if (d.wyExtent) return d.wyExtent;
    const year = DayOfWeek.next(this.start(d), 5);
    const dwFirst = DayOfWeek.val(Year.start(year));
    const dwLast = DayOfWeek.val(Year.end(year));
    return (d.wyExtent = [1, dwFirst === 5 || dwLast === 5 ? 53 : 52]);
  },
  start(d) {
    return (
      d.wyStart ||
      (d.wyStart = laterDate.next(
        Year.val(d),
        Month.val(d),
        Day.val(d) - (DayOfWeek.val(d) > 1 ? DayOfWeek.val(d) - 2 : 6)
      ))
    );
  },
  end(d) {
    return (
      d.wyEnd ||
      (d.wyEnd = laterDate.prev(
        Year.val(d),
        Month.val(d),
        Day.val(d) + (DayOfWeek.val(d) > 1 ? 8 - DayOfWeek.val(d) : 0)
      ))
    );
  },
  next(d, value) {
    value = value > this.extent(d)[1] ? 1 : value;
    const wyThur = DayOfWeek.next(this.start(d), 5);
    let year = laterDate.nextRollover(wyThur, value, this, Year);
    if (this.val(year) !== 1) {
      year = DayOfWeek.next(year, 2);
    }

    const wyMax = this.extent(year)[1];
    const wyStart = this.start(year);
    value = value > wyMax ? 1 : value || wyMax;
    return laterDate.next(
      Year.val(wyStart),
      Month.val(wyStart),
      Day.val(wyStart) + 7 * (value - 1)
    );
  },
  prev(d, value) {
    const wyThur = DayOfWeek.next(this.start(d), 5);
    let year = laterDate.prevRollover(wyThur, value, this, Year);
    if (this.val(year) !== 1) {
      year = DayOfWeek.next(year, 2);
    }

    const wyMax = this.extent(year)[1];
    const wyEnd = this.end(year);
    value = value > wyMax ? wyMax : value || wyMax;
    return this.end(
      laterDate.next(
        Year.val(wyEnd),
        Month.val(wyEnd),
        Day.val(wyEnd) + 7 * (value - 1)
      )
    );
  }
};

export default weekOfYear;
