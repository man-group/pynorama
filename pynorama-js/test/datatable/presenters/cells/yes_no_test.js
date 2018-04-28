//import ShallowRenderer from 'react-test-renderer/shallow';
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import YesNoCell from '../../../../src/datatable/presenters/cells/yes_no';

configure({ adapter: new Adapter() });

describe('YesNoCell', () => {
  it('should convert false to no', () => {
    const wrapper = shallow(<YesNoCell column='active' value='false' />)
    expect(wrapper.type()).toBe('div');
    expect(wrapper.text()).toBe('no');
    expect(wrapper.hasClass('cell-stretch')).toBe(true);
  });

  it('should preserve no', () => {
    const wrapper = shallow(<YesNoCell column='active' value='no' />)
    expect(wrapper.text()).toBe('no');
  });

  it('should convert everything non-negative to yes', () => {
    const wrapper = shallow(<YesNoCell column='active' value='Sure Sir' />)
    expect(wrapper.text()).toBe('yes');
  });

})