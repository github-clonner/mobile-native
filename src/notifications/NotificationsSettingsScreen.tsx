//@ts-nocheck
import React, { Component } from 'react';

import { StyleSheet, Text, ScrollView, View } from 'react-native';

import { observer, inject } from 'mobx-react';

import Switch from 'react-native-switch-pro';
import i18n from '../common/services/i18n.service';
import ThemedStyles from '../styles/ThemedStyles';

@inject('notificationsSettings')
@observer
export default class NotificationsSettingsScreen extends Component {
  static navigationOptions = {
    title: 'Notifications',
  };

  /**
   * On component will mount
   */
  componentWillMount() {
    this.props.notificationsSettings.load();
  }

  /**
   * Render
   */
  render() {
    const CS = ThemedStyles.style;
    const settings = this.props.notificationsSettings.settings;
    const notificationsSettings = this.props.notificationsSettings;

    return (
      <ScrollView style={styles.container}>
        <Text style={[styles.title, CS.backgroundTertiary]}>
          {i18n.t('notificationSettings.enableDisable')}
        </Text>
        {Object.keys(settings).map(function (key) {
          const toggle = settings[key];
          return (
            <View
              style={[styles.row, CS.borderPrimary, CS.borderBottomHair]}
              key={key}>
              <Text>{i18n.t('notificationSettings.' + key)}</Text>
              <Switch
                value={toggle}
                onSyncPress={(val) =>
                  notificationsSettings.saveSetting(key, val)
                }></Switch>
            </View>
          );
        })}
      </ScrollView>
    );
  }
}

// style
const styles = StyleSheet.create({
  title: {
    height: 40,
    fontSize: 14,
    padding: 10,
  },
  row: {
    padding: 10,
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  container: {
    flex: 1,
  },
});
