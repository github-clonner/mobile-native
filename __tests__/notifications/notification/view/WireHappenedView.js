import 'react-native';
import React from 'react';
import WireHappenedView from '../../../../src/notifications/notification/view/WireHappenedView';
import styles from '../../../../src/notifications/notification/style';
import sessionService from '../../../../src/common/services/session.service';

// fake data generation
import boostNotificationFactory from '../../../../__mocks__/fake/notifications/BoostNotificationFactory';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
sessionService.guid = 1;

/**
 * For owner and subscribed
 */
it('renders correctly for owner and subscribed', () => {
  const entity = boostNotificationFactory('wire_happened');

  entity.params.subscribed = true;
  entity.params.from_guid = 1;

  const notification = renderer
    .create(<WireHappenedView styles={styles} entity={entity} />)
    .toJSON();

  expect(notification).toMatchSnapshot();
});

/**
 * For owner and not subscribed
 */
it('renders correctly for owner and not subscribed', () => {
  const entity = boostNotificationFactory('wire_happened');

  entity.params.subscribed = false;
  entity.params.from_guid = 1;

  const notification = renderer
    .create(<WireHappenedView styles={styles} entity={entity} />)
    .toJSON();

  expect(notification).toMatchSnapshot();
});

/**
 * For not owner and not subscribed
 */
it('renders correctly for not owner and not subscribed', () => {
  const entity = boostNotificationFactory('wire_happened');

  entity.params.subscribed = false;
  entity.params.from_guid = 2;

  const notification = renderer
    .create(<WireHappenedView styles={styles} entity={entity} />)
    .toJSON();

  expect(notification).toMatchSnapshot();
});

/**
 * For not owner and subscribed
 */
it('renders correctly for owner and subscribed', () => {
  const entity = boostNotificationFactory('wire_happened');

  entity.params.subscribed = true;
  entity.params.from_guid = 2;

  const notification = renderer
    .create(<WireHappenedView styles={styles} entity={entity} />)
    .toJSON();

  expect(notification).toMatchSnapshot();
});
