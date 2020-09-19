export type Key =
  | 'Y'
  | 'M'
  | 'D'
  | 'h'
  | 'm'
  | 's'
  | 'wy'
  | 'wm'
  | 'dy'
  | 'dc'
  | 'dw'
  | 't'
  | 'fd';
export type Modifier = 'a' | 'b';
export type KeyWithModifier =
  | 'Y_a'
  | 'M_a'
  | 'D_a'
  | 'h_a'
  | 'm_a'
  | 's_a'
  | 'Y_b'
  | 'M_b'
  | 'D_b'
  | 'h_b'
  | 'm_b'
  | 's_b'
  | 'wy_a'
  | 'wm_a'
  | 'dy_a'
  | 'dc_a'
  | 'dw_a'
  | 't_a'
  | 't_b'
  | 'wy_b'
  | 'wm_b'
  | 'dy_b'
  | 'dc_b'
  | 'dw_b'
  | 't_b'
  | 'fd_b'
  | 'fd_a';

export interface Recurrence {
  /*
   * Custom Time Periods and Modifiers
   * For acces to custom time periods created as extension to the later static type
   * and modifiers created on the later modifier static type.
   */
  [timeperiodAndModifierName: string]: number[] | undefined;

  /** Time in seconds from midnight. */
  t?: number[];
  /** Seconds in minute. */
  s?: number[];
  /** Minutes in hour. */
  m?: number[];
  /** Hour in day. */
  h?: number[];
  /** Day of the month. */
  D?: number[];
  /** Day in week. */
  dw?: number[];
  /** Nth day of the week in month. */
  dc?: number[];
  /** Day in year. */
  dy?: number[];
  /** Week in month. */
  wm?: number[];
  /** ISO week in year. */
  wy?: number[];
  /** Month in year. */
  M?: number[];
  /** Year. */
  Y?: number[];

  /** After modifiers. */
  t_a?: number[];
  /** After modifiers. */
  s_a?: number[];
  /** After modifiers. */
  m_a?: number[];
  /** After modifiers. */
  h_a?: number[];
  /** After modifiers. */
  D_a?: number[];
  /** After modifiers. */
  dw_a?: number[];
  /** After modifiers. */
  dc_a?: number[];
  /** After modifiers. */
  dy_a?: number[];
  /** After modifiers. */
  wm_a?: number[];
  /** After modifiers. */
  wy_a?: number[];
  /** After modifiers. */
  M_a?: number[];
  /** After modifiers. */
  Y_a?: number[];

  /** Before modifiers. */
  t_b?: number[];
  /** Before modifiers. */
  s_b?: number[];
  /** Before modifiers. */
  m_b?: number[];
  /** Before modifiers. */
  h_b?: number[];
  /** Before modifiers. */
  D_b?: number[];
  /** Before modifiers. */
  dw_b?: number[];
  /** Before modifiers. */
  dc_b?: number[];
  /** Before modifiers. */
  dy_b?: number[];
  /** Before modifiers. */
  wm_b?: number[];
  /** Before modifiers. */
  wy_b?: number[];
  /** Before modifiers. */
  M_b?: number[];
  /** Before modifiers. */
  Y_b?: number[];
}

export interface ScheduleData {
  /**
   * A list of recurrence information as a composite schedule.
   */
  schedules: Recurrence[];

  /**
   * A list of exceptions to the composite recurrence information.
   */
  exceptions: Recurrence[];

  /**
   * A code to identify any errors in the composite schedule and exceptions.
   * The number tells you the position of the error within the schedule.
   */
  error: number;
}

export interface TimePeriod {
  /**
   * The name of the time period information provider.
   */
  name: string;

  /**
   * The rough number of seconds that are covered when moving from one instance of this time period to the next instance.
   */
  range: number;

  /**
   * The value of this time period for the date specified.
   *
   * @param date - The given date.
   */
  val: (date: Date | any) => number;

  /**
   * True if the specified value is valid for the specified date, false otherwise.
   *
   * @param date - The given date.
   * @param value - The value to test for the date.
   */
  isValid: (date: Date, value: any) => boolean;

  /**
   * The minimum and maximum valid values for the time period for the specified date.
   * If the minimum value is not 0, 0 can be specified in schedules to indicate the maximum value.
   * This makes working with non - constant extents(like days in a month) easier.
   *
   * @param [date] - The given date.
   */
  extent: (date?: Date | any) => number[];

  /**
   * The first second in which the value is the same as the value of the specified date.
   *  For example, the start of an hour would be the hour with 0 minutes and 0 seconds.
   *
   * @param date - The given date.
   */
  start: (date: Date | any) => Date;

  /**
   * The last second in which the value is the same as the value of the specified date.
   * For example, the end of an hour would be the hour with 59 minutes and 59 seconds.
   *
   * @param date - The given date.
   */
  end: (date: Date | any) => Date;

  /**
   * Returns the next date where the value is the value specified.
   * Sets the value to 1 if value specified is greater than the max allowed value.
   *
   * @param date - The given date.
   * @param value - The value to test for the date.
   */
  next: (date: Date | any, value: any) => Date | 0;

  /**
   * Returns the previous date where the value is the value specified.
   * Sets the value to the max allowed value if the value specified is greater than the max allowed value.
   *
   * @param date - The given date.
   * @param value - The value to test for the date.
   */
  prev: (date: Date | any, value: any) => Date | 0;
}
