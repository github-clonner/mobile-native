//@ts-nocheck
import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
} from 'react-native';
import { observer, inject } from 'mobx-react';

import Icon from 'react-native-vector-icons/MaterialIcons';

import Boost from './Boost';

import CenteredLoading from '../common/components/CenteredLoading';
import { CommonStyle } from '../styles/Common';
import { ComponentsStyle } from '../styles/Components';
import BoostTabBar from './BoostTabBar';
import i18n from '../common/services/i18n.service';
import ThemedStyles from '../styles/ThemedStyles';

/**
 * News feed list component
 */
@inject('boost')
@observer
export default class BoostConsoleScreen extends Component {
  static navigationOptions = {
    title: 'Boost Console',
  };

  state = {
    screen: 'gallery',
  };

  /**
   * On component will mount
   */
  componentWillMount() {
    const filter = this.props.route.params.filter;

    if (filter) {
      this.props.boost.setFilter(filter);
    }

    this.props.boost.loadList(this.props.guid);
  }

  createPost() {
    this.props.navigation.navigate('Capture');
  }
  /**
   * Render component
   */
  render() {
    let empty;

    if (this.props.boost.loading) {
      empty = <CenteredLoading />;
    }

    if (this.props.boost.list.loaded && !this.props.boost.list.refreshing) {
      empty = (
        <View style={ComponentsStyle.emptyComponentContainer}>
          <View style={ComponentsStyle.emptyComponent}>
            <Icon name="trending-up" size={72} color="#444" />
            <Text style={ComponentsStyle.emptyComponentMessage}>
              {i18n.t('boosts.youDontHaveBoosts')}
            </Text>
            <Text
              style={ComponentsStyle.emptyComponentLink}
              onPress={() => this.props.navigation.push('Capture')}>
              {i18n.t('createAPost')}
            </Text>
          </View>
        </View>
      );
    }

    const tabs = <BoostTabBar />;
    const theme = ThemedStyles.style;
    return (
      <FlatList
        ListHeaderComponent={tabs}
        ListEmptyComponent={empty}
        data={this.props.boost.list.entities.slice()}
        renderItem={this.renderBoost}
        keyExtractor={(item) => item.rowKey}
        onRefresh={this.refresh}
        refreshing={this.props.boost.list.refreshing}
        onEndReached={this.loadFeed}
        onEndReachedThreshold={0}
        style={[theme.backgroundSecondary, theme.flexContainer]}
      />
    );
  }

  /**
   * Load boosts data
   */
  loadFeed = () => {
    this.props.boost.loadList(this.props.guid);
  };

  /**
   * Refresh feed data
   */
  refresh = () => {
    this.props.boost.refresh(this.props.guid);
  };

  /**
   * Render row
   */
  renderBoost = (row) => {
    const boost = row.item;
    return <Boost boost={boost} navigation={this.props.navigation} />;
  };
}

const styles = StyleSheet.create({
  buttons: {
    alignItems: 'center',
  },
  selectedButton: {
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: 'yellow',
  },
  buttonBar: {
    height: 35,
  },
});
