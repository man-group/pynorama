//import ShallowRenderer from 'react-test-renderer/shallow';
import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import BooleanCell from '../../../../src/datatable/presenters/cells/boolean_cell';

configure({ adapter: new Adapter() });

describe('BooleanCell', () => {
  it('should convert no to False', () => {
    const wrapper = shallow(<BooleanCell column='active' value='no' />)
    expect(wrapper.type()).toBe('div');
    expect(wrapper.text()).toBe('False');
    expect(wrapper.hasClass('cell-stretch')).toBe(true);
  });

  it('should render boolean false as False', () => {
    const wrapper = shallow(<BooleanCell column='active' value={ false } />)
    expect(wrapper.text()).toBe('False');
  });

  it('should convert everything non-negative to True', () => {
    const wrapper = shallow(<BooleanCell column='active' value='Sure Sir' />)
    expect(wrapper.text()).toBe('True');
  });

})