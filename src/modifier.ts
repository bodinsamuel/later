function after(constraint, values: [number] | [number, number]) {
  const value = values[0];
  return {
    name: `after ${constraint.name}`,
    range: (constraint.extent(new Date())[1] - value) * constraint.range,
    val: constraint.val,
    isValid(d) {
      return this.val(d) >= value;
    },
    extent: constraint.extent,
    start: constraint.start,
    end: constraint.end,
    next(startDate, value_) {
      if (value_ !== value) value_ = constraint.extent(startDate)[0];
      return constraint.next(startDate, value_);
    },
    prev(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[1] : value - 1;
      return constraint.prev(startDate, value_);
    }
  };
}

function before(constraint, values: [number] | [number, number]) {
  const value = values[values.length - 1];
  return {
    name: `before ${constraint.name}`,
    range: constraint.range * (value - 1),
    val: constraint.val,
    isValid(d) {
      return this.val(d) < value;
    },
    extent: constraint.extent,
    start: constraint.start,
    end: constraint.end,
    next(startDate, value_) {
      value_ = value_ === value ? constraint.extent(startDate)[0] : value;
      return constraint.next(startDate, value_);
    },
    prev(startDate, value_) {
      value_ = value_ === value ? value - 1 : constraint.extent(startDate)[1];
      return constraint.prev(startDate, value_);
    }
  };
}

const modifier = {
  after,
  a: after,
  before,
  b: before
};

export default modifier;
