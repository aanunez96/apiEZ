const intFormatter = (value) => {
  const float = parseFloat(value);
  return float % 1 === 0 ? parseInt(value, 10) : float;
};

const stringFormatter = (value) => value;

const booleanFormatter = (value) => value.toLowerCase() === 'true';

const formatters = {
  Int: intFormatter,
  String: stringFormatter,
  Boolean: booleanFormatter,
};

function formatterFilterValue(value: any, type: string) {
  return formatters[type](value);
}

module.exports = { formatterFilterValue };
