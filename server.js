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

let { schema, sources, ranges } = require('./graphSchema');
//graphQL
app.use('/api/v1/', graphQL({
  schema: schema({ obs, address: auth.obsAddress, password: auth.obsPassword }),
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

  });
})
.catch((err) => {
  console.log(err);
});

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'react-ui', 'build')));
