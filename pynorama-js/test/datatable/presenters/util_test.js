import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { ColumnSelectFormGroup } from '../../../src/datatable/presenters/util';

configure({ adapter: new Adapter() });

describe('ColumnSelectFormGroup', () => {
  it('should render with the right options', () => {
    const dtypes = { a: { name: 'float32', str: '<f8' } };
    const params = { selected: true, dtypes: dtypes, name: 'fancy_index', index: true };

    const wrapper = shallow(ColumnSelectFormGroup(params))

    expect(wrapper.type()).toBe('div');
    expect(wrapper.hasClass('transforms-space-below')).toBe(true);

    const selectProps = wrapper.find('Select').props();
    expect(selectProps.name).toBe('fancy_index');

    const expectedOptions =[{value: 'a', label: 'a' },
                            {value: 'index', label: 'index' }]
    expect(selectProps.options).toEqual(expectedOptions);
  });

})