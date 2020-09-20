import { WEEK } from '../constants';
import laterDate from '../date';
import Year from './year';
import Month from './month';
import day from './day';
import dayOfWeek from './day-of-week';
import type { TimePeriod } from '../types';

const weekOfYear: TimePeriod<'wy', 'wyExtent', 'wyStart', 'wyEnd'> = {
  name: 'week of year (ISO)',
  range: 604800,
  val(d) {
    if (d.wy) return d.wy;
    const wThur = dayOfWeek.next(weekOfYear.start(d), 5);
    const YThur = dayOfWeek.next(
      // @ts-expect-error
      Year.prev(wThur, wThur ? Year.val(wThur) - 1 : 0),
      5
    );
    return (d.wy =
      1 +
      (wThur && YThur
        ? Math.ceil((wThur.getTime() - YThur.getTime()) / WEEK)
        : 0));
  },
  isValid(d, value) {
    return weekOfYear.val(d) === (value || weekOfYear.extent(d)[1]);
  },
  extent(d) {
    if (d.wyExtent) return d.wyExtent;
    const year = dayOfWeek.next(weekOfYear.start(d), 5);
    // @ts-expect-error
    const dwFirst = dayOfWeek.val(Year.start(year));
    // @ts-expect-error
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
    value = value > weekOfYear.extent(d)[1] ? 1 : value;
    const wyThur = dayOfWeek.next(weekOfYear.start(d), 5);
    let year = laterDate.nextRollover(wyThur, value, weekOfYear, Year);
    if (weekOfYear.val(year) !== 1) {
      // @ts-expect-error
      year = dayOfWeek.next(year, 2);
    }

    const wyMax = weekOfYear.extent(year)[1];
    const wyStart = weekOfYear.start(year);
    value = value > wyMax ? 1 : value || wyMax;
    return laterDate.next(
      Year.val(wyStart),
      Month.val(wyStart),
      day.val(wyStart) + 7 * (value - 1)
    );
  },
  prev(d, value) {
    const wyThur = dayOfWeek.next(weekOfYear.start(d), 5);
    let year = laterDate.prevRollover(wyThur, value, weekOfYear, Year);
    if (weekOfYear.val(year) !== 1) {
      // @ts-expect-error
      year = dayOfWeek.next(year, 2);
    }

    const wyMax = weekOfYear.extent(year)[1];
    const wyEnd = weekOfYear.end(year);
    value = value > wyMax ? wyMax : value || wyMax;
    return weekOfYear.end(
      laterDate.next(
        Year.val(wyEnd),
        Month.val(wyEnd),
        day.val(wyEnd) + 7 * (value - 1)
      )
    );
  }
};

export default weekOfYear;
