import * as THREE from 'three';
import createMonument from '../monument';

// const API_URL = 'http://localhost:5000';
const API_URL = 'http://library.cybernetics.social';
var timer = new Timer();
var pivot = new THREE.Group();
var obj;

function Timer(callback, delay) {
  var timerId, start, remaining = delay;
  this.pause = function() {
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
    this.paused = true;
  };
  this.resume = function() {
    start = new Date();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, remaining);
    this.paused = false;
  };
  this.resume();
}

function ask(question) {
  if (obj) {
    pivot.remove(obj);
  }
  obj = createMonument(question);
  obj.scale.set(3,3,3);
  var box = new THREE.Box3().setFromObject(obj);
  box.center(obj.position); // this re-sets the mesh position
  obj.position.multiplyScalar(-1);
  pivot.add(obj);
  document.getElementById('question').innerHTML = question.question;
  document.getElementById('title').innerHTML = question.title;
  document.getElementById('bubble').style.display = 'block';
}

function wonder() {
  timer = new Timer(wonder, 60*1000);
  fetch(`${API_URL}/question`).then(resp => {
    return resp.json();
  }).then(json => {
    ask(json.question);
  });
}


class Space {
  constructor() {
    this.initComponents();
    this.initScene();
  }

  initComponents() {
    // setup DOM
    var container = document.createElement('div');
    document.body.appendChild(container);

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
      aspect = window.innerWidth / window.innerHeight;
      // for perspective cameras
      // camera.aspect = aspect;
      // for orthographic cameras
      camera.left = -D*aspect;
      camera.right = D*aspect;
      camera.top = D;
      camera.bottom = -D;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    this.camera = camera;
    this.renderer = renderer;
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

    this.camera.lookAt(scene.position);
    this.scene = scene;
  }

  start() {
    requestAnimationFrame(this.start.bind(this));
    if (obj) {
      pivot.rotation.y += 0.008;
    }
    this.renderer.render(this.scene, this.camera);
  }
}

// pause/resume on
document.addEventListener('keydown', function(ev) {
  if (ev.key == ' ') {
    if (timer.paused) {
      timer.resume();
      document.getElementById('paused').style.display = 'none';
    } else {
      timer.pause();
      document.getElementById('paused').style.display = 'block';
    }
  }
});

wonder();
var space = new Space();
space.scene.add(pivot);
space.start();
