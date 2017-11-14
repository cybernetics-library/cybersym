import TWEEN from 'tween.js';
import * as THREE from 'three';
import md5 from 'blueimp-md5';

const HOSTNAME = 'anarres';
const API_URL = `http://library.cybernetics.social/checkouts/${HOSTNAME}`;
const DEBUG = false;

const MAX_RADIUS = 20;
const PLANET_RADIUS = 6;
const PLANET_PADDING = 2;
const MIN_RADIUS = PLANET_RADIUS + PLANET_PADDING;
const COLORS = {
  'economy': 0xef0707,
  'biology': 0x09a323,
  'architecture': 0xe5c212,
  'society': 0x4286f4,
  'technology': 0xff87c7
}

var planetMesh;

function hashString(str) {
  var hash = md5(str);
  return {
    hash: hash,

    int: parseInt(hash.substring(0, 12), 16)
  };
}

function inMinRadius(v) {
  return v >= -MIN_RADIUS && v <= MIN_RADIUS;
}

// TODO testing
var attendee_id = 'foobar';
var checkouts = [{
  book_id: 'Science, Logic and Political Action',
}, {
  book_id: 'Applied Mathematics Book',
}, {
  book_id: 'Organizational Behavior',
}];

// compute object placement for checkout
function nextEvent(checkout, animate) {
  var lastHash = md5(lastHash + checkout['book_id']),
      coords = hashToCoords(lastHash); // where the object spawns

  // check if point is inside planet
  // if so, move a dimension outside of the sphere
  if (inMinRadius(coords.x) && inMinRadius(coords.y) && inMinRadius(coords.x)) {
    // take the first chars so the resulting integer
    // is more manageable. 12 is an arbitrary number
    var int = parseInt(lastHash.substring(0, 12), 16);

    // get dimension to move
    var dim = int % 3;

    // move by positive or negative radius
    var pn = int % 2,
        shift = pn == 0 ? -MIN_RADIUS : MIN_RADIUS;
    if (dim == 0) {
      coords.x += shift;
    } else if (dim == 1) {
      coords.y += shift;
    } else {
      coords.z += shift;
    }
  }

  var topic = choice(['biology', 'architecture', 'society', 'technology', 'economy']);
  var obj = genObject(topic);

  // add as child to planet so it follows rotation
  planetMesh.add(obj);
  obj.position.set(coords.x, coords.y, coords.z);

  // find closest point on sphere
  var target = new THREE.Vector3();
  target.sub(obj.position, new THREE.Vector3(0,0,0));
  target.normalize();
  target.multiplyScalar(PLANET_RADIUS);

  if (animate) {
    crashIntoPlanet(obj, target);
  } else {
    obj.position.set(target.x, target.y, target.z);
  }
}

function crashIntoPlanet(obj, target) {
    // so it pops into existence
    obj.scale.set(0,0,0);

    if (DEBUG) {
      // mark where object will hit
      var geo = new THREE.SphereGeometry(0.2, 16, 16);
      var material = new THREE.MeshPhongMaterial({color: 0xff0000, shading: THREE.FlatShading});
      var mesh = new THREE.Mesh(geo, material);
      mesh.position.set(target.x, target.y, target.z);
      planetMesh.add(mesh);
    }

    // animate: spawn (scale), crashing (rotation and position)
    new TWEEN.Tween(obj.scale).to({x:1, y:1, z:1}, 2000)
      .easing(TWEEN.Easing.Elastic.Out).chain(
        new TWEEN.Tween(obj.position).to(target, 1000)
        .easing(TWEEN.Easing.Exponential.In),
        new TWEEN.Tween(obj.rotation).to({
          x: randInt(-2, 2),
          y: randInt(-2, 2),
          z: randInt(-2, 2)}, 1000)
        .easing(TWEEN.Easing.Exponential.In)
      ).delay(1000).start();
}


var lastHash = md5(attendee_id);
function eventChain(checkouts) {
  return checkouts.map(c => nextEvent(c, false));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max));
}

function choice(choices) {
  var idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

function genMat(topic) {
  var color = COLORS[topic];
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
      geo = new THREE.CylinderGeometry(rand(1,4)/4, rand(1,4)/4, height, 8);
  geo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, height/2, 0 ) ); // set pivot to origin
  var obj = new THREE.Mesh(geo, mat);
  for (var i=0; i<randInt(1, 5); i++) {
    var nextHeight = rand(1,4)/4;
    var geo = new THREE.CylinderGeometry(rand(1,4)/4, rand(1,4)/4, nextHeight, 8);
    var mesh = new THREE.Mesh(geo, mat);
    obj.add(mesh);
    height += nextHeight;
  }
  obj.rotation.set(rand(-3, 3), rand(-3, 3), rand(-3,3));
  return obj;
}

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
  return v * MAX_RADIUS;
}

function hashToCoords(str) {
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

class Planet {
  constructor() {
    this.objs = {};
    this.names = {};
  }

  init() {
    this.initComponents();
    this.initScene();
    this.initUI();
    this.update();
  }

  initScene() {
    // setup scene
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xCCCCFF, 0.03);

    // setup lighting
    var ambient = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(ambient);
    var pointLight = new THREE.PointLight(0xffffff,0.2);
    scene.add(pointLight);
    pointLight.position.set(0, 1, 0);

    // setup skybox/dome
    var skygeo = new THREE.SphereGeometry(100, 60, 40);
    var skymat = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('/skybox.png'),
      side: THREE.BackSide,
      fog: false
    })
    var skybox = new THREE.Mesh(skygeo, skymat);
    scene.add(skybox);

    // create the planet
    // TODO get attendee color
    var geometry = new THREE.SphereGeometry(PLANET_RADIUS, 48, 48);
    var material = new THREE.MeshPhongMaterial({color: 0x93bcff, shading: THREE.FlatShading, wireframe: false});
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    this.planet = mesh;
    planetMesh = this.planet;

    this.camera.lookAt(scene.position);
    this.scene = scene;
    this.skybox = skybox;
  }

  initComponents() {
    // setup DOM
    var container = document.createElement('div');
    document.body.appendChild(container);

    var tooltip = document.createElement('div');
    container.appendChild(tooltip);
    tooltip.className = 'tooltip';

    // setup renderer
    var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true, antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.0);
    container.appendChild(renderer.domElement);

    // setup camera
    var D = 1,
        aspect = window.innerWidth/window.innerHeight,
        camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, 1, 1000);
    camera.zoom = 0.08;
    camera.position.set(0, 10, 20);
    camera.updateProjectionMatrix();

    // on resize
    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    this.camera = camera;
    this.renderer = renderer;
    this.tooltip = tooltip;
  }

  initUI() {
    this.renderer.domElement.addEventListener('mousemove', ev => {
      var mouse = {
        x: (ev.clientX/this.renderer.domElement.clientWidth) * 2 - 1,
        y: -(ev.clientY/this.renderer.domElement.clientHeight) * 2 + 1
      };
      var raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, this.camera);

      var intersects = raycaster.intersectObjects(Object.values(this.objs));
      if (intersects.length > 0) {
        var obj = intersects[0].object;
        this.tooltip.innerHTML = this.names[obj.uuid];
        this.tooltip.style.left = `${ev.clientX + 20}px`;
        this.tooltip.style.top = `${ev.clientY}px`;
        this.tooltip.style.display = 'block';
      } else {
        this.tooltip.style.display = 'none';
      }
    }, false);
  }

  update() {
    var self = this,
        xhr = new XMLHttpRequest();
    // xhr.open('GET', API_URL);
    // xhr.onload = function() {
    //   var data = JSON.parse(xhr.responseText);
    // };
    // xhr.send();
  }

  start() {
    requestAnimationFrame(this.start.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.skybox.rotation.y += 0.0008;
    this.planet.rotation.y += 0.0008;
    this.update();
    TWEEN.update();
  }
}

var scene = new Planet();
scene.init();

// TODO testing
eventChain(checkouts);
nextEvent({book_id: 'yoyoyo'}, true);

scene.start();
