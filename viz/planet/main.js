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

function genObject(topic) {
  // generate random object for topic
  var height = 2,
      mat = genMat(topic),
      geo = new THREE.CylinderGeometry(util.rand(1,4)/4, util.rand(1,4)/4, height, 8);
  geo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, height/2, 0 ) ); // set pivot to origin
  var obj = new THREE.Mesh(geo, mat);
  for (var i=0; i<util.randInt(1, 5); i++) {
    var nextHeight = util.rand(1,4)/4;
    var geo = new THREE.CylinderGeometry(util.rand(1,4)/4, util.rand(1,4)/4, nextHeight, 8);
    var mesh = new THREE.Mesh(geo, mat);
    obj.add(mesh);
    height += nextHeight;
  }
  obj.rotation.set(util.rand(-3, 3), util.rand(-3, 3), util.rand(-3,3));
  return obj;
}


class Planet {
  constructor(space, attendee_id) {
    this.space = space;
    this.attendee_id = attendee_id;
    this.lastHash = md5(attendee_id);

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
      var lastCheckout = data.checkouts.pop();
      data.checkouts.map(c => this.nextEvent(c, false));
      this.nextEvent(lastCheckout, true); // animate the last checkout
    });
  }

  // compute object placement for checkout
  nextEvent(checkout, animate) {
    this.lastHash = md5(this.lastHash + checkout['book_id']);
    var coords = util.hashToPoint(this.lastHash); // where the object spawns

    // TODO get this from checkout/book
    var topic = util.choice(['biology', 'architecture', 'society', 'technology', 'economy']);
    var obj = genObject(topic);

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
var planet = new Planet(space, attendee_id);
space.start(function() {
  if (planet.planet) {
    planet.planet.rotation.y += 0.0008;
  }

  // TODO
  // poll for changes
});
