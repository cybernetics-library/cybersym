import TWEEN from 'tween.js';
import * as THREE from 'three';
import md5 from 'blueimp-md5';
import config from './config';
import util from './util';
import Space from './space';


function genMat(topic) {
  var color = config.COLORS[topic];
  var mat = new THREE.MeshLambertMaterial({color: color, refractionRatio: 0.95});
  mat.emissiveIntensity = 0.6;
  mat.emissive = {
        r: 0.45,
        g: 0.45,
        b: 0.45
  };
  return mat;
}

const TOPIC_MATS = Object.keys(config.COLORS).reduce((agg, k) => {
  agg[k] = genMat(k);
  return agg;
}, {});


function sortTopics(topics, book_id) {
  // turn to array
  var topics = Object.keys(topics).map(t => [
    t, topics[t],
    parseInt(md5(`${t}${book_id}`).substring(0, 12), 16)
  ]);

  topics.sort((a, b) => {
    return a[2] - b[2];
  });
  return topics
}

function valFromHash(hash, lo, hi) {
  return (hash%(hi-lo+1))+lo;
}

function genObject(checkout) {
  // generate object for topic
  var topics = sortTopics(checkout['topics'], checkout['book_id']);
  var minHeight = 1.2/(topics.length+1),
      baseHeight = 2.2/(topics.length+1),
      height = 0, obj;
  topics.map(topic => {
    var nPieces = topics.length >= 2 ? 1 : valFromHash(topic[2], 2, 3);
    for (var i=0; i<nPieces; i++) {
      var nextHeight = valFromHash(topic[2], minHeight, baseHeight);
      var geo = new THREE.CylinderGeometry(
          Math.sqrt(valFromHash(topic[2] * (i+1), 1, 3))/2,
          Math.sqrt(valFromHash(Math.sqrt(topic[2] * (i+1)), 1, 3))/2,
          nextHeight, 8);
      var mesh = new THREE.Mesh(geo, TOPIC_MATS[topic[0]]);
      if (!obj) {
        geo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, nextHeight/2, 0 ) ); // set pivot to origin
        obj = new THREE.Mesh(geo, TOPIC_MATS[topic[0]]);
      } else {
        obj.add(mesh);
      }
      mesh.position.y = height/2;
      height += nextHeight;
    }
  });
  obj.rotation.set(
    valFromHash(topics[0][2], -3, 3),
    valFromHash(topics[0][2], -3, 3),
    valFromHash(topics[0][2], -3, 3));
  return obj;
}


class Planet {
  constructor(space, attendee_id) {
    this.space = space;
    this.attendee_id = attendee_id;
    this.lastHash = md5(attendee_id);
    document.getElementById('planet-name').innerHTML = `Planet ${attendee_id}`;

    // this.objs = {};
    // this.names = {};

    util.request(`${config.API_URL}/planets/${attendee_id}`, (data) => {
      // create the planet
      var geometry = new THREE.SphereGeometry(config.PLANET_RADIUS, 48, 48);
      var material = new THREE.MeshPhongMaterial({
        color: data.color,
        shading: THREE.FlatShading,
        wireframe: false
      });
      var mesh = new THREE.Mesh(geometry, material);
      this.space.scene.add(mesh);
      this.planet = mesh;
      this.lastCheckout = data.checkouts.pop();
      data.checkouts.map(c => this.nextEvent(c, false));
      this.nextEvent(this.lastCheckout, true); // animate the last checkout
    });
  }

  // compute object placement for checkout
  nextEvent(checkout, animate) {
    console.log(checkout);
    this.lastHash = md5(this.lastHash + checkout['book_id']);
    var coords = util.hashToPoint(this.lastHash); // where the object spawns
    var obj = genObject(checkout);

    // add as child to planet so it follows rotation
    this.planet.add(obj);
    obj.position.set(coords.x, coords.y, coords.z);

    // find closest point on sphere
    var target = new THREE.Vector3();
    target.sub(obj.position, new THREE.Vector3(0,0,0));
    target.normalize();
    target.multiplyScalar(config.PLANET_RADIUS);

    if (animate) {
      this.crashIntoPlanet(obj, target);
    } else {
      obj.position.set(target.x, target.y, target.z);
    }
  }

  crashIntoPlanet(obj, target) {
    // so it pops into existence
    obj.scale.set(0,0,0);

    if (config.DEBUG) {
      // mark where object will hit
      var geo = new THREE.SphereGeometry(0.2, 16, 16);
      var material = new THREE.MeshPhongMaterial({color: 0xff0000, shading: THREE.FlatShading});
      var mesh = new THREE.Mesh(geo, material);
      mesh.position.set(target.x, target.y, target.z);
      this.planet.add(mesh);
    }

    // animate: spawn (scale), crashing (rotation and position)
    new TWEEN.Tween(obj.scale).to({x:1, y:1, z:1}, 2000)
      .easing(TWEEN.Easing.Elastic.Out).chain(
        new TWEEN.Tween(obj.position).to(target, 1000)
        .easing(TWEEN.Easing.Exponential.In),
        new TWEEN.Tween(obj.rotation).to({
          x: util.randInt(-2, 2),
          y: util.randInt(-2, 2),
          z: util.randInt(-2, 2)}, 1000)
        .easing(TWEEN.Easing.Exponential.In)
      ).delay(1000).start();
  }
}


var attendee_id = 'test';
var space = new Space();
var planet, lastCheckout;
var lastTime = Date.now();
function checkForUpdates() {
  util.request(`${config.API_URL}/checkouts/${config.HOSTNAME}`, (data) => {
    var checkouts = data.checkouts;
    var lastCheckout = checkouts.pop();
    if (planet === undefined || planet.attendee_id !== lastCheckout.attendee_id) {
      // destroy previous planet if there is one
      if (planet) {
        space.scene.remove(planet.planet);
      }
      planet = new Planet(space, attendee_id);
      console.log('new planet!');
    } else if (planet.lastCheckout.book_id != lastCheckout.book_id) {
      // smash it into the planet!!!
      planet.nextEvent(lastCheckout, true);
      planet.lastCheckout = lastCheckout;
      console.log('smash!!!');
    } else {
      console.log('nothing new...');
    }
  });
}
checkForUpdates();
space.start(function() {
  if (planet && planet.planet) {
    planet.planet.rotation.y += 0.0008;
  }

  // poll for changes
  var elapsed = Date.now() - lastTime;
  if (elapsed > 2000) {
    checkForUpdates();
    lastTime = Date.now();
  }
});
