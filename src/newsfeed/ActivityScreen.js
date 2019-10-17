import React, { Component } from 'react';

import {
  View,
  Text
} from 'react-native';
import { observer } from 'mobx-react/native'
import FastImage from 'react-native-fast-image';

import { CommonStyle as CS } from '../styles/Common';
import CommentList from '../comments/CommentList';
import Activity from '../newsfeed/activity/Activity';
import ActivityModel from '../newsfeed/ActivityModel';
import { ComponentsStyle } from '../styles/Components';
import SingleEntityStore from '../common/stores/SingleEntityStore';
import CenteredLoading from '../common/components/CenteredLoading';
import commentsStoreProvider from '../comments/CommentsStoreProvider';
import i18n from '../common/services/i18n.service';
import OffsetFeedListStore from '../common/stores/OffsetFeedListStore';
import { FLAG_VIEW } from '../common/Permissions';

/**
 * Activity screen
 */
export default
@observer
class ActivityScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('entity', {ownerObj:{name:''}}).ownerObj.name
    };
  };

  entityStore = new SingleEntityStore();

  /**
   * Constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.comments = commentsStoreProvider.get();

    this.loadEntity();
  }

  async loadEntity() {
    const params = this.props.navigation.state.params;

    if (params.entity && (params.entity.guid || params.entity.entity_guid)) {

      const urn = 'urn:entity:' + (params.entity.guid || params.entity.entity_guid);

      const entity = ActivityModel.checkOrCreate(params.entity);

      if (!entity.can(FLAG_VIEW, true)) {
        this.props.navigation.goBack();
        return;
      }

      this.entityStore.loadEntity(urn, entity, true);

      // change metadata source
      if (params.entity._list && params.entity._list.metadataService) {
        params.entity._list.metadataService.pushSource('single');
      }
    } else {
      const urn = 'urn:entity:' + params.guid;
      await this.entityStore.loadEntity(urn);

      if (!this.entityStore.entity.can(FLAG_VIEW, true)) {
        this.props.navigation.goBack();
        return;
      }
    }

    if (params.entity && params.entity._list) {
      // this second condition it's for legacy boost feed
      if (params.entity._list instanceof OffsetFeedListStore) {
        params.entity._list.addViewed(params.entity);
      } else {
        params.entity._list.viewed.addViewed(
          params.entity,
          params.entity._list.metadataService
        );
      }
    }
  }

  /**
   * Component will unmount
   */
  componentWillUnmount() {
    const entity = this.entityStore.entity;

    if (entity._list && entity._list.metadataService) {
      entity._list.metadataService.popSource();
    }
  }

  /**
   * Get header
   */
  getHeader() {
    return this.entityStore.entity ?
      <Activity
        ref={o => this.activity = o}
        entity={ this.entityStore.entity }
        navigation={ this.props.navigation }
        autoHeight={false}
      /> : null;
  }

  /**
   * On comment input focus
   */
  onFocus = () => {
    this.activity.pauseVideo();
  }

  /**
   * Render
   */
  render() {
    if (!this.entityStore.entity && !this.entityStore.errorLoading) return <CenteredLoading />;

    if (!this.entityStore.entity.can(FLAG_VIEW, true)) {
      this.props.navigation.goBack();
      return null;
    }

    return (
      <View style={[CS.flexContainer, CS.backgroundWhite]}>
        {
          !this.entityStore.errorLoading ?
            <CommentList
              header={this.getHeader()}
              entity={this.entityStore.entity}
              store={this.comments}
              navigation={this.props.navigation}
              onInputFocus={this.onFocus}
            />
          :
            <View style={CS.flexColumnCentered}>
              <FastImage
                resizeMode={FastImage.resizeMode.contain}
                style={ComponentsStyle.logo}
                source={require('../assets/logos/logo.png')}
              />
              <Text style={[CS.fontL, CS.colorDanger]}>{i18n.t('activity.error')}</Text>
              <Text style={[CS.fontM]}>{i18n.t('activity.tryAgain')}</Text>
            </View>
        }
      </View>
    );
  }
}