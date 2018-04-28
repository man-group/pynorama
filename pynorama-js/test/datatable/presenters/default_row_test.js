import React from 'react';
import { configure, shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import DefaultRow from '../../../src/datatable/presenters/default_row';

configure({ adapter: new Adapter() });

describe('DefaultRow', () => {
  it('should have clickable cursor and hover highlight', () => {
    const options = { className: 'classy',
                      hoverHighlight: true,
                      clickableCursor: true}
    const wrapper = shallow(DefaultRow({children: 'child', options: options, row: 'row'}))
    expect(wrapper.type()).toBe('tr');
    expect(wrapper.text()).toBe('child');
    expect(wrapper.hasClass('classy')).toBe(true);
    expect(wrapper.hasClass('datatable-hover-highlight')).toBe(true);
    expect(wrapper.hasClass('datatable-clickable-cursor')).toBe(true);
  });

  it('should respond to click', () => {
    const mockClick = jest.fn();
    const wrapper = mount(<table>
                            <tbody>{DefaultRow({options: { onClick: mockClick}, row: 'row'})}</tbody>
                          </table>)

    wrapper.find('tr').simulate('click');
    expect(mockClick).toBeCalled();
  });
})