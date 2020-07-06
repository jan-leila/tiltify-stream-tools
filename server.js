// Things for managing the file system
const path = require('path');
const fs = require('fs');

// Load the auth file
console.log('loading auth file');
let auth;
try {
  auth = fs.readFileSync(path.join(__dirname, 'data', 'auth.json'), 'utf-8');
}
catch(err){
  auth = JSON.stringify({
    tiltifyToken: "",
    twitchUsername:"",
    twitchOAuth:"",
    twitchChannel:"",
    obsAddress:"",
    obsPassword:"",
  });
  fs.writeFile(path.join(__dirname, 'data', 'auth.json'), 'utf-8', auth, (err) => {
    if(err){ console.log(err) };
  });
}
try {
  auth = JSON.parse(auth);
}
catch(err) {
  throw err;
}
console.log('auth file loaded');

// API's
const OBSWebSocket = require('obs-websocket-js');
const Tiltify = require('tiltifyapi');
const Twitch = require('tmi.js');

// Create apis
let obs, tiltify, twitch;

tiltify = new Tiltify(auth.tiltifyToken);

twitch = new Twitch.client({
  identity: {
    username: auth.twitchUsername,
    password: auth.twitchOAuth
  },
  channels: [ auth.twitchChannel ]
});

obs = new OBSWebSocket();

// Starting Server's
// Page Routing
const express = require('express');
const app = express();

// Networking
const http = require('http');

const ports = {
  http: 3002
}

const httpServer = http.createServer(app);

httpServer.listen(ports.http);

// api managing
const compression = require('compression');
const graphQL = require('express-graphql');

// g-zip
app.use(compression({ filter: (req, res) => {
  if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
    return false;
  }
  // fallback to standard filter function
  return compression.filter(req, res);
}}));

const shortid = require('shortid');

class MaintainedObject {
  // Folder that we will be saving the insatnces to
  static saveFolder;
  // All of the instances
  static instances;

  // Get the list of instances
  static getInstances(){
    if(this.instances === undefined){
      this.instances = [];
    }
    return this.instances;
  }

  // Add an instance
  static addInstance(instance){
    // If insatnces hasent been made yet then make it
    if(this.instances === undefined){
      this.instances = [instance];
    }
    else {
      this.instances.push(instance);
    }
  }

  // Get an instance by id
  static getInstance(id){
    for(let i in this.instances){
      if(this.instances[i].id === id){
        return this.instances[i];
      }
    }
  }

  // Load all of the instances
  static load(saveFolder){
    if(saveFolder){
      this.saveFolder = saveFolder;
    }
    // Get all of the saved json files
    return new Promise((resolve, reject) => {
      fs.readdir(this.saveFolder, (err, files) => {
        if(err){
          return reject(err);
        }
        resolve(files);
      });
    })
    .then((files) => {
      // Read all of the saves
      return Promise.all(files.map((file) => {
        return new Promise((resolve, reject) => {
          fs.readFile(path.join(this.saveFolder, file), 'utf-8', (err, data) => {
            if(err){
              return reject(err);
            }
            try {
              // Turn the saves into objects
              resolve(new this({ save: false, ...JSON.parse(data)}));
            } catch (e) {
              return reject(e);
            }
          })
        });
      }));
    });
  }

  // Save all of the instances
  static save(){
    if(this.instances){
      return Promise.all(this.instances.map((instance) => {
        return instance.save();
      }));
    }
    return Promise.resolve();
  }

  // Delete a target instance
  static delete(id){
    this.constructor.instances = this.constructor.instances.filter(({ id }) => {
      return this.id !== id;
    });
    return new Promise((resolve, reject) => {
      fs.unlink(path.join(this.constructor.saveFolder, `${ id }.json`), (err) => {
        if(err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  // Constructor for the object that takes in an id and all vars
  constructor({ id = shortid.generate(), save = true, ...args}){
    // Set the id
    this.id = id;
    this.constructor.addInstance(this);
    // Map all of the args
    for(let arg in args){
      this[arg] = args[arg];
    }
    // Save the object if we have the save flag set
    if(save){
      this.save();
    }
  }

  // Set args then save
  setArgs({ ...args }){
    // Map all of the args
    for(let arg in args){
      this[arg] = args[arg];
    }
    // Save the object
    this.save();
  }

  // Function to save the object
  save(){
    // If we dont have a save folder then throw an error
    if(this.constructor.saveFolder === undefined){
      throw new Error('saveFolder not set on MaintainedObject');
    }
    // Make sure we have the folder and then save the file if we do
    return new Promise((resolve, reject) => {
      fs.mkdir(this.constructor.saveFolder, (err) => {
        resolve();
      });
    })
    .finally(() => {
      return new Promise((resolve, reject) => {
        fs.writeFile(path.join(this.constructor.saveFolder, `${ this.id }.json`), JSON.stringify(this), 'utf-8', (err) => {
          if(err){
            return reject(err);
          }
          resolve();
        });
      });
    })
    .catch(console.log);
  }

  // Delete an instance
  delete(){
    this.constructor.instances = this.constructor.instances.filter(({ id }) => {
      return this.id !== id;
    });
    fs.unlink(path.join(this.constructor.saveFolder, `${ this.id }.json`), (err) => {
      if(err) { console.log(err) }
    });
  }
}

class Source extends MaintainedObject {
  // Create the source with a default length
  constructor({ length = 1000, ...args }){
    super({ length, ...args });
  }

  // Play the source in obs
  play(){
    obs.send('DuplicateSceneItem', {
      fromScene: 'donations',
      item: {
        id: this.id,
      },
    })
    .then((...args) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(...args)
        }, this.length);
      });
    })
    .then((args) => {
      obs.send('DeleteSceneItem', args);
    })
    .catch(console.log);
  }
}
Source.load(path.join('.', 'data', 'sources'))
.catch(console.log);

class Range extends MaintainedObject {
  // Create the range with default settings
  constructor({ min = -1, max = -1, weight = 1, sources = [], ...args }){
    super({ min, max, weight, sources, ...args });
  }

  // Play all of the sources in this range
  play(){
    Source.getInstances().map(({ play, id }) => {
      if(this.sources.indexOf(id) !== -1){
        play();
      }
    });
  }
}
Range.load(path.join('.', 'data', 'ranges'))
.catch(console.log);

obs.on('SceneItemAdded', ({ 'scene-name': scene, 'item-name': name, 'item-id': id}) => {
  if(scene === 'donations'){
    new Source({ name, id });
  }
});
obs.on('SceneItemRemoved', ({ 'scene-name': scene, 'item-id': id}) => {
  if(scene === 'donations'){
    Source.delete(id);
  }
});

function obsConnect(){
  return new Promise((resolve, reject) => {
    let count = 0;
    function connect(){
      console.log(`connecting to obs${count === 0?'':` [attempt #${count}]`}`);
      obs.connect({ address: auth.obsAddress, password: auth.obsPassword })
      .then(resolve)
      .catch(() => {
        count++;
        setTimeout(connect, 500);
      });
    }
    connect();
  })
  .then(() => {
    return Source.save();
  })
  .then(() => {
    Source.instances = undefined;
    return Source.load();
  })
  .then(() => {
    return obs.send('GetSceneList');
  })
  .then(({ scenes }) => {
    for(let i in scenes){
      if(scenes[i].name === 'donations'){
        return Promise.resolve(scenes[i]);
      }
    }
    return Promise.reject(new Error("donation scene not found"));
  })
  .then(({ sources }) => {
    sources.map(({ id, name }) => {
      let instance = Source.getInstance(id);
      if(instance === undefined){
        new Source({ id, name });
      }
    });
  })
  .catch(console.log);
}
obsConnect();
obs.on('Exiting', () => {
  Source.save()
  .then(() => {
    Source.insatnces = [];
    setTimeout(obsConnect, 10000);
  })
  .catch(err)
});

let schema = require('./graphSchema');
//graphQL
app.use('/api/v1/', graphQL({
  schema: schema({ Source, Range }),
  graphiql: true,
}));

tiltify.getUser('gamingforglobalchange')
.then((user) => {
  return user.getCampaigns()
})
.then((campaigns) => {
  let activeCampain = campaigns[0];
  activeCampain.getDonationStream((donation) => {
    // Tell chat that we have a donation
    twitch.say('#gamingforglobalchange', `We have a $${donation.amount} donation from ${donation.name} ${donation.comment === null || donation.comment === ''?'':`with the comment "${donation.comment}"`}`);
    // Update the donation total on stream
    obs.send('SetSourceSettings', {
      'sourceName': 'Donations',
      'sourceSettings': {
        'text': `${activeCampain.amountRaised}/${activeCampain.goal}`
      }
    });
    let ranges = Range.getInstances().filter(({ amount, weight }) => {
      return (amount < max || max === -1) && (amount > min || min === -1) && weight !== 0;
    });
    let weight = ranges.reduce((acc, { weight }) => {
      return acc + weight;
    }, 0);
    weight = Math.floor(Math.random() * weight);
    for(let i in ranges){
      if(i <= 0){
        ranges[i].play();
        break;
      }
      weight -= ranges[i].weight;
    }
  });
})
.catch((err) => {
  console.log(err);
});

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'react-ui', 'build')));
