const floatFormatter = (value) => parseFloat(value);

const intFormatter = (value) => parseInt(value, 10);

const stringFormatter = (value) => value;

const booleanFormatter = (value) => value.toLowerCase() === 'true';

const dateFormatter = (value) => new Date(value);

const formatters = {
  Float: floatFormatter,
  Decimal: floatFormatter,
  Int: intFormatter,
  BigInt: intFormatter,
  String: stringFormatter,
  Boolean: booleanFormatter,
  DateTime: dateFormatter,
};

function formatterQueryValue(value: any, type: string) {
  return formatters[type](value);
}

module.exports = { formatterQueryValue };
