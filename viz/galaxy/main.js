import * as THREE from 'three';

var timer = new Timer();

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
  document.getElementById('question').innerHTML = question;
  document.getElementById('bubble').style.display = 'block';
}

function wonder() {
  timer = new Timer(wonder, 60*1000);
  fetch('http://localhost:5000/question').then(resp => {
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
space.start();
