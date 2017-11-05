import TWEEN from 'tween.js';
import * as THREE from 'three';

const apiURL = "http://localhost:5000/monuments";
const plateauRadius = 10;
const plateauHeight = 25;
const plateauBase = 25;
const plateauInset = 2;
const colors = {
  'military': 0xef0707,
  'biology': 0x09a323,
  'architecture': 0xe5c212
}

const maxScale = 0.16;
const baseScale = 0.08;
const posRange = {
  x: [-50, 50],
  y: [-40, 40],
  z: [-50, 50]
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max));
}

function genMat(topic) {
  var color = colors[topic];
  var mat = new THREE.MeshLambertMaterial({color: color, refractionRatio: 0.95});
  mat.emissiveIntensity = 0.6;
  mat.emissive = {
        r: 0.45,
        g: 0.45,
        b: 0.45
  };
  return mat;
}

function genMonument(topic) {
  var height = 20,
      mat = genMat(topic),
      geo = new THREE.CylinderGeometry(rand(5,12), rand(2,22), height, randInt(12,36));
  geo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, height/2, 0 ) ); // set pivot to origin
  var obj = new THREE.Mesh(geo, mat);
  for (var i=0; i<randInt(1, 5); i++) {
    var nextHeight = rand(5,12);
    var geo = new THREE.CylinderGeometry(rand(5,12), rand(5,12), nextHeight, randInt(12,36));
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, height, 0);
    obj.add(mesh);
    height += nextHeight;
  }
  return obj;
}


class Monuments {
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

    // setup plateau
    var geometry = new THREE.CylinderGeometry(plateauRadius, plateauBase, plateauHeight, 24);
    var material = new THREE.MeshLambertMaterial({color: 0xffff00})
    var plateau = new THREE.Mesh( geometry, material );
    plateau.position.set(0, -plateauHeight/2, 0);
    scene.add(plateau);

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
    xhr.open('GET', apiURL);
    xhr.onload = function() {
      var monuments = JSON.parse(xhr.responseText);
      Object.keys(monuments.names).map((topic, i) => {
        var name = monuments.names[topic];
        if (!(topic in self.objs)) {
          var obj = genMonument(topic),
              theta = i * (2*Math.PI)/Object.keys(monuments.names).length;
          obj.position.x = Math.cos(theta) * (plateauRadius - plateauInset);
          obj.position.z = Math.sin(theta) * (plateauRadius - plateauInset);
          obj.rotation.y = rand(-20, 20);
          obj.scale.set(baseScale, baseScale, baseScale);
          self.scene.add(obj);
          self.objs[topic] = obj;
          self.names[obj.uuid] = name;
        }
      });
      console.log(monuments.state);
      self.updateState(monuments.state);
    };
    xhr.send();
  }

  updateState(state) {
    Object.keys(state).map(topic => {
      this.scaleObj(topic, baseScale + state[topic]);
    });
  }

  scaleObj(topic, scale) {
    var obj = this.objs[topic];
    scale = Math.min(scale, maxScale);
    new TWEEN.Tween(obj.scale).to({
          x: scale,
          y: scale,
          z: scale
        }, 2000)
    .easing(TWEEN.Easing.Elastic.Out).start();
  }

  start() {
    requestAnimationFrame(this.start.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.skybox.rotation.y += 0.0008;
    this.update();
    TWEEN.update();
  }
}


var scene = new Monuments();
scene.init();

// testing
scene.renderer.domElement.addEventListener('click', function() {
  scene.scaleObj('military', 1.2);
});

scene.start();
