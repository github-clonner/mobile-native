import React, { Component } from 'react';

import { observer } from 'mobx-react';

import { TouchableOpacity } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';

import { CommonStyle as CS } from '../../../styles/Common';
import Counter from './Counter';
import withPreventDoubleTap from '../../../common/components/PreventDoubleTap';
import { FLAG_CREATE_COMMENT } from '../../../common/Permissions';
import ThemedStyles from '../../../styles/ThemedStyles';
import type ActivityModel from 'src/newsfeed/ActivityModel';
import type BlogModel from 'src/blogs/BlogModel';

// prevent double tap in touchable
const TouchableOpacityCustom = withPreventDoubleTap(TouchableOpacity);

type PropsType = {
  entity: ActivityModel | BlogModel;
  testID?: string;
  size: number;
  navigation: any;
};

/**
 * Comments Action Component
 */
@observer
class CommentsAction extends Component<PropsType> {
  static defaultProps = {
    size: 20,
  };
  /**
   * Render
   */
  render() {
    const icon = this.props.entity.allow_comments
      ? 'chat-bubble'
      : 'speaker-notes-off';

    const canComment =
      this.props.entity.allow_comments &&
      this.props.entity.can(FLAG_CREATE_COMMENT);

    const color = canComment
      ? this.props.entity['comments:count'] > 0
        ? ThemedStyles.style.colorIconActive
        : ThemedStyles.style.colorIcon
      : CS.colorLightGreyed;

    return (
      <TouchableOpacityCustom
        style={[CS.flexContainer, CS.centered, CS.rowJustifyCenter]}
        onPress={this.openComments}
        testID={this.props.testID}>
        <Icon
          style={[color, CS.marginRight]}
          name={icon}
          size={this.props.size}
        />
        <Counter
          size={this.props.size * 0.7}
          count={this.props.entity['comments:count']}
        />
      </TouchableOpacityCustom>
    );
  }

  /**
   * Open comments screen
   */
  openComments = () => {
    const cantOpen =
      !this.props.entity.allow_comments &&
      this.props.entity['comments:count'] == 0;
    // TODO: fix
    const routes = this.props.navigation.dangerouslyGetState().routes;
    if ((routes && routes[routes.length - 1].name == 'Activity') || cantOpen) {
      return;
    }
    this.props.navigation.push('Activity', {
      entity: this.props.entity,
      scrollToBottom: true,
    });
  };
}

export default CommentsAction;
