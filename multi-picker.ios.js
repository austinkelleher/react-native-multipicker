/**
 * Copyright (c) 2015-present Dave Vedder
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule MultiPickerIOS
 *
 * This is a controlled component version of RNMultiPicker
 *
 * WARNING: this is a proof of concept. Don't use it for reals yet. Also,
 * if your container has `flex` set on it, the picker moves around oddly.
 * I'm not sure if that's something I broke, or it happens in the default one
 * as well. In addition, if you set a `width` on your picker, it seems to not
 * behave properly. Set a background color on it when you set the width and
 * you will see what I mean.
 *
 */
'use strict';

var React = require('react-native');
var { StyleSheet, View, NativeModules, PropTypes, requireNativeComponent, } = React;
var RNMultiPickerConsts = NativeModules.UIManager.RNMultiPicker.Constants;
var PICKER_REF = 'picker';

var MultiPickerIOS = React.createClass({
  propTypes: {
    componentData: PropTypes.any,
    selectedIndexes: PropTypes.array,
    onChange: PropTypes.func,
    controlled:PropTypes.bool,
  },

  getInitialState: function() {
    return this._stateFromProps(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(this._stateFromProps(nextProps));
  },

  // converts child PickerComponent and their Item children into state
  // that can be sent to  VDRPicker native class.
  _stateFromProps: function (props) {
    var componentData = [];
    var selectedIndexes = [];

    React.Children.forEach(props.children, function (child, index) {
      var items = []
      var selectedIndex = 0; // sane default
      var checkVal = child.props.selectedValue;

      React.Children.forEach(child.props.children, function (child, idx) {
        if (checkVal === child.props.value) {
          selectedIndex = idx;
        }
        items.push({label: child.props.label, value: child.props.value});
      });

      componentData.push(items);
      selectedIndexes.push(selectedIndex);
    });

    return { componentData, selectedIndexes, };
  },

  _onChange: function (event) {
    var nativeEvent = event.nativeEvent;
    // Call any change handlers on the component itself
    if (this.props.onChange) {
        this.props.onChange(nativeEvent);
    }

    if (this.props.valueChange) {
        this.props.valueChange(nativeEvent);
    }

    // Call any change handlers on the child component picker that changed
    // if it has one. Doing it this way rather than storing references
    // to child nodes and their onChage props in _stateFromProps because
    // React docs imply that may not be a good idea.
    React.Children.forEach(this.props.children, function (child, idx) {
      if (idx === nativeEvent.component && child.props.onChange) {
        child.props.onChange(nativeEvent);
      }
    });

    var nativeProps = {
      componentData: this.state.componentData,
    };

    // If we are a controlled instance, we tell the native component what
    // it's value should be after any change.
    if (this.props.controlled) {
      nativeProps.selectedIndexes = this.state.selectedIndexes;
    }

    this.refs[PICKER_REF].setNativeProps(nativeProps);
  },

  render() {
    return (
      <View style={this.props.style}>
        <RNMultiPicker
            ref={PICKER_REF}
            style={styles.multipicker}
            selectedIndexes={this.state.selectedIndexes}
            componentData={this.state.componentData}
            onChange={this._onChange} />
      </View>
    );
  },
});

// Represents a "section" of a picker.
MultiPickerIOS.Group = React.createClass({
  propTypes: {
      items: React.PropTypes.array,
      selectedIndex: React.PropTypes.number,
      onChange: React.PropTypes.func,
  },

  render() {
      return null;
  },
});

// Represents an item in a picker section: the `value` is used for setting /
// getting selection
//
MultiPickerIOS.Item = React.createClass({
  propTypes: {
    value: React.PropTypes.any.isRequired, // string or integer basically
    label: React.PropTypes.string.isRequired, // for display
  },

  render() {
    return null;
  },
});

var styles = StyleSheet.create({
  multipicker: {
    height: RNMultiPickerConsts.ComponentHeight,
  },
});

var RNMultiPicker = requireNativeComponent('RNMultiPicker', MultiPickerIOS);
module.exports = MultiPickerIOS;
