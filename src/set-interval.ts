import setTimeout from './set-timeout';

export default function setInterval(fn, sched) {
  if (!fn) {
    return;
  }

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
