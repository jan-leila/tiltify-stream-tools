import React, { Component } from 'react';

class DonationRange extends Component {

  constructor(props){
    super(props);

    this.state = {
      min: props.min,
      max: props.max,
      images: props.images,
      sounds: props.sounds
    }
  }

  postRange(){
    fetch('/range/update', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: this.props.id,
        min: this.state.min,
        max: this.state.max
      })
    });
  }

  minChange(val){
    this.setState({
      min: val
    }, this.postRange);
  }

  maxChange(val){
    this.setState({
      max: val
    }, this.postRange);
  }

  render(){
    return <div style={{
      background: '#ddd',
      padding: '10px',
      margin: '10px',
      position: 'relative'
    }}>
      <img src='x.png' alt='' style={{
        position: 'absolute',
        right: '5px',
        top: '5px',
        height: '10px'
      }} onClick={() => {
        fetch('/range', {
          method: 'delete',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: this.props.id
          })
        })
        .then((res) => {
          this.props.delete();
        });
      }}/>
      <span>min: <input value={this.state.min} style={{
        width: '25px'
      }} onChange={(e) => {
        this.minChange(e.target.value);
      }}/> max: <input value={this.state.max} style={{
        width: '25px'
      }} onChange={(e) => {
        this.maxChange(e.target.value);
      }}/></span>
      <div>
        <div>images:</div>
        {
          this.state.images.map((img, i) => {
            return <div key={i} style={{
              height: '200px',
              position: 'relative',
              margin: '10px'
            }}>
              <img src='x.png' alt='' style={{
                position: 'absolute',
                left: '5px',
                top: '5px',
                height: '10px'
              }} onClick={() => {
                fetch('image', {
                  method: 'delete',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    image: img
                  })
                })
                .then((res) => {
                  if(res.status === 200){
                    let images = [...this.state.images];
                    images.splice(images.indexOf(img), 1);
                    this.setState({
                      images: images
                    });
                  }
                });
              }}/>
              <img alt='' style={{
                height: '100%'
              }} src={`/img/${img}`}/>
            </div>
          })
        }
        Add Image: <input multiple type='file' onChange={(e) => {
          let input = e.target;
          let files = input.files;
          Promise.all(Array.from(files).map((file) => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsBinaryString(file);
              reader.onloadend = () => {
                fetch(`image`, {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    range: this.props.id,
                    extension: file.name.split('.').pop(),
                    image: reader.result
                  })
                })
                .then((res) => {
                  switch (res.status) {
                    case 200:
                      return res.text();
                    default:
                      reject(res.status);
                  }
                })
                .then((filename) => {
                  resolve(filename);
                })
                .catch(reject);
              }
            });
          }))
          .then((images) => {
            input.value = '';
            this.setState({
              images: this.state.images.concat(images)
            });
          });
        }}/>
      </div>
      <div>
        <div>sounds:</div>
        {
          this.state.sounds.map((sound, i) => {
            return <div key={i} style={{
              position: 'relative',
              margin: '10px'
            }}>
              <img src='x.png' alt='' style={{
                position: 'absolute',
                right: '5px',
                top: '5px',
                height: '10px'
              }} onClick={() => {
                fetch('sound', {
                  method: 'delete',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    sound: sound
                  })
                })
                .then((res) => {
                  if(res.status === 200){
                    let sounds = [...this.state.sounds];
                    sounds.splice(sounds.indexOf(sound), 1);
                    this.setState({
                      sounds: sounds
                    });
                  }
                });
              }}/>
              <audio controls src={`/sound/${sound}`}/>
            </div>
          })
        }
        Add Sound: <input multiple type='file' onChange={(e) => {
          let input = e.target;
          let files = input.files;
          Promise.all(Array.from(files).map((file) => {
            return new Promise((resolve, reject) => {
              let reader = new FileReader();
              reader.readAsBinaryString(file);
              reader.onloadend = () => {
                fetch(`sound`, {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    range: this.props.id,
                    extension: file.name.split('.').pop(),
                    sound: reader.result
                  })
                })
                .then((res) => {
                  switch (res.status) {
                    case 200:
                      return res.text();
                    default:
                      reject(res.status);
                  }
                })
                .then((filename) => {
                  resolve(filename);
                })
                .catch(reject);
              }
            });
          }))
          .then((sounds) => {
            input.value = '';
            this.setState({
              sounds: this.state.sounds.concat(sounds)
            });
          });
        }}/>
      </div>
    </div>;
  }
}

export default DonationRange;
