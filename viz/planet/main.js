import TWEEN from 'tween.js';
import * as THREE from 'three';
import md5 from 'blueimp-md5';
import config from './config';
import util from './util';
import Space from './space';
import createMonument from '../monument';


class Planet {
  constructor(space, attendee_id) {
    this.space = space;
    this.attendee_id = attendee_id;
    this.lastHash = md5(attendee_id);

    this.objs = [];
    this.names = {}; // obj.uuid -> book title

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

      document.getElementById('planet-name').innerHTML = data.name;
      this.nextEvent(this.lastCheckout, true); // animate the last checkout
    });
  }

  // compute object placement for checkout
  nextEvent(checkout, animate) {
    this.lastHash = md5(this.lastHash + checkout['book_id']);
    var coords = util.hashToPoint(this.lastHash); // where the object spawns
    var obj = createMonument(checkout);

    // add as child to planet so it follows rotation
    this.planet.add(obj);
    obj.position.set(coords.x, coords.y, coords.z);
    this.objs.push(obj);
    this.names[obj.uuid] = checkout['title'];

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
    new TWEEN.Tween(obj.scale).to({x:2.5, y:2.5, z:2.5}, 2000)
      .easing(TWEEN.Easing.Elastic.Out).chain(
        new TWEEN.Tween(obj.position).to(target, 1000)
        .easing(TWEEN.Easing.Exponential.In),
        new TWEEN.Tween(obj.scale).to({x: 1, y: 1, z:1}, 1000)
        .easing(TWEEN.Easing.Exponential.In),
        new TWEEN.Tween(obj.rotation).to({
          x: util.randInt(-2, 2),
          y: util.randInt(-2, 2),
          z: util.randInt(-2, 2)}, 1000)
        .easing(TWEEN.Easing.Exponential.In)
      ).delay(1000).start();
  }
}


var space = new Space();
var planet, lastCheckout;
var lastTime = Date.now();
function checkForUpdates() {
  util.request(`${config.API_URL}/checkouts`, (data) => {
    if (lastCheckout === undefined) {
      lastCheckout = data.checkouts[data.checkouts.length - 1];
    }
    var toProcess = data.checkouts.filter(c => {
      return !planet || (c['timestamp'] > lastCheckout.timestamp);
    });
    if (toProcess.length === 0) {
      console.log('nothing new...');
      return;
    }

    // check who's planet we should be displaying
    lastCheckout = toProcess[toProcess.length - 1];
    if (planet === undefined || planet.attendee_id !== lastCheckout.attendee_id) {
      // destroy previous planet if there is one
      if (planet) {
        space.scene.remove(planet.planet);
      }
      planet = new Planet(space, lastCheckout.attendee_id);
      space.planet = planet;
      console.log('new planet!');
    }

    // filter down to events for that planet
    toProcess.filter(c => {
      return c.attendee_id == lastCheckout.attendee_id;
    }).map(c => {
      // smash it into the planet!!!
      planet.nextEvent(c, true);
      console.log('smash!!!');
    });
    planet.lastCheckout = lastCheckout;
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
