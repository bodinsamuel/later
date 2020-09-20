import schedule from './schedule';

export default function setTimeout(fn, sched) {
  const s = schedule(sched);
  let t: number;
  if (fn) {
    scheduleTimeout();
  }

  function scheduleTimeout() {
    const now = Date.now();
    const next = s.next(2, now);
    if (!next[0]) {
      t = undefined;
      return;
    }

    let diff = next[0].getTime() - now;
    if (diff < 1e3) {
      diff = next[1] ? next[1].getTime() - now : 1e3;
    }

    if (diff < 2147483647) {
      t = (global.setTimeout(fn, diff) as unknown) as number;
    } else {
      t = (global.setTimeout(scheduleTimeout, 2147483647) as unknown) as number;
    }
  }

  return {
    isDone() {
      return !t;
    },
    clear() {
      clearTimeout(t);
    }
  };
}
