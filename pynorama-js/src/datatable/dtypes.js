export function isNumber(type) {
  return type && (type.name.startsWith("float") || type.name.startsWith("int"));
}

export function isDateTime(type) {
  return type && type.name.startsWith("datetime64");
}

export function npDateTime64ToISO(val) {
  return new Date(val).toISOString();
}
