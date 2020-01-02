// Things for managing the file system
const fs = require('fs');
const path = require('path');

// Create defualt files
fs.mkdir(path.join(__dirname, 'static'), (err) => {
  fs.mkdir(path.join(__dirname, 'static', 'img'), ()=>{});
  fs.mkdir(path.join(__dirname, 'static', 'sound'), ()=>{});
})
fs.mkdir(path.join(__dirname, 'data'), ()=>{
  fs.stat(path.join(__dirname, 'data', 'auth.json'), (err, stat) => {
    if(stat === undefined){
      fs.writeFile(path.join(__dirname, 'data', 'auth.json'), '{}', 'utf-8', ()=>{});
    }
  });
  fs.stat(path.join(__dirname, 'data', 'donations.json'), (err, stat) => {
    if(stat === undefined){
      fs.writeFile(path.join(__dirname, 'data', 'donations.json'), '{}', 'utf-8', ()=>{});
    }
  });
  fs.stat(path.join(__dirname, 'data', 'ranges.json'), (err, stat) => {
    if(stat === undefined){
      fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), '[]', 'utf-8', ()=>{});
    }
  });
});

// Giving images and sounds files names
const shortid = require('shortid');

// API's
const OBS = require('obs-websocket-js');
const Tiltify = require('tiltifyapi');
const Twitch = require('tmi.js');

let obs = new OBS();
let tiltify, twitch;
// Load auth
fs.readFile(path.join(__dirname, 'data', 'auth.json'), 'utf-8', (err, data) => {
  // let json = JSON.parse(data);
  // tiltify = new Tiltify(json.tiltifyToken);
  // twitch = new Twitch.client({
  //   identity: {
  //     username: json.twitchUsername,
  //     password: json.twitchOAuth
  //   },
  //   channels: [ json.twitchChannel ]
  // });
  // obs.connect({
  //   address: json.obsAddress,
  //   password: json.obsPassword
  // });
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

httpServer.listen(ports.http, () => {
  console.log(`hosted http server on port ${ports.http}`);
});

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
  fs.readFile(path.join(__dirname, 'data', 'auth.json'), 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    res.json(JSON.parse(data));
  });
});
function updateAuth(key, value, callback){
  fs.readFile(path.join(__dirname, 'data', 'auth.json'), 'utf-8', (err, data) => {
    let json = JSON.parse(data);
    json[key] = value;
    fs.writeFile(path.join(__dirname, 'data', 'auth.json'), JSON.stringify(json), 'utf-8', (err) => {
      if(err){
        throw err;
      }
      callback();
    });
  });
}
app.post('/obsPassword', (req, res) => {
  updateAuth('obsPassword', req.body.password, () => {
    res.end();
  });
});
app.post('/obsAddress', (req, res) => {
  updateAuth('obsAddress', req.body.address, () => {
    res.end();
  });
});
app.post('/tiltifyToken', (req, res) => {
  updateAuth('tiltifyToken', req.body.token, () => {
    res.end();
  });
});
app.post('/twitchUsername', (req, res) => {
  updateAuth('twitchUsername', req.body.username, () => {
    res.end();
  });
});
app.post('/twitchOAuth', (req, res) => {
  updateAuth('twitchOAuth', req.body.token, () => {
    res.end();
  });
});
app.post('/twitchChannel', (req, res) => {
  updateAuth('twitchChannel', req.body.channel, () => {
    res.end();
  });
});

app.get('/donations', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'donations.json'), 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    res.json(JSON.parse(data));
  });
});
app.post('/donations', (req, res) => {
  fs.writeFile(path.join(__dirname, 'data', 'donations.json'), JSON.stringify(req.body), 'utf-8', (err) => {
    if(err){
      throw err;
    }
    res.end();
  });
});

app.get('/ranges', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    res.json(JSON.parse(data));
  });
});
app.get('/range/*', (req, res) => {
  let id = req.params[0];
  fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    let json = JSON.parse(data);
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
  fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    let json = JSON.parse(data);
    let id = shortid.generate();
    json.push({
      id: id,
      min: 0,
      max: 100,
      images: [],
      sounds: []
    })
    fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify(json), (err) => {
      if(err){
        throw err;
      }
      res.send(id);
    });
  });
});
app.post('/range/update', (req, res) => {
  let { id, min, max } = req.body;
  fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    let json = JSON.parse(data);
    let i = json.reduce((acc, range, index) => {
      if(range.id === id){
        return index;
      }
      return acc;
    }, -1);
    json[i].min = min;
    json[i].max = max;
    fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify(json), (err) => {
      res.end();
    });
  });
});
app.delete('/range', (req, res) => {
  let { id } = req.body;
  fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
    if(err){
      throw err;
    }
    let json = JSON.parse(data);
    let i = json.reduce((acc, range, index) => {
      if(range.id === id){
        return index;
      }
      return acc;
    }, -1);
    json.pop(i);
    fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify(json), (err) => {
      res.end();
    });
  });
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

    fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
      if(err){
        throw err;
      }
      let json = JSON.parse(data);
      let i = json.reduce((acc, r, index) => {
        if(r.id === range){
          return index;
        }
        return acc;
      }, -1);
      json[i].images.push(filename);
      fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify(json), (err) => {
        if(err){
          throw err;
        }
        res.send(filename);
      });
    });
  });
});
app.delete('/image', (req, res) => {
  let { image } = req.body;
  fs.unlink(path.join(__dirname, 'static', 'img', image), (err) => {
    if(err){
      throw err;
    }

    fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
      if(err){
        throw err;
      }
      let json = JSON.parse(data);
      json = json.map((range) => {
        range.images = range.images.filter((img) => {
          return img !== image;
        });
        return range
      });
      fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify(json), (err) => {
        if(err){
          throw err;
        }
        res.end();
      });
    });
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
    fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
      if(err){
        throw err;
      }
      let json = JSON.parse(data);
      let i = json.reduce((acc, r, index) => {
        if(r.id === range){
          return index;
        }
        return acc;
      }, -1);
      json[i].sounds.push(filename);
      fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify(json), (err) => {
        if(err){
          throw err;
        }
        res.send(filename);
      });
    });
  });
});
app.delete('/sound', (req, res) => {
  let { sound } = req.body;
  fs.unlink(path.join(__dirname, 'static', 'sound', sound), (err) => {
    if(err){
      throw err;
    }

    fs.readFile(path.join(__dirname, 'data', 'ranges.json'), 'utf-8', (err, data) => {
      if(err){
        throw err;
      }
      let json = JSON.parse(data);
      json = json.map((range) => {
        range.sounds = range.sounds.filter((s) => {
          return s !== sound;
        });
        return range
      });
      fs.writeFile(path.join(__dirname, 'data', 'ranges.json'), JSON.stringify(json), (err) => {
        if(err){
          throw err;
        }
        res.end();
      });
    });
  });
});
