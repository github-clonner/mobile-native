import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import { observer } from 'mobx-react/native'

import Activity from './activity/Activity';
import TileElement from './TileElement';
import { CommonStyle } from '../styles/Common';
/**
 * News feed list component
 */
@observer
export default class NewsfeedList extends Component {

  nextBoostedId = 1;
  viewOpts = {
    viewAreaCoveragePercentThreshold: 50
  }
  state = {
    itemHeight: 0,
    viewed: []
  }

  get boostedId() {
    return this.nextBoostedId++;
  }

  /**
   * On list mount
   */
  onComponentWillMount() {
    this.nextBoostedId = 1;
  }

  /**
   * Adjust tiles to 1/cols size
   */
  onLayout = e => {
    const width = e.nativeEvent.layout.width;
    this.setState({
      itemHeight: width / 3,
    });
  }

  /**
   * Calculate item layout for better performance on tiles
   */
  getItemLayout = (data, index) => {
    const { itemHeight } = this.state;
    return { length: itemHeight, offset: itemHeight * index, index };
  }

  /**
   * Render component
   */
  render() {
    let renderRow, getItemLayout, emptyMessage = null;

    const newsfeed = this.props.newsfeed;

    if (newsfeed.isTiled) {
      renderRow = this.props.renderTileActivity || this.renderTileActivity;
      getItemLayout  = this.getItemLayout;
    } else {
      renderRow = this.props.renderActivity || this.renderActivity;
      getItemLayout  = null;
    }

    const footer = (newsfeed.loading && !newsfeed.list.refreshing) ?  (
      <View style={{ flex:1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <ActivityIndicator size={'large'} />
      </View>
    ) : null;

    // empty message
    if (newsfeed.list.loaded && !newsfeed.list.refreshing) {
      emptyMessage = this.props.emptyMessage;
      // if there is no empty message prop we use default
      if (!emptyMessage) {
        emptyMessage = <Text style={[CommonStyle.fontXL, CommonStyle.textCenter, CommonStyle.padding2x]}>
          There is no data to show
        </Text>;
      }
    }

    return (
      <FlatList
        key={(newsfeed.isTiled ? 't' : 'f')}
        onLayout={this.onLayout}
        ListHeaderComponent={this.props.header}
        ListFooterComponent={footer}
        data={newsfeed.list.entities.slice()}
        renderItem={renderRow}
        keyExtractor={item => item.rowKey}
        onRefresh={this.refresh}
        refreshing={newsfeed.list.refreshing}
        onEndReached={this.loadFeed}
        onEndThreshold={0}
        numColumns={newsfeed.isTiled ? 3 : 1}
        style={styles.listView}
        initialNumToRender={6}
        windowSize={11}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        ListEmptyComponent={emptyMessage}
        viewabilityConfig={this.viewOpts}
        onViewableItemsChanged={this.onViewableItemsChanged}
      />
    );
  }

  onViewableItemsChanged = ({viewableItems}) => {
    viewableItems.forEach((item) => {
      const { isViewable, key } = item;
      if (isViewable ) {
        this.props.newsfeed.addViewed(item.item);
      }
    });
  }

  /**
   * Load feed data
   */
  loadFeed = () => {
    this.props.newsfeed.loadFeed(this.props.guid);
  }

  /**
   * Refresh feed data
   */
  refresh = () => {
    this.nextBoostedId = 1;
    this.props.newsfeed.refresh(this.props.guid)
  }

  /**
   * Render activity
   */
  renderActivity = (row) => {
    const entity = row.item;

    return <Activity
      entity={entity}
      newsfeed={this.props.newsfeed}
      navigation={this.props.navigation}
      autoHeight={false}
    />;
  }

  /**
   * Render tile
   */
  renderTileActivity = (row) => {
    const entity = row.item;
    return <TileElement size={this.state.itemHeight} newsfeed={this.props.newsfeed} entity={entity} navigation={this.props.navigation} />;
  }
}

const styles = StyleSheet.create({
  listView: {
    //paddingTop: 20,
    backgroundColor: '#FFF',
    flex: 1,
  }
});