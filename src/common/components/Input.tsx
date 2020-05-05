//@ts-nocheck
import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ComponentsStyle } from '../../styles/Components';
import DateTimePicker from 'react-native-modal-datetime-picker';
import InfoPopup from './InfoPopup';
import PhoneValidationComponent from './PhoneValidationComponent';

import TextInput from './TextInput';
import ThemedStyles from '../../styles/ThemedStyles';

/**
 * Form input
 */
export default class Input extends Component {
  /**
   * State
   */
  state = {
    datePickerVisible: false,
    error: false,
  };

  showError = () => {
    this.setState({ error: true });
  };

  /**
   * Show date picker
   */
  showDatePicker = () => {
    this.setState({ datePickerVisible: true });
  };

  /**
   * Dismiss date picker
   */
  dismissDatePicker = () => {
    this.setState({ datePickerVisible: false });
  };

  /**
   * Confirm date picker
   */
  confirmDatePicker = (date) => {
    this.dismissDatePicker();
    this.props.onChangeText(date.toLocaleDateString());
  };

  /**
   * Text input
   */
  textInput = () => {
    const CS = ThemedStyles.style;
    return (
      <TextInput
        {...this.props}
        style={[CS.input, this.props.style]}
        placeholderTextColor="#444"
        returnKeyType={'done'}
        autoCapitalize={'none'}
        underlineColorAndroid="transparent"
        placeholder=""
      />
    );
  };

  /**
   * Phone input
   */
  phoneInput = () => {
    const CS = ThemedStyles.style;
    return (
      <PhoneValidationComponent
        style={[CS.input, this.props.style]}
        textStyle={CS.colorPrimaryText}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}
        TFA={this.props.TFA}
        TFAConfirmed={this.props.TFAConfirmed}
      />
    );
  };

  /**
   * Date input
   */
  dateInput = () => {
    const CS = ThemedStyles.style;
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 13);
    return (
      <View>
        <TouchableOpacity
          {...this.props}
          style={[CS.input, this.props.style]}
          placeholderTextColor="#444"
          returnKeyType={'done'}
          autoCapitalize={'none'}
          underlineColorAndroid="transparent"
          placeholder=""
          onPress={this.showDatePicker}>
          <Text style={CS.colorPrimaryText}>{this.props.value}</Text>
        </TouchableOpacity>
        <DateTimePicker
          isVisible={this.state.datePickerVisible}
          onConfirm={this.confirmDatePicker}
          date={maxDate}
          maximumDate={maxDate}
          onCancel={this.dismissDatePicker}
          mode="date"
          display="spinner"
        />
      </View>
    );
  };

  /**
   * renders correct input
   */
  renderInput = () => {
    const inputType = this.props.inputType;
    if (inputType) {
      switch (inputType) {
        case 'textInput':
          return this.textInput();
        case 'phoneInput':
          return this.phoneInput();
        case 'dateInput':
          return this.dateInput();
      }
    }
    return this.textInput();
  };

  /**
   * Render
   */
  render() {
    const CS = ThemedStyles.style;
    const optional = this.props.optional ? (
      <Text style={[styles.optional]}>{'Optional'}</Text>
    ) : null;

    return (
      <View style={CS.marginBottom2x}>
        <View style={[styles.row]}>
          <View style={styles.row}>
            <Text style={[styles.label, this.props.labelStyle]}>
              {this.props.placeholder}
            </Text>
            {this.props.info && <InfoPopup info={this.props.info} />}
            {this.props.onError && this.state.error && (
              <View style={styles.errorContainer}>
                <Text style={[CS.colorAlert, CS.fontL, CS.textRight]}>
                  {this.props.onError}
                </Text>
              </View>
            )}
          </View>
          {optional}
        </View>
        {this.renderInput()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#AEB0B8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  errorContainer: {
    alignContent: 'flex-end',
    width: '65%',
  },
  optional: {
    color: '#AEB0B8',
    fontSize: 14,
    fontFamily: 'Roboto-Italic',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});
