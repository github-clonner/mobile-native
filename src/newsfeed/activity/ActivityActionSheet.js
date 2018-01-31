import React, {
  Component
} from 'react';

import {
  Text,
  Image,
  View,
  ActivityIndicator,
  Button,
  StyleSheet,
  Modal,

} from 'react-native';

import {
  observer,
  inject
} from 'mobx-react/native'

import shareService from '../../share/ShareService';
import { toggleUserBlock } from '../NewsfeedService';
import Icon from 'react-native-vector-icons/Ionicons';
import ActionSheet from 'react-native-actionsheet';
import { MINDS_URI } from '../../config/Config';
/**
 * Activity Actions
 */
const title = 'Actions';

@inject("user")
@inject("newsfeed")
export default class ActivityActions extends Component {

  constructor(props) {
    super(props)
    this.state = {
      selected: '',
      reportModalVisible: false,
      userBlocked: false,
      options: this.getOptions(),
    }

    this.handleSelection = this.handleSelection.bind(this);
  }

  showActionSheet() {
    this.state = {
      options: this.getOptions(),
    }
    this.ActionSheet.show();
  }

  handleSelection(i) {
    this.makeAction(this.state.options[i]);
  }

  getOptions() {
    let options = [ 'Cancel' ];
    if (this.props.user.me.guid == this.props.entity.ownerObj.guid) {
      options.push( 'Edit' );

      options.push( 'Delete' );

      if (this.props.entity.comments_disabled) {
        options.push( 'Enable Comments' );
      } else {
        options.push( 'Disable Comments' );
      }

      if (!this.props.entity.mature) {
        options.push( 'Set explicit' );
      } else {
        options.push( 'Remove explicit' );
      }

    } else {

      if (this.props.user.isAdmin()) {
        options.push( 'Delete' );

        if (!this.props.entity.mature) {
          options.push( 'Set explicit' );
        } else {
          options.push( 'Remove explicit' );
        }
      }

      if (!this.props.entity.ownerObj.subscribed) {
        options.push( 'Subscribe' );
      } else {
        options.push( 'Unsubscribe' );
      }

      if (this.state && this.state.userBlocked) {
        options.push( 'Unblock user' );
      } else {
        options.push( 'Block user' );
      }

      options.push( 'Report' );
    }

    if(this.props.user && this.props.user.isAdmin()){
      if (!this.props.entity.featured) {
        options.push( 'Feature' );
      } else {
        options.push( 'Un-feature' );
      }
  

      if (!this.props.entity.monetized) {
        options.push( 'Monetize' );
      } else {
        options.push( 'Un-monetize' );
      }
  
    }

    options.push( 'Share' );
    options.push( 'Translate' );


    if (!this.props.entity['is:muted']) {
      options.push( 'Mute notifications' );
    } else {
      options.push( 'Unmute notifications' );
    }


    return options;

  }

  makeAction(option) {
    switch (option) {
      case 'Edit':
        this.props.toggleEdit(true);
        break;
      case 'Delete':
        this.props.newsfeed.list.deleteEntity(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Set explicit':
        this.props.newsfeed.list.newsfeedToggleExplicit(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Remove explicit':
        this.props.newsfeed.list.newsfeedToggleExplicit(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Block user':
        toggleUserBlock(this.props.entity.ownerObj.guid, !this.state.userBlocked).then( (result) => {
          this.setState({
            userBlocked:true,
            options: this.getOptions(),
          });
        });
        break;
      case 'Unblock user':
        toggleUserBlock(this.props.entity.ownerObj.guid, !this.state.userBlocked).then( (result) => {
          this.setState({
            userBlocked:false,
            options: this.getOptions(),
          });
        });
        break;
      case 'Mute notifications':
        this.props.newsfeed.list.newsfeedToggleMute(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Unmute notifications':
        this.props.newsfeed.list.newsfeedToggleMute(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Feature':
        this.props.newsfeed.list.toggleCommentsAction(this.props.entity.guid, 'not-selected').then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Un-feature':
        this.props.newsfeed.list.toggleCommentsAction(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
        case 'Monetize':
        this.props.newsfeed.list.toggleMonetization(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Un-monetize':
        this.props.newsfeed.list.toggleMonetization(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Share':
        shareService.share(this.props.entity.message, MINDS_URI + 'newsfeed/' + this.props.entity.guid);
        break;
      case 'Translate':
        break;
      case 'Report':
        this.props.navigation.navigate('Report', { entity: this.props.entity });
        break;
      case 'Enable Comments':
        this.props.newsfeed.list.toggleCommentsAction(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Disable Comments':
        this.props.newsfeed.list.toggleCommentsAction(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Subscribe':
        this.props.newsfeed.list.newsfeedToggleSubscription(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
      case 'Unsubscribe':
        this.props.newsfeed.list.newsfeedToggleSubscription(this.props.entity.guid).then( (result) => {
          this.setState({
            options: this.getOptions(),
          });
        });
        break;
    }


  }

  /**
   * Close report modal
   */
  closeReport = () => {
    this.setState({ reportModalVisible: false });
  }

  /**
   * Render Header
   */
  render() {


    return (
      <View style={styles.wrapper}>
        <Icon 
          name="ios-arrow-down"
          onPress={() => this.showActionSheet()} 
          size={32} 
          style={styles.icon}
          />
        <ActionSheet
          ref={o => this.ActionSheet = o}
          title={title}
          options={this.state.options}
          onPress={this.handleSelection}
          cancelButtonIndex={0}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  wrapper: {
    flex:1,
    alignSelf: 'center'
  },
  icon: {
    color: '#ddd',
  },
  iconclose: {
    flex:1,
  },
  modal: {
    flex: 1,
    paddingTop: 4,
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: '#ede3f2',
  },
  modalHeader: {
    padding: 5
  }
});