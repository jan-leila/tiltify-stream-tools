const fs = require('fs');

function makeFile(dir, contents, opts = {}, callback){
  fs.writeFile(dir, contents, opts, (err) => {
    if(err !== undefined){
      makeFolder(dir.substring(0, dir.lastIndexOf('/')), () => {
        fs.writeFile(dir, contents, opts, callback);
      });
    }
    else {
      callback();
    }
  });
}

function makeFolder(dir, callback){
  fs.mkdir(dir, (err) => {
    if((err !== undefined || err !== null) && err.errno !== -17){
      makeFolder(dir.substring(0, dir.lastIndexOf('/')), () => {
        callback();
      });
    }
    else {
      callback();
    }
  });
}

class File {
  constructor(file, defaul = '{}'){
    this.file = file;
    fs.stat(this.file, (err, stat) => {
      if(stat === undefined){
        makeFile(this.file, defaul, 'utf-8', () => {

        });
      }
    });
  }

  //TODO: readlocks
  get(func, callback){
    fs.readFile(this.file, 'utf-8', (err, data) => {
      if(err){
        throw err;
      }
      let newData = func(JSON.parse(data));
      if(newData !== undefined){
        fs.writeFile(this.file, JSON.stringify(newData), 'utf-8', (err) => {
          if(err){
            throw err;
          }
          callback();
        });
      }
    });
  }
}


module.exports = File;
