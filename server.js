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

class Source {
  static sources = [];

  static get_source(id){
    for(let i in Source.sources){
      if(Source.sources[i].id === id){
        return Source.sources[i];
      }
    }
  }

  constructor({ id, name, length = 1000 }){
    this.id = id;
    this.length = length;
    this.name = name;

    Source.sources.push(this);
  }

  set_length(length){
    //TODO: save length to file
    this.length = length;
  }

  play(){
    // TODO: write this
    console.log(`playing source ${this.name} (${this.id})`);
  }
}

class Range {
  static ranges = [];

  static get_range(id){
    for(let i in Range.ranges){
      if(Range.ranges[i].id === id){
        return Range.ranges[i];
      }
    }
  }

  constructor({ min = -1, max = -1, weight = 0, sources = [] }){
    this.id = shortid.generate();
    this.min = min;
    this.max = max;
    this.weight = weight;
    this.sources = sources;

    Range.ranges.push(this);
  }

  play(){
    Source.sources.map(({ play, id }) => {
      if(this.sources.indexOf(id) !== -1){
        play();
      }
    });
  }
}

obs.connect({ address: auth.obsAddress, password: auth.obsPassword })
.then(() => {
  obs.on('SceneItemAdded', ({ 'scene-name': scene, 'item-name': name, 'item-id': id}) => {
    if(scene !== 'donations'){
      return;
    }
    new Source({ name, id });
  });
  obs.on('SceneItemRemoved', ({ 'scene-name': scene, 'item-id': id}) => {
    if(scene !== 'donations'){
      return;
    }
    Source.sources = Source.sources.filter(({ _id }) => {
      return _id !== id;
    });
  });
  return obs.send('GetSceneList');
})
.then(({ scenes }) => {
  for(let i in scenes){
    if(scenes[i].name === 'donations'){
      return Promise.resolve(scenes[i]);
    }
  }
  return Promise.reject("donation scene not found");
})
.then(({ sources }) => {
  for(let i in sources){
    new Source(sources[i]);
  }
})
.catch(console.log);

let schema = require('./graphSchema');
//graphQL
app.use('/api/v1/', graphQL({
  schema: schema({ Source, Range }),
  graphiql: true,
}));

// tiltify.getUser('gamingforglobalchange')
// .then((user) => {
//   return user.getCampaigns()
// })
// .then((campaigns) => {
//   let activeCampain = campaigns[0];
//   activeCampain.getDonationStream((donation) => {
//     // Tell chat that we have a donation
//     twitch.say('#gamingforglobalchange', `We have a $${donation.amount} donation from ${donation.name} ${donation.comment === null || donation.comment === ''?'':`with the comment "${donation.comment}"`}`);
//     // Update the donation total on stream
//     obs.send('SetSourceSettings', {
//       'sourceName': 'Donations',
//       'sourceSettings': {
//         'text': `${activeCampain.amountRaised}/${activeCampain.goal}`
//       }
//     });
//
//   });
// })
// .catch((err) => {
//   console.log(err);
// });

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'react-ui', 'build')));
