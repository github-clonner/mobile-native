//@ts-nocheck
import React, { useCallback } from 'react';

import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import ThemedStyles from '../styles/ThemedStyles';
import MoreScreenNew from '../tabs/MoreScreenNew';
import SettingsScreen from './SettingsScreen';
import AccountScreen from './screens/AccountScreen';
import SecurityScreen from './screens/SecurityScreen';
import BillingScreenNew from './screens/BillingScreenNew';
import OtherScreen from './screens/OtherScreen';
import EmailScreen from './screens/EmailScreen';
import PasswordScreenNew from './screens/PasswordScreenNew';
import NotificationsSettingsScreen from '../notifications/NotificationsSettingsScreen';
import BlockedChannelsScreen from './screens/BlockedChannelsScreen';
import DeleteChannelScreenNew from './screens/DeleteChannelScreenNew';
import DeactivateChannelScreen from './screens/DeactivateChannelScreen';
import LanguageScreen from './screens/LanguageScreen';
import TFAScreen from './screens/TFAScreen';
import DevicesScreen from './screens/DevicesScreen';
import PaymentMethods from './screens/BillingScreen';
import RecurringPayments from './screens/RecurringPayments';
import ReportedContentScreen from '../report/ReportedContentScreen';
import i18n from '../common/services/i18n.service';
import NSFWScreen from './screens/NSFWScreen';
import AppInfoScreen from './screens/AppInfoScreen';
import { useLegacyStores } from '../common/hooks/use-stores';

const MenuStackNav = createNativeStackNavigator();

const hideHeader = { headerShown: false };

const MenuStack = function ({ navigation, route }) {
  const { user } = useLegacyStores();
  /**
   * Add tabPress event to navigate to main when user tap in menu tab
   */
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (route.state && route.state.index >= 1) {
        navigation.navigate('Main');
      } else {
        navigation.push('Channel', { guid: user.me.guid });
      }
    });
    return unsubscribe;
  }, [navigation, route, user]);

  return (
    <MenuStackNav.Navigator
      screenOptions={{
        title: '',
        ...ThemedStyles.defaultScreenOptions,
      }}>
      <MenuStackNav.Screen
        name="Main"
        component={MoreScreenNew}
        options={hideHeader}
      />
      <MenuStackNav.Screen
        name="Settings"
        component={SettingsScreen}
        options={hideHeader}
      />
      <MenuStackNav.Screen
        name="Account"
        component={AccountScreen}
        options={{ title: i18n.t('settings.account') }}
      />
      <MenuStackNav.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: i18n.t('settings.security') }}
      />
      <MenuStackNav.Screen
        name="Billing"
        component={BillingScreenNew}
        options={{ title: i18n.t('settings.billing') }}
      />
      <MenuStackNav.Screen
        name="Other"
        component={OtherScreen}
        options={{ title: i18n.t('settings.other') }}
      />
      <MenuStackNav.Screen
        name="SettingsEmail"
        component={EmailScreen}
        options={{ title: i18n.t('settings.accountOptions.1') }}
      />
      <MenuStackNav.Screen
        name="SettingsPassword"
        component={PasswordScreenNew}
        options={{ title: i18n.t('settings.accountOptions.3') }}
      />
      <MenuStackNav.Screen
        name="SettingsNotifications"
        component={NotificationsSettingsScreen}
        options={{ title: i18n.t('settings.pushNotification') }}
      />
      <MenuStackNav.Screen
        name="BlockedChannels"
        component={BlockedChannelsScreen}
        options={{ title: i18n.t('settings.blockedChannels') }}
      />
      <MenuStackNav.Screen
        name="DeleteChannel"
        component={DeleteChannelScreenNew}
      />
      <MenuStackNav.Screen
        name="DeactivateChannel"
        component={DeactivateChannelScreen}
      />
      <MenuStackNav.Screen
        name="LanguageScreen"
        component={LanguageScreen}
        options={{ title: i18n.t('settings.accountOptions.2') }}
      />
      <MenuStackNav.Screen
        name="NSFWScreen"
        component={NSFWScreen}
        options={{ title: i18n.t('settings.accountOptions.5') }}
      />
      <MenuStackNav.Screen
        name="TFAScreen"
        component={TFAScreen}
        options={{ title: i18n.t('settings.TFA') }}
      />
      <MenuStackNav.Screen
        name="DevicesScreen"
        component={DevicesScreen}
        options={{ title: i18n.t('settings.securityOptions.2') }}
      />
      {Platform.OS !== 'ios' && (
        <MenuStackNav.Screen
          name="PaymentMethods"
          component={PaymentMethods}
          options={{ title: i18n.t('settings.billingOptions.1') }}
        />
      )}
      {Platform.OS !== 'ios' && (
        <MenuStackNav.Screen
          name="RecurringPayments"
          component={RecurringPayments}
          options={{ title: i18n.t('settings.billingOptions.2') }}
        />
      )}
      <MenuStackNav.Screen
        name="ReportedContent"
        component={ReportedContentScreen}
        options={{ title: i18n.t('settings.otherOptions.a1') }}
      />
      <MenuStackNav.Screen
        name="AppInfo"
        component={AppInfoScreen}
        options={hideHeader}
      />
    </MenuStackNav.Navigator>
  );
};

export default MenuStack;
