import laterDate from '../date';
import Year from './year';
import Month from './month';
import Day from './day';
import DayOfWeek from './day-of-week';
import type { TimePeriod } from '../types';

const weekOfMonth: TimePeriod<'wm', 'wmExtent', 'wmStart', 'wmEnd'> = {
  name: 'week of month',
  range: 604800,
  val(d) {
    return (
      d.wm ||
      (d.wm =
        (Day.val(d) +
          (DayOfWeek.val(Month.start(d)) - 1) +
          (7 - DayOfWeek.val(d))) /
        7)
    );
  },
  isValid(d, value) {
    return weekOfMonth.val(d) === (value || weekOfMonth.extent(d)[1]);
  },
  extent(d) {
    return (
      d.wmExtent ||
      (d.wmExtent = [
        1,
        (Day.extent(d)[1] +
          (DayOfWeek.val(Month.start(d)) - 1) +
          (7 - DayOfWeek.val(Month.end(d)))) /
          7
      ])
    );
  },
  start(d) {
    return (
      d.wmStart ||
      (d.wmStart = laterDate.next(
        Year.val(d),
        Month.val(d),
        Math.max(Day.val(d) - DayOfWeek.val(d) + 1, 1)
      ))
    );
  },
  end(d) {
    return (
      d.wmEnd ||
      (d.wmEnd = laterDate.prev(
        Year.val(d),
        Month.val(d),
        Math.min(Day.val(d) + (7 - DayOfWeek.val(d)), Day.extent(d)[1])
      ))
    );
  },
  next(d, value) {
    value = value > weekOfMonth.extent(d)[1] ? 1 : value;
    const month = laterDate.nextRollover(d, value, weekOfMonth, Month);
    const wmMax = weekOfMonth.extent(month)[1];
    value = value > wmMax ? 1 : value || wmMax;
    return laterDate.next(
      Year.val(month),
      Month.val(month),
      Math.max(1, (value - 1) * 7 - (DayOfWeek.val(month) - 2))
    );
  },
  prev(d, value) {
    const month = laterDate.prevRollover(d, value, weekOfMonth, Month);
    const wmMax = weekOfMonth.extent(month)[1];
    value = value > wmMax ? wmMax : value || wmMax;
    return weekOfMonth.end(
      laterDate.next(
        Year.val(month),
        Month.val(month),
        Math.max(1, (value - 1) * 7 - (DayOfWeek.val(month) - 2))
      )
    );
  }
};

export default weekOfMonth;
