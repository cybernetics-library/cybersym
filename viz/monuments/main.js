import TWEEN from 'tween.js';
import * as THREE from 'three';

const apiURL = "http://localhost:5000/monuments";

// const maxScale = 16;
// var scale = 8;
const maxScale = 0.16;
var scale = 0.08;
const nObjs = 5;
const matColors = [
  0xffffff,
  0xffc1fa,
  0x4286f4,
  0x9bf7da
];
const bgColors = [
  // 0x42f48f,
  // 0x3c0968,
  // 0xf43a3a,
  0x8eb7f9
];
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

function choice(opts) {
  var idx = Math.floor(Math.random() * opts.length);
  return opts[idx];
}

function randGeo() {
  var type = choice(['box', 'torus', 'cylinder']);
  var baseSize = 10;
  var height = 20;
  switch (type) {
      case 'box':
        return new THREE.BoxGeometry(baseSize, height, baseSize);
      case 'torus':
        return new THREE.TorusGeometry(height/4, baseSize/2, randInt(12,20), randInt(12,20), Math.PI);
      case 'cylinder':
        return new THREE.CylinderGeometry(rand(5,12), rand(5,12), height, randInt(12,36));
  }
}

function randMat() {
  var color = choice(matColors);
  var mat = new THREE.MeshLambertMaterial({color: color, refractionRatio: 0.95});
  mat.emissiveIntensity = 0.6;
  mat.emissive = {
        r: 0.45,
        g: 0.45,
        b: 0.45
  };
  return mat;
}

function randObj(theta) {
  var radius = 8;
  var geo = randGeo(),
      mat = randMat(),
      obj = new THREE.Mesh(geo, mat),
      box = new THREE.Box3().setFromObject(obj),
      size = box.getSize();
  geo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, size.y/2, 0 ) ); // set pivot to origin
  // obj.position.x = rand(posRange.x[0] * scale, posRange.x[1] * scale);
  // obj.position.z = rand(posRange.z[0] * scale, posRange.z[1] * scale);
  obj.position.x = Math.cos(theta) * radius;
  obj.position.z = Math.sin(theta) * radius;
  obj.rotation.y = rand(-20, 20);
  obj.scale.set(scale, scale, scale);
  return obj;
}

// setup scenes & lighting
var scene = new THREE.Scene();
// scene.fog = new THREE.FogExp2(0xE9E9E9, 0.03);
var ambient = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
scene.add(ambient);
// var ambient = new THREE.AmbientLight(0xffffff);
// scene.add(ambient);
var pointLight = new THREE.PointLight(0xffffff,0.2);
scene.add(pointLight);
pointLight.position.set(0, 1, 0);

    var urls = [
      '/px.jpg',
      '/nx.jpg',
      '/py.jpg',
      '/ny.jpg',
      '/py.jpg',
      '/nz.jpg'
    ];

    var urls = [
      '/ely_peaks/peaks_ft.png',
      '/ely_peaks/peaks_bk.png',
      '/ely_peaks/peaks_up.png',
      '/ely_peaks/peaks_dn.png',
      '/ely_peaks/peaks_rt.png',
      '/ely_peaks/peaks_lf.png'
    ];

 var materialArray = [];
 for (var i = 0; i < 6; i++) {
   var map = THREE.ImageUtils.loadTexture( urls[i] );
  materialArray.push( new THREE.MeshBasicMaterial({
   map: map,
   side: THREE.BackSide,
    fog: false
  }));
 }

// choose scene background
// var backgrounds = bgColors.map(c => new THREE.Color(c));
// scene.background = choice(backgrounds);

// create objects
var objs = [];
var names = {};
var xhr = new XMLHttpRequest()
xhr.open('GET', apiURL)
xhr.onload = function() {
  var monuments = JSON.parse(xhr.responseText);
  Object.keys(monuments.names).map((topic, i) => {
    var name = monuments.names[topic];
    var obj = randObj(i * (2*Math.PI)/Object.keys(monuments.names).length);
    scene.add(obj);
    objs.push(obj);
    names[obj.uuid] = name;
  });
}
xhr.send()

function scaleObjs() {
  scale *= 1.2;
  scale = Math.min(scale, maxScale);
  for (var i=0; i<nObjs; i++) {
    new TWEEN.Tween(objs[i].scale).to({
          x: scale,
          y: scale,
          z: scale
        }, 2000)
    .easing(TWEEN.Easing.Elastic.Out).start();
  }
}

// setup plumbing
var container = document.createElement('div');
var tooltip = document.createElement('div');
container.appendChild(tooltip);
tooltip.style.position = 'fixed';
tooltip.className = 'monument-tooltip';
var aspect = window.innerWidth/window.innerHeight;
document.body.appendChild(container);
var camera = new THREE.PerspectiveCamera(50, aspect, 1, 5000);
var D = 1;
var camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, 1, 1000);
camera.zoom = 0.08;

camera.position.z = 20;
camera.position.y = 10;
camera.lookAt(scene.position);
camera.updateProjectionMatrix();
var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true, antialias: false });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);


 // var skyGeometry = new THREE.CubeGeometry( 1000, 1000, 1000 );
 // var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
 // var skybox = new THREE.Mesh( skyGeometry, skyMaterial );
var skyGeometry = new THREE.SphereGeometry(100, 60, 40);
var skyMaterial = new THREE.MeshBasicMaterial({
  map: THREE.ImageUtils.loadTexture('/skybox.png'),
  side: THREE.BackSide
})
 var skybox = new THREE.Mesh( skyGeometry, skyMaterial );
skybox.renderDepth = 1000.0;
scene.add(skybox);

renderer.setClearColor(0x000000, 0.0);

renderer.domElement.addEventListener('mousemove', function(ev) {
  var mouse = {
    x: (ev.clientX/renderer.domElement.clientWidth) * 2 - 1,
    y: -(ev.clientY/renderer.domElement.clientHeight) * 2 + 1
  };
  var raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(objs);
  if (intersects.length > 0) {
    var obj = intersects[0].object;
    tooltip.innerHTML = names[obj.uuid];
    tooltip.style.left = `${ev.clientX + 20}px`;
    tooltip.style.top = `${ev.clientY}px`;
    tooltip.style.display = 'block';
  } else {
    tooltip.innerHTML = '';
    tooltip.style.display = 'none';
  }
}, false);

renderer.domElement.addEventListener('click', function() {
  scaleObjs();
});

var plateauHeight = 25;
var geometry = new THREE.CylinderGeometry(10, 25, plateauHeight, 24);
var material = new THREE.MeshLambertMaterial({color: 0xffff00, refractionRatio: 0.95})
var plateau = new THREE.Mesh( geometry, material );
plateau.position.set(0, -plateauHeight/2, 0);
scene.add(plateau);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// render/animate
function run() {
  requestAnimationFrame(run);
  renderer.render(scene, camera);
  skybox.rotation.y += 0.0008;
  TWEEN.update();
}
run();
