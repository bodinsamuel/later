import setTimeout from './set-timeout';
import type { ScheduleData } from './types';

export default function setInterval(fn: () => void, sched: ScheduleData) {
  let t = setTimeout(scheduleTimeout, sched);
  let done = t.isDone();
  function scheduleTimeout() {
    if (!done) {
      fn();
      t = setTimeout(scheduleTimeout, sched);
    }
  }

  return {
    isDone() {
      return t.isDone();
    },
    clear() {
      done = true;
      t.clear();
    }
  };
}
