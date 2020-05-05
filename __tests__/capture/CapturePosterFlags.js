import 'react-native';
import React from 'react';
import { shallow } from 'enzyme';
import { configure } from 'mobx';
import CaptureStore from  '../../src/capture/CaptureStore';
import CapturePosterFlags from '../../src/capture/CapturePosterFlags';
import HashtagStore from '../../src/common/stores/HashtagStore';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { Platform } from 'react-native';

jest.mock('../../src/common/stores/HashtagStore');
jest.mock('../../src/capture/CaptureStore');
jest.mock('../../src/common/components/LicensePicker', () => 'LicensePicker');
jest.mock('../../src/newsfeed/topbar/TagsSubBar', () => 'TagsSubBar');
jest.mock('../../src/common/components/nsfw/NsfwToggle', () => 'NsfwToggle');


Date = class extends Date {
  constructor(date) {
    if (date) {
        return super(date);
    }

    return new Date('2018-09-20T23:00:00Z');
  }
}


defaultState = {
  mature: false,
  share: false,
  lock: false
}

Platform.OS = 'android';

configure({enforceActions: 'never'});

/**
 * Test render with  value
 */
const testRenderWithValue = (value) => {
  fn = () => null;

  const store = new CaptureStore();
  const hashtagStore = new HashtagStore();
  store.loadSuggestedTags.mockResolvedValue();

  state = {
    mature: value,
    share: value,
    lock: value
  }

  const preview = renderer.create(
    <CapturePosterFlags
        capture={store}
        hashtag={hashtagStore}
        matureValue={state.mature}
        shareValue={state.share}
        lockValue={state.lock}
        onMature={fn}
        onShare={fn}
        onLocking={fn}
        onScheduled={fn}
      />
  ).toJSON();
  expect(preview).toMatchSnapshot();
}


/**
 * Tests
 */
describe('cature poster flags component', () => {

  it('should renders correctly for props false', () => {
    testRenderWithValue(false)
  });

  it('should renders correctly for props true', () => {
    testRenderWithValue(true)
  });


  it('should load third party social networks status on will mount', () => {

    const store = new CaptureStore();
    const hashtagStore = new HashtagStore();
    store.loadSuggestedTags.mockResolvedValue();
    store.loadThirdPartySocialNetworkStatus.mockClear();


    const wrapper = shallow(
      <CapturePosterFlags.wrappedComponent
        capture={store}
        hashtag={hashtagStore}
        matureValue={defaultState.mature}
        shareValue={defaultState.share}
        lockValue={defaultState.lock}
        onMature={fn}
        onShare={fn}
        onLocking={fn}
      />
    );


    // expect(store.loadThirdPartySocialNetworkStatus).toHaveBeenCalled();
  });

  it('should show license picker if it has an attachment', () => {

    const store = new CaptureStore();
    const hashtagStore = new HashtagStore();
    store.loadSuggestedTags.mockResolvedValue();

    let capturePosterFlag = renderer.create(
      <CapturePosterFlags
        capture={store}
        hashtag={hashtagStore}
        matureValue={defaultState.mature}
        shareValue={defaultState.share}
        lockValue={defaultState.lock}
        onMature={fn}
        onShare={fn}
        onLocking={fn}
      />
    );
    let picker;
    // find License picker
    picker = capturePosterFlag.root.findAllByType('LicensePicker');

    // check there is no license picker
    expect(picker.length).toEqual(0);

    store.attachment.hasAttachment = true;

    capturePosterFlag = renderer.create(
      <CapturePosterFlags
        capture={store}
        hashtag={hashtagStore}
        matureValue={defaultState.mature}
        shareValue={defaultState.share}
        lockValue={defaultState.lock}
        onMature={fn}
        onShare={fn}
        onLocking={fn}
      />
    );

    picker = capturePosterFlag.root.findAllByType('LicensePicker');

    // check there is 1 license picker
    expect(picker.length).toEqual(1);
  });

});
