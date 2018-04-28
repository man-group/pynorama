import { isNumber, isDateTime } from '../../src/datatable/dtypes';

describe('dtypes isNumber', () => {
  it('should recognise ints', () => {
    const result = isNumber({ name: 'int64', str: '<i8' })
    expect(result).toBe(true);
  });

  it('should recognise floats', () => {
    const result = isNumber({ name: 'float32', str: '<f8' })
    expect(result).toBe(true);
  });

  it('should return false otherwise', () => {
    const result = isNumber({ name: 'object', str: '|O8' })
    expect(result).toBe(false);
  });
})

describe('dtypes isDateTime', () => {
  it('should recognise datetimes', () => {
    const result = isDateTime({ name: 'datetime64[ns]', str: '<M8[ns]' })
    expect(result).toBe(true);
  });

  it('should return false otherwise', () => {
    const result = isDateTime({ name: 'int64', str: '<i8' })
    expect(result).toBe(false);
  });
})
