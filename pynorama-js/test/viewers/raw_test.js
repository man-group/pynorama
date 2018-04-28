import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import RawViewer from '../../src/viewers/raw';

configure({ adapter: new Adapter() });

describe('RawViewer', () => {
  it('should render strings directly', () => {
    const wrapper = shallow(<RawViewer data='Important news article'/>)

    expect(wrapper.type()).toBe('pre');
  });

  it('should JSONify objects', () => {
    const document = {title: 'Oh my',
                      topics: 'world peace'}
    const wrapper = shallow(<RawViewer data={document} />)
    expect(wrapper.text()).toBe('{"title":"Oh my","topics":"world peace"}');
  });
})
