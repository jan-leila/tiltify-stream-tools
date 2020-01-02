import React, { Component } from 'react';

class Slider extends Component {
  render(){
    return <div style={{
      width: this.props.style.width,
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        left: this.props.minVal,

        width: '5px',
        height: '100%',

        background: this.props.style.color
      }}/>
      <div style={{
        position: 'absolute',
        left: this.props.maxVal,

        width: '5px',
        height: '100%',

        background: this.props.style.color
      }}/>
      <div style={{
        width: '100%',
        height: '4px',
        background: this.props.style.background
      }}/>
    </div>;
  }
}

Slider.defaultProps = {
  style: {
    width: '100px',
    background: '#000',
    color: '#00f'
  },

  barHeight: '5px',
  sliderHeight: '10px',
  sliderWidth: '5px',

  min: 0,
  max: 100,
  minVal: 0,
  maxVal: 100,
};

export default Slider;
