/**
 * Minds mobile app
 * https://www.minds.com
 *
 * @format
 * @flow
 */
import './global';
import './shim'
import crypto from "crypto"; // DO NOT REMOVE!
import codePush from "react-native-code-push"; // For auto updates

import React, {
  Component
} from 'react';

import {
  Observer,
  Provider,
} from 'mobx-react/native'  // import from mobx-react/native instead of mobx-react fix test

import NavigationService from './src/navigation/NavigationService';

import {
  BackHandler,
  Platform,
  AppState,
  Linking,
  Text,
  Alert,
  Clipboard,
} from 'react-native';

import FlashMessage from "react-native-flash-message";
import CookieManager from 'react-native-cookies';

import KeychainModalScreen from './src/keychain/KeychainModalScreen';
import BlockchainTransactionModalScreen from './src/blockchain/transaction-modal/BlockchainTransactionModalScreen';
import NavigationStack from './src/navigation/NavigationStack';
import stores from './AppStores';
import './AppErrors';
import './src/common/services/socket.service';
import pushService from './src/common/services/push.service';
import mindsService from './src/common/services/minds.service';
import featureService from './src/common/services/features.service';
import receiveShare from './src/common/services/receive-share.service';
import sessionService from './src/common/services/session.service';
import deeplinkService from './src/common/services/deeplinks-router.service';
import badgeService from './src/common/services/badge.service';
import authService from './src/auth/AuthService';
import NotificationsService from "./src/notifications/NotificationsService";
import getMaches from './src/common/helpers/getMatches';
import {CODE_PUSH_TOKEN, GOOGLE_PLAY_STORE} from './src/config/Config';
import updateService from './src/common/services/update.service';
import ErrorBoundary from './src/common/components/ErrorBoundary';
import { CommonStyle as CS } from './src/styles/Common';
import logService from './src/common/services/log.service';
import settingsStore from './src/settings/SettingsStore';
import Notification from './src/notifications/notification/Notification';

let deepLinkUrl = '';

// init push service
pushService.init();

CookieManager.clearAll();

// On app login (runs if the user login or if it is already logged in)
sessionService.onLogin(async () => {

  logService.info('[App] Getting minds settings');
  // load minds settings on login
  await mindsService.getSettings();

  logService.info('[App] updatting features');
  // reload fatures on login
  await featureService.updateFeatures();

  // register device token into backend on login
  try {
    pushService.registerToken();
  } catch (err) {
    logService.exception('[App] Error registering the push notification token', err);
  }

  // load nsfw from storage
  logService.info('[App] loading nsfw settings');
  await stores.discovery.filters.init();

  // get onboarding progress
  logService.info('[App] getting onboarding progress');
  const onboarding = await stores.onboarding.getProgress();

  if (onboarding && onboarding.show_onboarding) {
    sessionService.setInitialScreen('OnboardingScreen');
  }

  logService.info('[App] navigating to initial screen', sessionService.initialScreen);
  NavigationService.reset(sessionService.initialScreen);

  // check update
  if (Platform.OS !== 'ios' && !GOOGLE_PLAY_STORE) {
    setTimeout(async () => {
      const user = sessionService.getUser();
      updateService.checkUpdate(!user.canary);
    }, 5000);
  }

  try {
    // handle deep link (if the app is opened by one)
    if (deepLinkUrl) {
      deeplinkService.navigate(deepLinkUrl);
      deepLinkUrl = '';
    }

    // handle initial notifications (if the app is opened by tap on one)
    pushService.handleInitialNotification();

    // handle shared
    receiveShare.handle();
  } catch (err) {
    logService.exception(err);
  }
});

//on app logout
sessionService.onLogout(() => {
  // clear app badge
  badgeService.setUnreadConversations(0);
  badgeService.setUnreadNotifications(0);

  // clear minds settings
  mindsService.clear();
});

// disable yellow boxes
console.disableYellowBox = true;

type State = {
  appState: string
}

type Props = {

}

/**
 * App
 */
@codePush
export default class App extends Component<Props, State> {

  state = {
    appState: AppState.currentState || ''
  }

  /**
   * Handle app state changes
   */
  handleAppStateChange = (nextState) => {
    // if the app turns active we check for shared
    if (this.state.appState && this.state.appState.match(/inactive|background/) && nextState === 'active') {
      receiveShare.handle();
    }
    this.setState({appState: nextState})
  }

  /**
   * On component will mount
   */
  componentWillMount() {
    if (!Text.defaultProps) Text.defaultProps = {};
    Text.defaultProps.style = {
      fontFamily: 'Roboto',
      color: '#444',
    };
  }

  /**
   * On component did mount
   */
  async componentDidMount() {
    try {
      // load app setting before start
      await settingsStore.init();

      deepLinkUrl = await Linking.getInitialURL();

      BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
      Linking.addEventListener('url', this.handleOpenURL);
      AppState.addEventListener('change', this.handleAppStateChange);

      if (!this.handlePasswordResetDeepLink()) {
        logService.info('[App] initializing session');
        const token = await sessionService.init();

        if (!token) {
          logService.info('[App] there is no active session');
          NavigationService.reset('Login');
        } else {
          logService.info('[App] session initialized');
        }
      }

      await this.checkForUpdates();
    } catch(err) {
      logService.exception('[App] Error initializing the app', err);
      Alert.alert(
        'Error',
        'There was an error initializing the app.\n Do you want to copy the stack trace.',
        [{ text: 'Yes', onPress: () => Clipboard.setString(err.stack)}, { text: 'No'}],
        { cancelable: false }
      );
    }
  }

  /**
   * Handle pre login deep links
   */
  handlePasswordResetDeepLink() {
    try {
      if (deepLinkUrl && deeplinkService.cleanUrl(deepLinkUrl).startsWith('forgot-password')) {
        const regex = /;username=(.*);code=(.*)/g;

        const params = getMaches(deepLinkUrl.replace(/%3B/g, ';'), regex);

        //sessionService.logout();
        NavigationService.navigate('Forgot', {username: params[1], code: params[2]});
        deepLinkUrl = '';
        return true;
      }
    } catch(err) {
      logService.exception('[App] Error checking for password reset deep link', err);
    }
    return false;
  }

  /**
   * On component will unmount
   */
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
    Linking.removeEventListener('url', this.handleOpenURL);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  /**
   * Handle hardware back button
   */
  onBackPress = () => {
    const nav = NavigationService.getState();
    NavigationService.goBack();
    return nav !== NavigationService.getState();
  };

  /**
   * Handle deeplink urls
   */
  handleOpenURL = (event) => {
    deepLinkUrl = event.url;
    if (deepLinkUrl) this.handlePasswordResetDeepLink();
    if (deepLinkUrl) {
      setTimeout(() => {
        deeplinkService.navigate(deepLinkUrl);
        deepLinkUrl = '';
      }, 100);
    }
  }

  async checkForUpdates() {
    try {
      const params = {
        updateDialog: Platform.OS !== 'ios',
        installMode:  codePush.InstallMode.ON_APP_RESUME,
      };

      if (CODE_PUSH_TOKEN) params.deploymentKey = CODE_PUSH_TOKEN;

      let response = await codePush.sync(params);
    } catch (err) {
      logService.exception('[App] Error checking for code push updated', err);
    }
  }

  /**
   * Render
   */
  render() {
    const app = (
      <Provider key="app" {...stores}>
        <ErrorBoundary message="An error occurred" containerStyle={CS.centered}>
          <NavigationStack
            ref={navigatorRef => {
              NavigationService.setTopLevelNavigator(navigatorRef);
            }}
          />
          <FlashMessage renderCustomContent={() => <Notification entity={stores.notifications.last} navigation={NavigationService} />} />
        </ErrorBoundary>
      </Provider>
    );

    const keychainModal = (
      <KeychainModalScreen key="keychainModal" keychain={ stores.keychain } />
    );

    const blockchainTransactionModal = (
      <BlockchainTransactionModalScreen key="blockchainTransactionModal" blockchainTransaction={ stores.blockchainTransaction } />
    );

    return [ app, keychainModal, blockchainTransactionModal ];
  }
}
