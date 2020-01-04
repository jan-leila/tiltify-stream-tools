// Things for managing the file system
const path = require('path');
const File = require('./fileManager');

let auth = new File(path.join(__dirname, 'data', 'auth.json'), JSON.stringify({
  twitchUsername: "",
  twitchOAuth: "",
  twitchChannel: "",
  obsAddress: "",
  obsPassword: ""
}));
let donations = new File(path.join(__dirname, 'data', 'donations.json'), JSON.stringify({}));
let ranges = new File(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify([]));

// Giving images and sounds files names
const shortid = require('shortid');

// API's
const OBS = require('./obs');
const Tiltify = require('tiltifyapi');
const Twitch = require('tmi.js');

let obs, tiltify, twitch;
auth.get((json) => {
  tiltify = new Tiltify(json.tiltifyToken);
  twitch = new Twitch.client({
    identity: {
      username: json.twitchUsername,
      password: json.twitchOAuth
    },
    channels: [ json.twitchChannel ]
  });
  obs = new OBS({
    address: json.obsAddress,
    password: json.obsPassword
  });
});

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

// File Routing
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'react-ui', 'build')));

// REST managing
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({limit: '500mb'}));

// Auth managing
app.get('/auth', (req, res) => {
  auth.get((json) => {
    res.json(json);
  });
});
app.post('/obsPassword', (req, res) => {
  auth.get((json) => {
    json.obsPassword = req.body.password;
    return json;
  }, res.end);
});
app.post('/obsAddress', (req, res) => {
  auth.get((json) => {
    json.obsAddress = req.body.address;
    return json;
  }, res.end);
});
app.post('/tiltifyToken', (req, res) => {
  auth.get((json) => {
    json.tiltifyToken = req.body.token;
    return json;
  }, res.end);
});
app.post('/twitchUsername', (req, res) => {
  auth.get((json) => {
    json.twitchUsername = req.body.username;
    return json;
  }, res.end);
});
app.post('/twitchOAuth', (req, res) => {
  auth.get((json) => {
    json.twitchOAuth = req.body.token;
    return json;
  }, res.end);
});
app.post('/twitchChannel', (req, res) => {
  auth.get((json) => {
    json.twitchChannel = req.body.channel;
    return json;
  }, res.end);
});

app.get('/donations', (req, res) => {
  donations.get((json) => {
    res.json(json);
  });
});
app.post('/donations', (req, res) => {
  donations.get((json) => {
    return req.body;
  }, () => {
    res.end()
  });
});

app.get('/ranges', (req, res) => {
  ranges.get((json) => {
    res.json(json);
  });
});
app.get('/range/*', (req, res) => {
  let id = req.params[0];
  ranges.get((json) => {
    let i = json.reduce((acc, range, index) => {
      if(range.id === id){
        return index;
      }
      return acc;
    }, -1);
    res.json(json[i]);
  });
});
app.post('/range', (req, res) => {
  let id;
  ranges.get((json) => {
    id = shortid.generate();
    json.push({
      id: id,
      min: 0,
      max: 100,
      images: [],
      sounds: []
    });
    return json;
  }, () => {
    res.send(id);
  });
});
app.post('/range/update', (req, res) => {
  let { id, min, max } = req.body;
  ranges.get((json) => {
    let i = json.reduce((acc, range, index) => {
      if(range.id === id){
        return index;
      }
      return acc;
    }, -1);
    json[i].min = min;
    json[i].max = max;
    return json;
  }, res.end);
});
app.delete('/range', (req, res) => {
  let { id } = req.body;
  ranges.get((json) => {
    let i = json.reduce((acc, range, index) => {
      if(range.id === id){
        return index;
      }
      return acc;
    }, -1);
    json.pop(i);
    return json;
  }, res.end);
});

app.post('/image', (req, res) => {
  let { range, extension, image } = req.body;
  let id = shortid.generate();
  let filename = `${id}.${extension}`;
  fs.writeFile(path.join(__dirname, 'static', 'img', filename), image, {
    encoding: 'binary'
  }, (err) => {
    if(err){
      throw err;
    }

    ranges.get((json) => {
      let i = json.reduce((acc, r, index) => {
        if(r.id === range){
          return index;
        }
        return acc;
      }, -1);
      json[i].images.push(filename);
      return json;
    }, () => {
      res.send(filename);
    });
  });
});
app.delete('/image', (req, res) => {
  let { image } = req.body;
  fs.unlink(path.join(__dirname, 'static', 'img', image), (err) => {
    if(err){
      throw err;
    }

    ranges.get((json) => {
      json = json.map((range) => {
        range.images = range.images.filter((img) => {
          return img !== image;
        });
        return range
      });
      return json;
    }, res.end);
  });
});

app.post('/sound', (req, res) => {
  let { range, sound, extension } = req.body;
  let id = shortid.generate();
  let filename = `${id}.${extension}`;
  fs.writeFile(path.join(__dirname, 'static', 'sound', filename), sound, {
    encoding: 'binary'
  }, (err) => {
    if(err){
      throw err;
    }
    ranges.get((json) => {
      let i = json.reduce((acc, r, index) => {
        if(r.id === range){
          return index;
        }
        return acc;
      }, -1);
      json[i].sounds.push(filename);
      return json;
    }, () => {
      res.send(filename);
    });
  });
});
app.delete('/sound', (req, res) => {
  let { sound } = req.body;
  fs.unlink(path.join(__dirname, 'static', 'sound', sound), (err) => {
    if(err){
      throw err;
    }

    ranges.get((json) => {
      json = json.map((range) => {
        range.sounds = range.sounds.filter((s) => {
          return s !== sound;
        });
        return range
      });
      return json;
    }, res.end);
  });
});
