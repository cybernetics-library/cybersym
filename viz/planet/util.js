import config from './config';

// adapted from <https://stackoverflow.com/a/16533568/1097920>
function djb2(str){
  var hash = 5381;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
  }
  return hash;
}

function scaleCoord(v) {
  // normalize to [-1, 1]
  v = v/255;
  v = v*2 - 1;
  return v * config.MAX_RADIUS;
}

function inMinRadius(v) {
  return v >= -config.MIN_RADIUS && v <= config.MIN_RADIUS;
}

function inSphere(pt) {
  return (inMinRadius(pt.x) && inMinRadius(pt.y) && inMinRadius(pt.z));
}

function hashToPoint(str) {
  var hash = djb2(str);
  var x = (hash & 0xFF0000) >> 16;
  var y = (hash & 0x00FF00) >> 8;
  var z = hash & 0x0000FF;
  return {
    x: scaleCoord(x),
    y: scaleCoord(y),
    z: scaleCoord(z)
  };
}

function keepOutOfSphere(pt, hash) {
  // check if point is inside planet
  // if so, move a dimension outside of the sphere
  if (inSphere(pt)) {
    // take the first chars so the resulting integer
    // is more manageable. 12 is an arbitrary number
    var int = parseInt(hash.substring(0, 12), 16);

    // get dimension to move
    var dim = int % 3;

    // move by positive or negative radius
    var pn = int % 2,
        shift = pn == 0 ? -config.MIN_RADIUS : config.MIN_RADIUS;
    if (dim == 0) {
      pt.x += shift;
    } else if (dim == 1) {
      pt.y += shift;
    } else {
      pt.z += shift;
    }
  }
  return pt;
}


export default {
  rand(min, max) {
    return Math.random() * (max - min) + min;
  },

  randInt(min, max) {
    return Math.floor(this.rand(min, max));
  },

  choice(choices) {
    var idx = Math.floor(Math.random() * choices.length);
    return choices[idx];
  },

  hashToPoint(hash) {
    var pt = hashToPoint(hash);
    return keepOutOfSphere(pt, hash);
  },

  request(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function() {
      var data = JSON.parse(xhr.responseText);
      cb(data);
    };
    xhr.send();
  }
};
