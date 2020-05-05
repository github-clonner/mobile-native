import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import ChannelActions from '../../src/channel/ChannelActions';
import UserModel from '../../src/channel/UserModel';
import userFaker from '../../__mocks__/fake/channel/UserFactory';
import ChannelStore from '../../src/channel/ChannelStore';
import features from '../../src/common/services/features.service';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { getStores } from '../../AppStores';

jest.mock('../../src/channel/ChannelStore');
jest.mock('../../src/common/services/features.service');
jest.mock('../../AppStores');
jest.mock('../../src/common/services/boosted-content.service');

getStores.mockReturnValue({
  user: {
    me: {},
    load: jest.fn(),
    setUser: jest.fn(),
  },
});

/**
 * Tests
 */
describe('channel actions component', () => {
  let store;

  beforeEach(() => {
    store = new ChannelStore();
    store.channel = new UserModel(userFaker(1));
    store.channel.toggleSubscription = jest.fn();
    store.channel.toggleBlock = jest.fn();
  });

  it('should renders correctly', () => {
    // return true to has crypto
    features.has.mockReturnValue(true);

    const component = renderer
      .create(<ChannelActions store={store} />)
      .toJSON();

    expect(component).toMatchSnapshot();
  });

  it('should show the correct options', () => {
    const wrapper = shallow(<ChannelActions store={store} />);

    let opt = wrapper.instance().getOptions();

    expect(opt).toEqual(['Cancel', 'Block', 'Report']);

    // if subscribed
    store.channel.subscribed = true;
    opt = wrapper.instance().getOptions();

    expect(opt).toEqual(['Cancel', 'Unsubscribe', 'Block', 'Report']);

    // if blocked
    store.channel.blocked = true;
    opt = wrapper.instance().getOptions();
    expect(opt).toEqual(['Cancel', 'Unsubscribe', 'Un-Block', 'Report']);
  });

  it('should show run the correct option', () => {
    const navigation = { push: jest.fn() };
    const wrapper = shallow(
      <ChannelActions store={store} navigation={navigation} />,
    );

    store.channel.subscribed = true;
    store.channel.blocked = true;

    opt = wrapper.instance().executeAction(1);
    expect(store.channel.toggleSubscription).toBeCalled();

    opt = wrapper.instance().executeAction(2);
    expect(store.channel.toggleBlock).toBeCalled();

    opt = wrapper.instance().executeAction(3);
    expect(navigation.push).toBeCalled();
  });
});
