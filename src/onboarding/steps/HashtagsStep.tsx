//@ts-nocheck
import React, { Component } from 'react';

import { View, Text, TouchableHighlight } from 'react-native';
import { observer, inject } from 'mobx-react';

import { CommonStyle as CS } from '../../styles/Common';
import TagSelect from '../../common/components/TagSelect';
import TagInput from '../../common/components/TagInput';
import i18n from '../../common/services/i18n.service';

@inject('hashtag')
@observer
export default class HashtagsStep extends Component {
  componentWillMount() {
    this.props.hashtag.setAll(true);
    this.props.hashtag.loadSuggested().catch((err) => {
      logService.exception(err);
    });
  }

  render() {
    return (
      <View style={[CS.padding4x]}>
        <Text
          style={[CS.fontXXL, CS.colorDark, CS.fontMedium, CS.marginBottom3x]}>
          {i18n.t('onboarding.hashtagSelect')}
        </Text>
        <View style={[CS.paddingBottom2x]}>
          <TagInput
            hideTags={true}
            noAutofocus={true}
            tags={this.props.hashtag.suggested.map((m) => m.value)}
            onTagDeleted={this.props.hashtag.deselect}
            onTagAdded={this.props.hashtag.create}
          />
        </View>
        <TagSelect
          tagStyle={[
            CS.backgroundWhite,
            CS.padding1x,
            CS.borderGreyed,
            CS.border,
          ]}
          tagSelectedStyle={[CS.borderPrimary]}
          textStyle={[CS.fontXL, CS.colorDarkGreyed]}
          containerStyle={[CS.columnAlignStart]}
          onTagDeleted={this.props.hashtag.deselect}
          onTagAdded={this.props.hashtag.select}
          tags={this.props.hashtag.suggested}
          disableSort={true}
        />
      </View>
    );
  }
}
