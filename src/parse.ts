import modifier from './modifier';
import {
  CRON_NAMES,
  FIELDS,
  REPLACEMENTS,
  TOKENTYPES,
  TEXT_NAMES
} from './parse-constants';
import type { Key, Token } from './types';

function cron(expr: string, hasSeconds?: boolean) {
  function getValue(
    value: keyof typeof CRON_NAMES | number,
    offset?: number,
    max?: number
  ) {
    return typeof value === 'string'
      ? CRON_NAMES[value] || null
      : Math.min(Number(value) + (offset || 0), max || 9999);
  }

  function cloneSchedule(sched) {
    const clone = {};
    let field;
    for (field in sched) {
      if (field !== 'dc' && field !== 'd') {
        clone[field] = sched[field].slice(0);
      }
    }

    return clone;
  }

  function add(
    sched,
    name: 'd' | 'dc' | 'D',
    min: number,
    max: number,
    inc?: number
  ) {
    let i = min;
    if (!sched[name]) {
      sched[name] = [];
    }

    while (i <= max) {
      if (!sched[name].includes(i)) {
        sched[name].push(i);
      }

      i += inc || 1;
    }

    sched[name].sort(function (a, b) {
      return a - b;
    });
  }

  function addHash(schedules, curSched, value, hash) {
    if (
      (curSched.d && !curSched.dc) ||
      (curSched.dc && !curSched.dc.includes(hash))
    ) {
      schedules.push(cloneSchedule(curSched));
      curSched = schedules[schedules.length - 1];
    }

    add(curSched, 'd', value, value);
    add(curSched, 'dc', hash, hash);
  }

  function addWeekday(s, curSched, value) {
    const except1 = {};
    const except2 = {};
    if (value === 1) {
      add(curSched, 'D', 1, 3);
      add(curSched, 'd', CRON_NAMES.MON, CRON_NAMES.FRI);
      add(except1, 'D', 2, 2);
      add(except1, 'd', CRON_NAMES.TUE, CRON_NAMES.FRI);
      add(except2, 'D', 3, 3);
      add(except2, 'd', CRON_NAMES.TUE, CRON_NAMES.FRI);
    } else {
      add(curSched, 'D', value - 1, value + 1);
      add(curSched, 'd', CRON_NAMES.MON, CRON_NAMES.FRI);
      add(except1, 'D', value - 1, value - 1);
      add(except1, 'd', CRON_NAMES.MON, CRON_NAMES.THU);
      add(except2, 'D', value + 1, value + 1);
      add(except2, 'd', CRON_NAMES.TUE, CRON_NAMES.FRI);
    }

    s.exceptions.push(except1);
    s.exceptions.push(except2);
  }

  function addRange(item, curSched, name, min, max, offset) {
    const incSplit = item.split('/');
    const inc = Number(incSplit[1]);
    const range = incSplit[0];
    if (range !== '*' && range !== '0') {
      const rangeSplit = range.split('-');
      min = getValue(rangeSplit[0], offset, max);
      max = getValue(rangeSplit[1], offset, max) || max;
    }

    add(curSched, name, min, max, inc);
  }

  function parse(item, s, name, min, max, offset) {
    let value;
    let split;
    const { schedules } = s;
    const curSched = schedules[schedules.length - 1];
    if (item === 'L') {
      item = min - 1;
    }

    if ((value = getValue(item, offset, max)) !== null) {
      add(curSched, name, value, value);
    } else if (
      (value = getValue(item.replace('W', ''), offset, max)) !== null
    ) {
      addWeekday(s, curSched, value);
    } else if (
      (value = getValue(item.replace('L', ''), offset, max)) !== null
    ) {
      addHash(schedules, curSched, value, min - 1);
    } else if ((split = item.split('#')).length === 2) {
      value = getValue(split[0], offset, max);
      addHash(schedules, curSched, value, getValue(split[1]));
    } else {
      addRange(item, curSched, name, min, max, offset);
    }
  }

  function isHash(item) {
    return item.includes('#') || item.indexOf('L') > 0;
  }

  function itemSorter(a, b) {
    return isHash(a) && !isHash(b) ? 1 : a - b;
  }

  function parseExpr(expr: string) {
    const schedule = {
      schedules: [{}],
      exceptions: []
    };
    const components = expr.replace(/(\s)+/g, ' ').split(' ');
    let field: string;
    let f: number[];
    let component: string;
    let items: string[];
    for (field in FIELDS) {
      f = FIELDS[field];
      component = components[f[0]];
      if (component && component !== '*' && component !== '?') {
        items = component.split(',').sort(itemSorter);
        var i: number;
        const { length } = items;
        for (i = 0; i < length; i++) {
          parse(items[i], schedule, field, f[1], f[2], f[3]);
        }
      }
    }

    return schedule;
  }

  function prepareExpr(expr) {
    const prepared = expr.toUpperCase();
    return REPLACEMENTS[prepared] || prepared;
  }

  const e = prepareExpr(expr);
  return parseExpr(hasSeconds ? e : '0 ' + e);
}

function recur() {
  const schedules = [];
  const exceptions = [];
  let cur;
  let curArray: any[] = schedules;
  let curName;
  let values: Array<number | string | Date> = [];
  let every: number;
  let modifierLocal: 'a' | 'b' | null = null;
  let applyMin;
  let applyMax;
  let i;
  let last;

  function add(name: Key, min?: number, max?: number) {
    const nameLocal = modifierLocal ? `${name}_${modifierLocal}` : name;
    if (!cur) {
      curArray.push({});
      cur = curArray[0];
    }

    if (!cur[nameLocal]) {
      cur[nameLocal] = [];
    }

    curName = cur[nameLocal];
    if (every) {
      values = [];
      for (i = min; i <= max; i += every) {
        values.push(i);
      }

      last = {
        n: nameLocal,
        x: every,
        c: curName.length,
        m: max
      };
    }

    values = applyMin ? [min] : applyMax ? [max] : values;
    const { length } = values;
    for (i = 0; i < length; i += 1) {
      const value = values[i];
      if (!curName.includes(value)) {
        curName.push(value);
      }
    }

    every = applyMin = applyMax = 0;
    values = [];
    modifierLocal = null;
  }

  return {
    schedules,
    exceptions,
    on(...args: number[] | Array<Date | string>) {
      values = Array.isArray(args[0]) ? args[0] : args;
      return this;
    },
    every(x?: number) {
      every = x || 1;
      return this;
    },
    after(x) {
      modifierLocal = 'a';
      values = [x];
      return this;
    },
    before(x) {
      modifierLocal = 'b';
      values = [x];
      return this;
    },
    first() {
      applyMin = 1;
      return this;
    },
    last() {
      applyMax = 1;
      return this;
    },
    time() {
      for (let i = 0, { length } = values; i < length; i++) {
        // @ts-expect-error
        const split = values[i].split(':');
        if (split.length < 3) split.push(0);
        values[i] =
          Number(split[0]) * 3600 + Number(split[1]) * 60 + Number(split[2]);
      }

      add('t');
      return this;
    },
    second() {
      add('s', 0, 59);
      return this;
    },
    minute() {
      add('m', 0, 59);
      return this;
    },
    hour() {
      add('h', 0, 23);
      return this;
    },
    dayOfMonth() {
      add('D', 1, applyMax ? 0 : 31);
      return this;
    },
    dayOfWeek() {
      add('d', 1, 7);
      return this;
    },
    onWeekend() {
      values = [1, 7];
      return this.dayOfWeek();
    },
    onWeekday() {
      values = [2, 3, 4, 5, 6];
      return this.dayOfWeek();
    },
    dayOfWeekCount() {
      add('dc', 1, applyMax ? 0 : 5);
      return this;
    },
    dayOfYear() {
      add('dy', 1, applyMax ? 0 : 366);
      return this;
    },
    weekOfMonth() {
      add('wm', 1, applyMax ? 0 : 5);
      return this;
    },
    weekOfYear() {
      add('wy', 1, applyMax ? 0 : 53);
      return this;
    },
    month() {
      add('M', 1, 12);
      return this;
    },
    year() {
      add('Y', 1970, 2450);
      return this;
    },
    fullDate(): typeof recur {
      for (let i = 0, { length } = values; i < length; i++) {
        // @ts-expect-error
        values[i] = values[i].getTime();
      }

      add('fd');
      return this;
    },
    customModifier(id) {
      const custom = modifier[id];
      if (!custom) throw new Error(`Custom modifier ${id} not recognized!`);
      modifierLocal = id;
      values = Array.isArray(arguments[1]) ? arguments[1] : [arguments[1]];
      return this;
    },
    customPeriod(id: string) {
      // @ts-expect-error TODO fix
      const custom = parts[id];
      if (!custom) throw new Error(`Custom time period ${id} not recognized!`);
      // @ts-expect-error TODO fix
      add(id, custom.extent(new Date())[0], custom.extent(new Date())[1]);
      return this;
    },
    startingOn(start) {
      return this.between(start, last.m);
    },
    between(start, end) {
      cur[last.n] = cur[last.n].splice(0, last.c);
      every = last.x;
      add(last.n, start, end);
      return this;
    },
    and() {
      cur = curArray[curArray.push({}) - 1];
      return this;
    },
    except() {
      curArray = exceptions;
      cur = null;
      return this;
    }
  };
}

function text(string: string) {
  let pos = 0;
  let input: string = '';
  let error: number | undefined;

  function toToken(
    start: number,
    end: number,
    text: string,
    type?: string
  ): Token {
    return {
      startPos: start,
      endPos: end,
      text,
      type
    };
  }

  function peek(expected: RegExp | RegExp[]) {
    const scanTokens = Array.isArray(expected) ? expected : [expected];
    const whiteSpace = /\s+/;
    let token;
    let curInput: string;
    let m;
    let scanToken;
    let start: number;
    let length_: number;
    scanTokens.push(whiteSpace);
    start = pos;

    while (!token || token.type === whiteSpace) {
      length_ = -1;
      curInput = input.slice(Math.max(0, start));
      token = toToken(start, start, input.split(whiteSpace)[0]);

      for (const scanToken_ of scanTokens) {
        scanToken = scanToken_;
        m = scanToken.exec(curInput);
        if (m && m.index === 0 && m[0].length > length_) {
          length_ = m[0].length;
          token = toToken(
            start,
            start + length_,
            curInput.slice(0, Math.max(0, length_)),
            scanToken
          );
        }
      }

      if (token.type === whiteSpace) {
        start = token.endPos;
      }
    }

    return token;
  }

  function scan(expectedToken: RegExp | RegExp[]) {
    const token = peek(expectedToken);
    pos = token.endPos;
    return token;
  }

  function parseThroughExpr(tokenType: RegExp): number[] {
    const start = Number(parseTokenValue(tokenType));
    const end = checkAndParse(TOKENTYPES.through)
      ? Number(parseTokenValue(tokenType))
      : start;
    const nums: number[] = [];
    for (let i = start; i <= end; i++) {
      nums.push(i);
    }

    return nums;
  }

  function parseRanges(tokenType: RegExp): number[] {
    let nums = parseThroughExpr(tokenType);
    while (checkAndParse(TOKENTYPES.and)) {
      nums = nums.concat(parseThroughExpr(tokenType));
    }

    return nums;
  }

  function parseEvery(r) {
    let number;
    let period;
    let start;
    let end;
    if (checkAndParse(TOKENTYPES.weekend)) {
      r.on(TEXT_NAMES.sun, TEXT_NAMES.sat).dayOfWeek();
    } else if (checkAndParse(TOKENTYPES.weekday)) {
      r.on(
        TEXT_NAMES.mon,
        TEXT_NAMES.tue,
        TEXT_NAMES.wed,
        TEXT_NAMES.thu,
        TEXT_NAMES.fri
      ).dayOfWeek();
    } else {
      number = parseTokenValue(TOKENTYPES.rank);
      r.every(number);
      period = parseTimePeriod(r);
      if (checkAndParse(TOKENTYPES.start)) {
        number = parseTokenValue(TOKENTYPES.rank);
        r.startingOn(number);
        parseToken(period.type);
      } else if (checkAndParse(TOKENTYPES.between)) {
        start = parseTokenValue(TOKENTYPES.rank);
        if (checkAndParse(TOKENTYPES.and)) {
          end = parseTokenValue(TOKENTYPES.rank);
          r.between(start, end);
        }
      }
    }
  }

  function parseOnThe(r) {
    if (checkAndParse(TOKENTYPES.first)) {
      r.first();
    } else if (checkAndParse(TOKENTYPES.last)) {
      r.last();
    } else {
      r.on(parseRanges(TOKENTYPES.rank));
    }

    parseTimePeriod(r);
  }

  function parseScheduleExpr(string_: string) {
    pos = 0;
    input = string_;
    error = -1;
    const r = recur();
    while (pos < input.length && error < 0) {
      const token = parseToken([
        TOKENTYPES.every,
        TOKENTYPES.after,
        TOKENTYPES.before,
        TOKENTYPES.onthe,
        TOKENTYPES.on,
        TOKENTYPES.of,
        TOKENTYPES.in,
        TOKENTYPES.at,
        TOKENTYPES.and,
        TOKENTYPES.except,
        TOKENTYPES.also
      ]);
      switch (token.type) {
        case TOKENTYPES.every:
          parseEvery(r);
          break;

        case TOKENTYPES.after:
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.after(parseTokenValue(TOKENTYPES.time));
            r.time();
          } else {
            r.after(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          }

          break;

        case TOKENTYPES.before:
          if (peek(TOKENTYPES.time).type !== undefined) {
            r.before(parseTokenValue(TOKENTYPES.time));
            r.time();
          } else {
            r.before(parseTokenValue(TOKENTYPES.rank));
            parseTimePeriod(r);
          }

          break;

        case TOKENTYPES.onthe:
          parseOnThe(r);
          break;

        case TOKENTYPES.on:
          r.on(parseRanges(TOKENTYPES.dayName)).dayOfWeek();
          break;

        case TOKENTYPES.of:
          r.on(parseRanges(TOKENTYPES.monthName)).month();
          break;

        case TOKENTYPES.in:
          r.on(parseRanges(TOKENTYPES.yearIndex)).year();
          break;

        case TOKENTYPES.at:
          r.on(parseTokenValue(TOKENTYPES.time)).time();
          while (checkAndParse(TOKENTYPES.and)) {
            r.on(parseTokenValue(TOKENTYPES.time)).time();
          }

          break;

        case TOKENTYPES.and:
          break;

        case TOKENTYPES.also:
          r.and();
          break;

        case TOKENTYPES.except:
          r.except();
          break;

        default:
          error = pos;
      }
    }

    return {
      schedules: r.schedules,
      exceptions: r.exceptions,
      error
    };
  }

  function parseTimePeriod(r) {
    const timePeriod = parseToken([
      TOKENTYPES.second,
      TOKENTYPES.minute,
      TOKENTYPES.hour,
      TOKENTYPES.dayOfYear,
      TOKENTYPES.dayOfWeek,
      TOKENTYPES.dayInstance,
      TOKENTYPES.day,
      TOKENTYPES.month,
      TOKENTYPES.year,
      TOKENTYPES.weekOfMonth,
      TOKENTYPES.weekOfYear
    ]);
    switch (timePeriod.type) {
      case TOKENTYPES.second:
        r.second();
        break;

      case TOKENTYPES.minute:
        r.minute();
        break;

      case TOKENTYPES.hour:
        r.hour();
        break;

      case TOKENTYPES.dayOfYear:
        r.dayOfYear();
        break;

      case TOKENTYPES.dayOfWeek:
        r.dayOfWeek();
        break;

      case TOKENTYPES.dayInstance:
        r.dayOfWeekCount();
        break;

      case TOKENTYPES.day:
        r.dayOfMonth();
        break;

      case TOKENTYPES.weekOfMonth:
        r.weekOfMonth();
        break;

      case TOKENTYPES.weekOfYear:
        r.weekOfYear();
        break;

      case TOKENTYPES.month:
        r.month();
        break;

      case TOKENTYPES.year:
        r.year();
        break;

      default:
        error = pos;
    }

    return timePeriod;
  }

  function checkAndParse(tokenType: RegExp) {
    const found = peek(tokenType).type === tokenType;
    if (found) {
      scan(tokenType);
    }

    return found;
  }

  function parseToken(tokenType: RegExp | RegExp[]) {
    const t = scan(tokenType);
    if (t.type) {
      // @ts-expect-error
      t.text = convertString(t.text, tokenType);
    } else {
      error = pos;
    }

    return t;
  }

  function parseTokenValue(tokenType: RegExp) {
    return parseToken(tokenType).text;
  }

  function convertString(string_: string, tokenType: RegExp): string | number {
    let output: string | number = string_;
    switch (tokenType) {
      case TOKENTYPES.time:
        /*
        const parts = string_.split(/(:|am|pm)/);
        const hour =
          parts[3] === 'pm' && parts[0] < 12
            ? Number.parseInt(parts[0], 10) + 12
            : parts[0];
        const min = parts[2].trim();
        output = (hour.length === 1 ? '0' : '') + hour + ':' + min;
        */
        // <https://github.com/bunkat/later/pull/188>
        const parts = string_.split(/(:|am|pm)/);
        let hour = Number.parseInt(parts[0], 10);
        const min = parts[2].trim();
        if (parts[3] === 'pm' && hour < 12) {
          hour += 12;
        } else if (parts[3] === 'am' && hour === 12) {
          hour -= 12;
        }

        const hourString = String(hour);
        output = (hourString.length === 1 ? '0' : '') + hour + ':' + min;
        break;

      case TOKENTYPES.rank:
        output = Number.parseInt(/^\d+/.exec(string_)![0], 10);
        break;

      case TOKENTYPES.monthName:
      case TOKENTYPES.dayName:
        output = TEXT_NAMES[string_.slice(0, 3)];
        break;
    }

    return output;
  }

  return parseScheduleExpr(string.toLowerCase());
}

export default {
  cron,
  recur,
  text
};
