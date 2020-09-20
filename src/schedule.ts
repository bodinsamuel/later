import { NEVER, SEC } from './constants';
import compile from './compile';

type Dir = 'next' | 'prev';

export default function schedule(sched) {
  if (!sched) throw new Error('Missing schedule definition.');
  if (!sched.schedules)
    throw new Error('Definition must include at least one schedule.');
  const schedules: any[] = [];
  const schedulesLength = sched.schedules.length;
  const exceptions: any[] = [];
  const exceptionsLength = sched.exceptions ? sched.exceptions.length : 0;
  for (let i = 0; i < schedulesLength; i++) {
    schedules.push(compile(sched.schedules[i]));
  }

  for (let j = 0; j < exceptionsLength; j++) {
    exceptions.push(compile(sched.exceptions[j]));
  }

  function getInstances(
    dir,
    count,
    startDate?: Date,
    endDate?: Date,
    isRange?: boolean
  ) {
    const compare = compareFn(dir);
    let loopCount = count;
    let maxAttempts = 1e3;
    const schedStarts = [];
    const exceptStarts = [];
    let next;
    let end;
    const results: Array<Date | Date[]> = [];
    const isForward = dir === 'next';
    let lastResult;
    const rStart = isForward ? 0 : 1;
    const rEnd = isForward ? 1 : 0;
    const startDateSafe = startDate ? new Date(startDate) : new Date();
    const endDateSafe = endDate ? new Date(endDate) : startDateSafe;

    if (!startDate || !startDateSafe.getTime())
      throw new Error('Invalid start date.');

    setNextStarts(dir, schedules, schedStarts, startDateSafe);
    setRangeStarts(dir, exceptions, exceptStarts, startDateSafe);

    while (
      maxAttempts-- &&
      loopCount &&
      (next = findNext(schedStarts, compare))
    ) {
      if (endDate && compare(next, endDateSafe)) {
        break;
      }

      if (exceptionsLength) {
        updateRangeStarts(dir, exceptions, exceptStarts, next);
        if ((end = calcRangeOverlap(dir, exceptStarts, next))) {
          updateNextStarts(dir, schedules, schedStarts, end);
          continue;
        }
      }

      if (isRange) {
        const maxEndDate = calcMaxEndDate(exceptStarts, compare);
        end = calcEnd(dir, schedules, schedStarts, next, maxEndDate);
        const r = isForward
          ? [
              new Date(Math.max(startDateSafe.getTime(), next)),
              end
                ? new Date(endDate ? Math.min(end, endDateSafe.getTime()) : end)
                : undefined
            ]
          : [
              end
                ? new Date(
                    endDate
                      ? Math.max(endDateSafe.getTime(), end.getTime() + SEC)
                      : end.getTime() + SEC
                  )
                : undefined,
              new Date(Math.min(endDateSafe.getTime(), next.getTime() + SEC))
            ];
        if (lastResult && r[rStart]!.getTime() === lastResult[rEnd].getTime()) {
          lastResult[rEnd] = r[rEnd];
          loopCount++;
        } else {
          lastResult = r;
          results.push(lastResult);
        }

        if (!end) break;
        updateNextStarts(dir, schedules, schedStarts, end);
      } else {
        results.push(
          isForward
            ? new Date(Math.max(startDateSafe.getTime(), next))
            : getStart(schedules, schedStarts, next, endDate)
        );
        tickStarts(dir, schedules, schedStarts, next);
      }

      loopCount--;
    }

    for (let i = 0, { length } = results; i < length; i++) {
      const result = results[i];
      results[i] = Array.isArray(result)
        ? [cleanDate(result[0]), cleanDate(result[1])]
        : cleanDate(result);
    }

    return results.length === 0 ? NEVER : count === 1 ? results[0] : results;
  }

  function cleanDate(d: Date): Date | undefined {
    if (d instanceof Date && !isNaN(d.valueOf())) {
      return new Date(d);
    }

    return undefined;
  }

  function setNextStarts(dir: Dir, schedArray, startsArray, startDate) {
    for (let i = 0, { length } = schedArray; i < length; i++) {
      startsArray[i] = schedArray[i].start(dir, startDate);
    }
  }

  function updateNextStarts(dir: Dir, schedArray, startsArray, startDate) {
    const compare = compareFn(dir);
    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (startsArray[i] && !compare(startsArray[i], startDate)) {
        startsArray[i] = schedArray[i].start(dir, startDate);
      }
    }
  }

  function setRangeStarts(dir: Dir, schedArray, rangesArray, startDate) {
    // const compare = compareFn(dir);
    for (let i = 0, { length } = schedArray; i < length; i++) {
      const nextStart = schedArray[i].start(dir, startDate);
      if (!nextStart) {
        rangesArray[i] = NEVER;
      } else {
        rangesArray[i] = [nextStart, schedArray[i].end(dir, nextStart)];
      }
    }
  }

  function updateRangeStarts(dir: Dir, schedArray, rangesArray, startDate) {
    const compare = compareFn(dir);
    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (rangesArray[i] && !compare(rangesArray[i][0], startDate)) {
        const nextStart = schedArray[i].start(dir, startDate);
        if (!nextStart) {
          rangesArray[i] = NEVER;
        } else {
          rangesArray[i] = [nextStart, schedArray[i].end(dir, nextStart)];
        }
      }
    }
  }

  function tickStarts(dir: Dir, schedArray, startsArray, startDate) {
    for (let i = 0, { length } = schedArray; i < length; i++) {
      if (startsArray[i] && startsArray[i].getTime() === startDate.getTime()) {
        startsArray[i] = schedArray[i].start(
          dir,
          schedArray[i].tick(dir, startDate)
        );
      }
    }
  }

  function getStart(schedArray, startsArray, startDate, minEndDate) {
    let result;
    for (let i = 0, { length } = startsArray; i < length; i++) {
      if (startsArray[i] && startsArray[i].getTime() === startDate.getTime()) {
        const start = schedArray[i].tickStart(startDate);
        if (minEndDate && start < minEndDate) {
          return minEndDate;
        }

        if (!result || start > result) {
          result = start;
        }
      }
    }

    return result;
  }

  function calcRangeOverlap(dir: Dir, rangesArray, startDate) {
    const compare = compareFn(dir);
    let result;
    for (let i = 0, { length } = rangesArray; i < length; i++) {
      const range = rangesArray[i];
      if (
        range &&
        !compare(range[0], startDate) &&
        (!range[1] || compare(range[1], startDate))
      ) {
        if (!result || compare(range[1], result)) {
          result = range[1];
        }
      }
    }

    return result;
  }

  function calcMaxEndDate(exceptsArray, compare) {
    let result;
    for (let i = 0, { length } = exceptsArray; i < length; i++) {
      if (exceptsArray[i] && (!result || compare(result, exceptsArray[i][0]))) {
        result = exceptsArray[i][0];
      }
    }

    return result;
  }

  function calcEnd(dir: Dir, schedArray, startsArray, startDate, maxEndDate) {
    const compare = compareFn(dir);
    let result;
    for (let i = 0, { length } = schedArray; i < length; i++) {
      const start = startsArray[i];
      if (start && start.getTime() === startDate.getTime()) {
        const end = schedArray[i].end(dir, start);
        if (maxEndDate && (!end || compare(end, maxEndDate))) {
          return maxEndDate;
        }

        if (!result || compare(end, result)) {
          result = end;
        }
      }
    }

    return result;
  }

  function compareFn(dir: Dir) {
    return dir === 'next'
      ? function (a: Date, b?: Date) {
          return !b || a.getTime() > b.getTime();
        }
      : function (a: Date, b?: Date) {
          return !a || b.getTime() > a.getTime();
        };
  }

  function findNext(array, compare) {
    let next = array[0];
    for (let i = 1, { length } = array; i < length; i++) {
      if (array[i] && compare(next, array[i])) {
        next = array[i];
      }
    }

    return next;
  }

  return {
    isValid(d: Date) {
      return getInstances('next', 1, d, d) !== NEVER;
    },
    next(count: number, startDate: Date, endDate?: Date) {
      return getInstances('next', count || 1, startDate, endDate);
    },
    prev(count: number, startDate: Date, endDate?: Date) {
      return getInstances('prev', count || 1, startDate, endDate);
    },
    nextRange(count: number, startDate: Date, endDate?: Date) {
      return getInstances('next', count || 1, startDate, endDate, true);
    },
    prevRange(count: number, startDate: Date, endDate?: Date) {
      return getInstances('prev', count || 1, startDate, endDate, true);
    }
  };
}
