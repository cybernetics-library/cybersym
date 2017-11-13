import TWEEN from 'tween.js';
import * as THREE from 'three';

const hostname = 'anarres';
const apiURL = `http://library.cybernetics.social/checkouts/${hostname}`;
//const apiURL = `http://library.cybernetics.social/checkouts/${hostname}`;

const PLANET_RADIUS = 6;
const PLANET_PADDING = 2;
const COLORS = {
  'economy': 0xef0707,
  'biology': 0x09a323,
  'architecture': 0xe5c212,
  'society': 0x4286f4,
  'technology': 0xff87c7
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

    var geometry = new THREE.SphereGeometry(PLANET_RADIUS, 48, 48);
    var material = new THREE.MeshPhongMaterial({color: 0x93bcff, shading: THREE.FlatShading});
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    this.planet = mesh;

    this.camera.lookAt(scene.position);
    this.scene = scene;
    this.skybox = skybox;

    // TODO testing
    setInterval(() => {
      var topic = choice(['biology', 'architecture', 'society', 'technology', 'economy']);
      this.spawnAndCrashObj(topic);
    }, 2000);

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
    // xhr.open('GET', apiURL);
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

  spawnAndCrashObj(topic) {
    var obj = genObject(topic);

    // select random spawn point safely off-world
    var pos = {
      x: choice([randInt(-20, -PLANET_RADIUS-PLANET_PADDING), randInt(PLANET_RADIUS+PLANET_PADDING, 20)]),
      y: choice([randInt(-20, -PLANET_RADIUS-PLANET_PADDING), randInt(PLANET_RADIUS+PLANET_PADDING, 20)]),
      z: choice([randInt(-20, -PLANET_RADIUS-PLANET_PADDING), randInt(PLANET_RADIUS+PLANET_PADDING, 20)])
    };
    obj.position.set(pos.x, pos.y, pos.z);

    // so it pops into existence
    obj.scale.set(0,0,0);

    // add as child to planet so it follows rotation
    this.planet.add(obj);

    // find closest point on sphere
    var vec = new THREE.Vector3();
    vec.sub(obj.position, new THREE.Vector3(0,0,0));
    vec.normalize();
    vec.multiplyScalar(PLANET_RADIUS);

    if (DEBUG) {
      // mark where object will hit
      var geo = new THREE.SphereGeometry(0.2, 16, 16);
      var material = new THREE.MeshPhongMaterial({color: 0xff0000, shading: THREE.FlatShading});
      var mesh = new THREE.Mesh(geo, material);
      mesh.position.set(vec.x, vec.y, vec.z);
      this.planet.add(mesh);
    }

    // animate: spawn (scale), crashing (rotation and position)
    new TWEEN.Tween(obj.scale).to({x:1, y:1, z:1}, 2000)
      .easing(TWEEN.Easing.Elastic.Out).chain(
        new TWEEN.Tween(obj.position).to(vec, 1000)
        .easing(TWEEN.Easing.Exponential.In),
        new TWEEN.Tween(obj.rotation).to({
          x: randInt(-2, 2),
          y: randInt(-2, 2),
          z: randInt(-2, 2)}, 1000)
        .easing(TWEEN.Easing.Exponential.In)
      ).delay(1000).start();
}


}

var scene = new Planet();
scene.init();
scene.start();
