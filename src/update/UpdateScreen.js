import React, {
  Component
} from 'react';

import {
  Button,
  Text,
  Image,
  TextInput,
  StyleSheet,
  View,
} from 'react-native';

import {
  observer
} from 'mobx-react/native';
import * as Progress from 'react-native-progress';

import { CommonStyle as CS } from '../styles/Common';
import updateService from '../common/services/update.service';
import colors from '../styles/Colors';
import { ComponentsStyle } from '../styles/Components';

@observer
export default class UpdatingScreen extends Component {

  static navigationOptions = {
    header: null
  }

  render() {

    return (
      <View style={[CS.backgroundWhite, CS.padding, CS.flexContainer]}>
        <Text style={[CS.fontXXL, CS.textCenter, CS.padding]}>Update</Text>
        <View style={[CS.centered, CS.flexContainer]}>
          <View>
            <Image
              resizeMode={"contain"}
              style={ComponentsStyle.logo}
              source={require('../assets/logos/logo.png')}
            />
            <Text style={[CS.fontM, CS.fontLight, CS.textCenter, CS.paddingBottom, CS.colorDark]}>New v{updateService.version} available!</Text>
            <Text style={[CS.fontM, CS.fontMedium, CS.textCenter, CS.colorDark]}>Downloading {updateService.progress}%</Text>
            <Progress.Bar progress={updateService.progress/100} width={null} color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }
}