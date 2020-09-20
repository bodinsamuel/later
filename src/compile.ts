import { NEVER, SEC } from './constants';
import modifier from './modifier';
import laterArray from './array';
import { parts } from './parts';
import type { KeyWithModifier, Key, Modifier, TimePeriod } from './types';

type Values = [number] | [number, number];
type Def = Record<Key & KeyWithModifier, Values>;
type Dir = 'next' | 'prev';

export default function compile(schedDef: Partial<Def>) {
  const constraints: Array<{ constraint: TimePeriod; vals: Values }> = [];
  let constraintsLength = 0;
  let tickConstraint: TimePeriod;
  for (const key in schedDef) {
    const nameParts = key.split('_');
    const name = nameParts[0] as Key;
    const mod = nameParts[1] as Modifier | undefined;
    const vals: Values = schedDef[key];
    const constraint = mod ? modifier[mod](parts[name], vals) : parts[name];
    constraints.push({
      constraint,
      vals
    });
    constraintsLength++;
  }

  constraints.sort(function (a, b) {
    const ra = a.constraint.range;
    const rb = b.constraint.range;
    return rb < ra ? -1 : rb > ra ? 1 : 0;
  });
  tickConstraint = constraints[constraintsLength - 1].constraint;
  function compareFn(dir: Dir) {
    return dir === 'next'
      ? function (a, b) {
          return a.getTime() > b.getTime();
        }
      : function (a, b) {
          return b.getTime() > a.getTime();
        };
  }

  return {
    start(dir: Dir, startDate) {
      let next = startDate;
      const nextValue = laterArray[dir];
      let maxAttempts = 1e3;
      let done;
      while (maxAttempts-- && !done && next) {
        done = true;
        for (let i = 0; i < constraintsLength; i++) {
          const { constraint } = constraints[i];
          const curValue = constraint.val(next);
          const extent = constraint.extent(next);
          const newValue = nextValue(curValue, constraints[i].vals, extent);
          if (!constraint.isValid(next, newValue)) {
            next = constraint[dir](next, newValue);
            done = false;
            break;
          }
        }
      }

      if (next !== NEVER) {
        next =
          dir === 'next'
            ? tickConstraint.start(next)
            : tickConstraint.end(next);
      }

      return next;
    },
    end(dir: Dir, startDate) {
      let result;
      const nextValue = laterArray[dir + 'Invalid'];
      const compare = compareFn(dir);
      for (let i = constraintsLength - 1; i >= 0; i--) {
        const { constraint } = constraints[i];
        const curValue = constraint.val(startDate);
        const extent = constraint.extent(startDate);
        const newValue = nextValue(curValue, constraints[i].vals, extent);
        var next;
        if (newValue !== undefined) {
          next = constraint[dir](startDate, newValue);
          if (next && (!result || compare(result, next))) {
            result = next;
          }
        }
      }

      return result;
    },
    tick(dir: Dir, date) {
      return new Date(
        dir === 'next'
          ? tickConstraint.end(date).getTime() + SEC
          : tickConstraint.start(date).getTime() - SEC
      );
    },
    tickStart(date) {
      return tickConstraint.start(date);
    }
  };
}
