//@ts-nocheck
/**
 * Minds mobile app
 * https://www.minds.com
 *
 * @format
 */

import React, { Component } from 'react';
import {
  BackHandler,
  Platform,
  AppState,
  Linking,
  Text,
  Alert,
  Clipboard,
  StatusBar,
  UIManager,
  RefreshControl,
} from 'react-native';
import { Provider, observer } from 'mobx-react';
import RNBootSplash from 'react-native-bootsplash';
import FlashMessage from 'react-native-flash-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';

import NavigationService, {
  setTopLevelNavigator,
} from './src/navigation/NavigationService';
import KeychainModalScreen from './src/keychain/KeychainModalScreen';
// import BlockchainTransactionModalScreen from './src/blockchain/transaction-modal/BlockchainTransactionModalScreen';
import NavigationStack from './src/navigation/NavigationStack';
import { getStores } from './AppStores';
import './AppErrors';
import './src/common/services/socket.service';
import pushService from './src/common/services/push.service';
import mindsService from './src/common/services/minds.service';
import receiveShare from './src/common/services/receive-share.service';
import sessionService from './src/common/services/session.service';
import deeplinkService from './src/common/services/deeplinks-router.service';
import badgeService from './src/common/services/badge.service';
import getMaches from './src/common/helpers/getMatches';
import { GOOGLE_PLAY_STORE } from './src/config/Config';
import updateService from './src/common/services/update.service';
import ErrorBoundary from './src/common/components/ErrorBoundary';
import { CommonStyle as CS } from './src/styles/Common';
import logService from './src/common/services/log.service';
import settingsStore from './src/settings/SettingsStore';
import TosModal from './src/tos/TosModal';
import Notification from './src/notifications/notification/Notification';
import entitiesStorage from './src/common/services/sql/entities.storage';
import feedsStorage from './src/common/services/sql/feeds.storage';
import connectivityService from './src/common/services/connectivity.service';
import sqliteStorageProviderService from './src/common/services/sqlite-storage-provider.service';
import commentStorageService from './src/comments/CommentStorageService';
import apiService from './src/common/services/api.service';
import boostedContentService from './src/common/services/boosted-content.service';
import translationService from './src/common/services/translation.service';
import ThemedStyles from './src/styles/ThemedStyles';
import { StoresProvider } from './src/common/hooks/use-stores';

const stores = getStores();
let deepLinkUrl = '';

// init push service
pushService.init();

// fire sqlite init
sqliteStorageProviderService.get();

// clear old cookies
apiService.clearCookies();

// init settings loading
const mindsSettingsPromise = mindsService.getSettings();

// On app login (runs if the user login or if it is already logged in)
sessionService.onLogin(async () => {
  const user = sessionService.getUser();

  Sentry.configureScope((scope) => {
    scope.setUser({ id: user.guid });
  });

  logService.info('[App] Getting minds settings and onboarding progress');

  // load minds settings and boosted content
  await Promise.all([mindsSettingsPromise, boostedContentService.load()]);

  logService.info('[App] updatting features');

  // register device token into backend on login

  pushService.registerToken();

  logService.info(
    '[App] navigating to initial screen',
    sessionService.initialScreen,
  );

  // hide splash
  RNBootSplash.hide({ duration: 250 });

  NavigationService.navigate('App', { screen: sessionService.initialScreen });

  // check onboarding progress and navigate if necessary
  getStores().onboarding.getProgress(
    sessionService.initialScreen !== 'OnboardingScreenNew',
  );

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
      deeplinkService.navigate('App', { screen: deepLinkUrl });
      deepLinkUrl = '';
    }

    // handle initial notifications (if the app is opened by tap on one)
    pushService.handleInitialNotification();

    // handle shared
    receiveShare.handle();

    // fire offline cache garbage collector 30 seconds after start
    setTimeout(() => {
      if (!connectivityService.isConnected) return;
      entitiesStorage.removeOlderThan(30);
      feedsStorage.removeOlderThan(30);
      commentStorageService.removeOlderThan(30);
    }, 30000);
  } catch (err) {
    logService.exception(err);
  }
});

//on app logout
sessionService.onLogout(() => {
  // clear app badge
  badgeService.setUnreadConversations(0);
  badgeService.setUnreadNotifications(0);
  // clear offline cache
  entitiesStorage.removeAll();
  feedsStorage.removeAll();
  getStores().notifications.clearLocal();
  getStores().groupsBar.clearLocal();
  translationService.purgeLanguagesCache();
});

// disable yellow boxes
console.disableYellowBox = true;

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type State = {
  appState: string;
};

type Props = {};

/**
 * App
 */
@observer
class App extends Component<Props, State> {
  /**
   * State
   */
  state = {
    appState: AppState.currentState || '',
  };

  /**
   * Handle app state changes
   */
  handleAppStateChange = (nextState) => {
    // if the app turns active we check for shared
    if (
      this.state.appState &&
      this.state.appState.match(/inactive|background/) &&
      nextState === 'active'
    ) {
      receiveShare.handle();
    }
    this.setState({ appState: nextState });
  };

  constructor(props) {
    super(props);
    let oldRender = Text.render;
    Text.render = function (...args) {
      let origin = oldRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [
          ThemedStyles.style.colorPrimaryText,
          { fontFamily: 'Roboto' },
          origin.props.style,
        ],
      });
    };

    if (!RefreshControl.defaultProps) {
      RefreshControl.defaultProps = {};
    }
    RefreshControl.defaultProps.tintColor = ThemedStyles.getColor(
      'icon_active',
    );
    RefreshControl.defaultProps.colors = [ThemedStyles.getColor('icon_active')];
  }

  /**
   * On component did mount
   */
  async componentDidMount() {
    this.appInit();
  }

  /**
   * App initialization
   */
  async appInit() {
    try {
      // load app setting before start
      const results = await Promise.all([
        settingsStore.init(),
        Linking.getInitialURL(),
      ]);

      deepLinkUrl = results[1];

      BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
      Linking.addEventListener('url', this.handleOpenURL);
      AppState.addEventListener('change', this.handleAppStateChange);

      if (!this.handlePasswordResetDeepLink()) {
        logService.info('[App] initializing session');

        const token = await sessionService.init();

        if (!token) {
          logService.info('[App] there is no active session');
          RNBootSplash.hide({ duration: 250 });
          // NavigationService.navigate('Auth', { screen: 'Login'});
        } else {
          logService.info('[App] session initialized');
        }
      }
    } catch (err) {
      logService.exception('[App] Error initializing the app', err);
      Alert.alert(
        'Error',
        'There was an error initializing the app.\n Do you want to copy the stack trace.',
        [
          { text: 'Yes', onPress: () => Clipboard.setString(err.stack) },
          { text: 'No' },
        ],
        { cancelable: false },
      );
    }
  }

  /**
   * Handle pre login deep links
   */
  handlePasswordResetDeepLink() {
    try {
      if (
        deepLinkUrl &&
        deeplinkService.cleanUrl(deepLinkUrl).startsWith('forgot-password')
      ) {
        const regex = /;username=(.*);code=(.*)/g;

        const params = getMaches(deepLinkUrl.replace(/%3B/g, ';'), regex);

        //sessionService.logout();
        NavigationService.navigate('Forgot', {
          username: params[1],
          code: params[2],
        });
        deepLinkUrl = '';
        return true;
      }
    } catch (err) {
      logService.exception(
        '[App] Error checking for password reset deep link',
        err,
      );
    }
    return false;
  }

  /**
   * On component will unmount
   */
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    Linking.removeEventListener('url', this.handleOpenURL);
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  /**
   * Handle hardware back button
   */
  onBackPress = () => {
    try {
      NavigationService.goBack();
      return false;
    } catch (err) {
      return true;
    }
  };

  /**
   * Handle deeplink urls
   */
  handleOpenURL = (event) => {
    deepLinkUrl = event.url;
    if (deepLinkUrl) {
      this.handlePasswordResetDeepLink();

      // the var can be cleaned so we check again
      if (deepLinkUrl) {
        setTimeout(() => {
          deeplinkService.navigate(deepLinkUrl);
          deepLinkUrl = '';
        }, 100);
      }
    }
  };

  /**
   * Render
   */
  render() {
    // App not shown until the theme is loaded
    if (ThemedStyles.theme === -1) {
      return null;
    }

    const isLoggedIn = sessionService.userLoggedIn;

    const statusBarStyle =
      ThemedStyles.theme === 0 ? 'dark-content' : 'light-content';

    const app = (
      <SafeAreaProvider>
        <NavigationContainer
          ref={(navigatorRef) => setTopLevelNavigator(navigatorRef)}
          theme={ThemedStyles.navTheme}>
          <StoresProvider>
            <Provider key="app" {...stores}>
              <ErrorBoundary
                message="An error occurred"
                containerStyle={CS.centered}>
                <StatusBar
                  barStyle={statusBarStyle}
                  backgroundColor={ThemedStyles.getColor(
                    'secondary_background',
                  )}
                />
                <NavigationStack
                  key={ThemedStyles.theme}
                  isLoggedIn={isLoggedIn}
                />
                <FlashMessage renderCustomContent={this.renderNotification} />
              </ErrorBoundary>
            </Provider>
          </StoresProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    );

    const keychainModal = (
      <KeychainModalScreen key="keychainModal" keychain={stores.keychain} />
    );

    const blockchainTransactionModal = null;

    const tosModal = <TosModal user={stores.user} key="tosModal" />;

    return [app, keychainModal, blockchainTransactionModal, tosModal];
  }

  renderNotification = (message) => {
    if (!stores.notifications.last) {
      return message.renderCustomContent ? message.renderCustomContent() : null;
    }
    return (
      <Notification
        entity={stores.notifications.last}
        navigation={NavigationService}
      />
    );
  };
}

export default App;
