//@ts-nocheck
import React, { Component } from 'react';

import { observer } from 'mobx-react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  Clipboard,
  ViewStyle,
} from 'react-native';

import ExplicitImage from './explicit/ExplicitImage';
import AutoHeightFastImage from './AutoHeightFastImage';
import domain from '../helpers/domain';
import MindsVideo from '../../media/MindsVideo';
import mediaProxyUrl from '../helpers/media-proxy-url';
import download from '../services/download.service';

import openUrlService from '../services/open-url.service';
import logService from '../services/log.service';
import testID from '../helpers/testID';
import i18n from '../services/i18n.service';
import { showMessage } from 'react-native-flash-message';
import Colors from '../../styles/Colors';
import type ActivityModel from 'src/newsfeed/ActivityModel';

type PropsType = {
  entity: ActivityModel;
  navigation: any;
  style: ViewStyle | Array<ViewStyle>;
  autoHeight?: boolean;
};
/**
 * Activity
 */
@observer
export default class MediaView extends Component<PropsType> {
  _currentThumbnail = 0;
  videoPlayer: MindsVideo | null = null;

  static defaultProps = {
    width: Dimensions.get('window').width,
  };

  state = {
    imageLoadFailed: false,
  };

  /**
   * Show activity media
   */
  showMedia() {
    let source;
    let title =
      this.props.entity.title && this.props.entity.title.length > 200
        ? this.props.entity.title.substring(0, 200) + '...'
        : this.props.entity.title;
    const type = this.props.entity.custom_type || this.props.entity.subtype;
    switch (type) {
      case 'image':
      case 'batch':
        source = this.props.entity.getThumbSource('xlarge');
        return this.getImage(source);
      case 'video':
        return this.getVideo();
    }

    if (this.props.entity.perma_url) {
      source = {
        uri: mediaProxyUrl(this.props.entity.thumbnail_src),
      };

      return (
        <View style={styles.richMediaContainer}>
          {source.uri ? this.getImage(source) : null}
          <TouchableOpacity style={styles.richMedia} onPress={this.openLink}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.domain}>
              {domain(this.props.entity.perma_url)}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }

  getVideo() {
    let guid;
    if (this.props.entity.custom_data) {
      guid = this.props.entity.custom_data.guid;
    } else if (this.props.entity.cinemr_guid) {
      guid = this.props.entity.cinemr_guid;
    } else {
      guid = this.props.entity.guid;
    }

    return (
      <View style={styles.videoContainer}>
        <MindsVideo
          entity={this.props.entity}
          ref={(o) => {
            this.videoPlayer = o;
          }}
        />
      </View>
    );
  }

  /**
   * Prompt user to download
   */
  download = () => {
    Alert.alert(
      i18n.t('downloadGallery'),
      i18n.t('wantToDownloadImage'),
      [
        { text: i18n.t('no'), style: 'cancel' },
        { text: i18n.t('yes'), onPress: () => this.runDownload() },
      ],
      { cancelable: false },
    );
  };

  /**
   * Download the media to the gallery
   */
  runDownload = async () => {
    try {
      const result = await download.downloadToGallery(
        this.source.uri,
        this.props.entity,
      );
      Alert.alert(i18n.t('success'), i18n.t('imageAdded'));
    } catch (e) {
      Alert.alert(i18n.t('errorDownloading'));
      logService.exception('[MediaView] runDownload', e);
    }
  };

  /**
   * Pause video if exist
   */
  pauseVideo() {
    this.videoPlayer && this.videoPlayer && this.videoPlayer.pause();
  }

  imageError = (err) => {
    logService.error('[MediaView] Image error: ' + this.source.uri);
    this.setState({ imageLoadFailed: true });
  };

  imageLongPress = () => {
    if (this.props.entity.perma_url) {
      setTimeout(async () => {
        await Clipboard.setString(this.props.entity.perma_url);
        showMessage({
          floating: true,
          position: 'top',
          message: i18n.t('linkCopied'),
          duration: 1300,
          backgroundColor: '#FFDD63DD',
          color: Colors.dark,
          type: 'info',
        });
      }, 100);
    } else {
      this.download();
    }
  };

  /**
   * Get image with autoheight or Touchable fixed height
   * @param {object} source
   */
  getImage(source) {
    this.source = source;
    const autoHeight = this.props.autoHeight;
    const custom_data = this.props.entity.custom_data;

    if (this.state.imageLoadFailed) {
      let height = 200;

      if (
        !autoHeight &&
        custom_data &&
        custom_data[0].height &&
        custom_data[0].height != '0'
      ) {
        let ratio = custom_data[0].height / custom_data[0].width;
        height = this.props.width * ratio;
      }

      let text = (
        <Text style={styles.imageLoadErrorText}>{i18n.t('errorMedia')}</Text>
      );

      if (this.props.entity.perma_url) {
        text = (
          <Text style={styles.imageLoadErrorText}>
            The media from{' '}
            <Text style={styles.imageLoadErrorTextDomain}>
              {domain(this.props.entity.perma_url)}
            </Text>{' '}
            could not be loaded.
          </Text>
        );
      }

      return <View style={[styles.imageLoadError, { height }]}>{text}</View>;
    }

    if (custom_data && custom_data[0].height && custom_data[0].height != '0') {
      let ratio = custom_data[0].height / custom_data[0].width;
      let height = this.props.width * ratio;
      return (
        <TouchableOpacity
          onPress={this.navToImage}
          onLongPress={this.imageLongPress}
          style={[styles.imageContainer, { height }]}
          activeOpacity={1}
          {...testID('Posted Image')}>
          <ExplicitImage
            source={source}
            entity={this.props.entity}
            style={[styles.image, { height }]}
            // loadingIndicator="placeholder"
            onError={this.imageError}
            imageStyle={styles.innerImage}
          />
        </TouchableOpacity>
      );
    }

    return autoHeight ? (
      <TouchableOpacity
        onPress={this.navToImage}
        onLongPress={this.imageLongPress}
        style={styles.imageContainer}
        activeOpacity={0.8}>
        <AutoHeightFastImage source={source} width={this.props.width} />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={this.navToImage}
        onLongPress={this.imageLongPress}
        style={[styles.imageContainer, { minHeight: 200 }]}
        activeOpacity={0.8}>
        <ExplicitImage
          source={source}
          entity={this.props.entity}
          style={styles.image}
          // loadingIndicator="placeholder"
          onError={this.imageError}
          imageStyle={styles.innerImage}
        />
      </TouchableOpacity>
    );
  }

  /**
   * Render
   */
  render() {
    const media = this.showMedia();

    // dereference to force re render on change (mobx)
    const paywall = this.props.entity.paywall;

    if (!media) return null;

    return (
      <View style={this.props.style}>
        {media}
        {!!this.props.entity.license && false && this.getLicense()}
      </View>
    );
  }

  /**
   * License text with icon.
   * Does not check whether or not the license exists, that is left up to the implementation to decide.
   * @returns a license with icon for the given media
   */
  getLicense() {
    const license = this.props.entity.license.replace(/-/g, ' ').toUpperCase();
    return (
      <View style={styles.licenseContainer}>
        <Icon
          style={styles.licenseIcon}
          color="#b0bec5"
          name="public"
          onPress={[Function]}
          raised={false}
          reverse={false}
          reverseColor="white"
          size={18}
          underlayColor="white"
        />
        <Text style={styles.licenseText}>{license}</Text>
      </View>
    );
  }

  /**
   * Nav to activity full screen
   */
  navToActivity = () => {
    this.props.navigation.push('Activity', { entity: this.props.entity });
  };

  /**
   * Nav to full image with zoom
   */
  navToImage = () => {
    // if is a rich embed should load link
    if (this.props.entity.perma_url) {
      this.openLink();
    } else {
      if (!this.props.navigation) {
        return;
      }
      const source = this.props.entity.getThumbSource('xlarge');
      this.props.navigation.push('ViewImage', {
        source,
        entity: this.props.entity,
      });
    }
  };

  /**
   * Open a link
   */
  openLink = () => {
    openUrlService.open(this.props.entity.perma_url);
  };
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    alignItems: 'stretch',
    //minHeight: 200,
  },
  image: {
    //height: 200,
    flex: 1,
  },
  innerImage: {
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    alignItems: 'stretch',
    minHeight: 250,
  },
  title: {
    fontWeight: 'bold',
  },
  richMediaContainer: {
    minHeight: 20,
    //borderWidth: 1,
    //borderColor: '#ececec',
  },
  richMedia: {
    padding: 8,
  },
  domain: {
    fontSize: 11,
    color: '#888',
  },
  imageLoadError: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLoadErrorText: {
    fontFamily: 'Roboto',
    color: '#666',
    fontSize: 12,
    lineHeight: 16,
  },
  imageLoadErrorTextDomain: {
    fontWeight: '600',
  },
  licenseContainer: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  licenseText: {
    color: '#888',
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  licenseIcon: {
    paddingRight: 2,
  },
});
