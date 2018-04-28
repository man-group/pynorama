import React from 'react';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { AttributePresenter, TagFrontPresenter } from '../../src/viewers/xml';

configure({ adapter: new Adapter() });

describe('AttributePresenter', () => {
  it('should render attribute', () => {
    const att = document.createAttribute("pydata");
    att.value = "london";

    const wrapper = mount(<AttributePresenter node={att}/>)

    expect(wrapper.find('.attributeName').text().toLowerCase()).toBe('pydata');
    expect(wrapper.find('.attributeValue').text().toLowerCase()).toBe('"london"');
  });
})

describe('TagFrontPresenter', () => {
  it('should render many attributes', () => {
    const node = document.createElement("span");
    node.setAttribute("pydata","london");
    node.setAttribute("man","AHL");

    const wrapper = mount(<TagFrontPresenter node={node}/>)
//    expect(wrapper.find('AttributePresenter').children()).to.have.length(2);

    expect(wrapper.find('AttributePresenter').at(0).text()).toEqual('pydata="london"')
    expect(wrapper.find('AttributePresenter').at(1).text()).toEqual('man="AHL"')

  });
})
