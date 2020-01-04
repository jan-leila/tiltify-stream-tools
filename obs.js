const obs = require('obs-websocket-js');

class OBS {
  constructor({ address, password }, timeout = 5000){
    this.obs = new obs();

    this.buffer = [];

    this.timeout = timeout;

    this.connect({ address, password });
  }

  connect({ address, password }, timeout = this.timeout){
    this.disconnect()
    .then(() => {
      return this.obs.connect({
        address: address,
        password: password
      });
    })
    .then(() => {
      this.buffer.map((call) => {
        call();
      });
    })
    .catch((err) => {
      this.setTimeout(() => {
        this.connect(address, password, timeout);
      }, timeout);
      console.log('test');
      throw err;
    });
  }

  disconnect(){
    if(this.obs._connected){
      return this.obs.disconnect;
    }
    return Promise.resolve();
  }

  send(route, args, callback){
    if(typeof args === 'function'){
      callback = args;
      args = {};
    }

    let prom = new Promise((resolve, reject) => {
      let call = () => {
        this.obs.send(route, args)
        .then(resolve)
        .catch(reject);
      }
      if(this.obs._connected === true){
        return call();
      }
      this.buffer.push(call);
    });

    if(callback === undefined){
      return prom;
    }
    prom
    .then((data) => {
      callback(undefined, data)
    })
    .catch((err) => {
      callback(err);
    });
  }

  on(route, callback){
    let prom = new Promise((resolve, reject) => {
      this.obs.on(route, resolve);
    });
    if(callback === undefined){
      return prom;
    }
    prom
    .then((data) => {
      callback(data);
    })
    .catch((err) => {});
  }
}

module.exports = OBS;
