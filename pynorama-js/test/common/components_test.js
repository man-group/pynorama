import React from 'react';
import { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import {CloseableHeader} from '../../src/common/components';

configure({ adapter: new Adapter() });

describe('CloseableHeader', () => {
  it('should move negative', () => {
    const mockNegative = jest.fn();
    const wrapper = mount(CloseableHeader({children: 'test',
                                           moveButtons: 'horizontal',
                                           onMoveNegative: mockNegative}))
    wrapper.find('Glyphicon').at(0).simulate('click');
    expect(mockNegative).toBeCalled();
  });

  it('should close', () => {
    const mockClose = jest.fn();
    const wrapper = mount(CloseableHeader({children: 'test',
                                           moveButtons: 'horizontal',
                                           onClose: mockClose}))
    wrapper.find('Glyphicon').at(1).simulate('click');
    expect(mockClose).toBeCalled();
  });

  it('should move positive', () => {
    const mockPositive = jest.fn();
    const wrapper = mount(CloseableHeader({children: 'test',
                                           moveButtons: 'horizontal',
                                           onMovePositive: mockPositive}))
    wrapper.find('Glyphicon').at(2).simulate('click');
    expect(mockPositive).toBeCalled();
  });

})