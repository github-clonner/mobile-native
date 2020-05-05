import 'react-native';
import React from 'react';
import { Text, TouchableOpacity } from "react-native";
import { shallow } from 'enzyme';

import LoginForm from '../../src/auth/LoginForm';
import authService from '../../src/auth/AuthService';
import Input from '../../src/common/components/Input';
import Button from '../../src/common/components/Button';

jest.mock('../../src/auth/AuthService');

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

describe('LoginForm component', () => {
  beforeEach(() => {
    authService.login.mockClear();
  });

  it('should renders correctly', () => {
    const loginForm = renderer.create(
      <LoginForm />
    ).toJSON();
    expect(loginForm).toMatchSnapshot();
  });

  it('should calls onLogin when user login', async () => {

    authService.login.mockResolvedValue();

    const mockFn = jest.fn();

    const wrapper = shallow(
      <LoginForm onLogin={mockFn}/>
    );

    // simulate user input
    const render = wrapper.dive();
    render.find(Input).forEach(child => {
      child.simulate('changeText', 'data');
    });

    // press login
    await render.find(Button).at(0).simulate('press');

    // check state
    expect(wrapper.state().password).toEqual('data');
    expect(wrapper.state().username).toEqual('data');

    // expect auth service login to be called once
    expect(authService.login).toBeCalled();
    // expect onLogin to be called once
    expect(mockFn).toBeCalled();
  });
});
