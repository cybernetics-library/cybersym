import $ from 'jquery';
import * as THREE from 'three';
import OrbitControls from './orbit';

const CAMERATYPE = 'persp'; // or 'ortho'



function uniform(rng) {
  var [l, u] = rng;
  return Math.round(l + Math.random() * (u-l));
}

function choice(choices) {
  var idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

// <https://stackoverflow.com/a/13542669/1097920>
function shadeColor(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}



class Earth {
  constructor() {
    this._setupScene();
    this._setupLights();

    var geometry = new THREE.SphereGeometry(1, 32, 32);
    // var material = new THREE.MeshBasicMaterial({color: 0x93bcff});
    var material = new THREE.MeshPhongMaterial({color: 0x93bcff, shading: THREE.FlatShading});
    // var material = new THREE.MeshPhongMaterial({color: 0x93bcff, shading: THREE.FlatShading, wireframe: true});

    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(6,6,6);
    // mesh.rotation.set(-0.4,0,-0.4);
    this.scene.add(mesh);
    this.earth = mesh;
//    this.populate();

    // var axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );
  }

  populate() {
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    if (this.earth) {
    }
  }

  _setupScene() {
    var width = window.innerWidth,
        height = window.innerHeight,
        aspect = width/height,
        D = 1;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      canvas: document.getElementById('earth')
    });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();
    if (CAMERATYPE === 'persp') {
      this.camera = new THREE.PerspectiveCamera(45, aspect, .1, 20000);
      this.camera.zoom = 2;
    } else {
      this.camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, 1, 1000),
      this.camera.zoom = 0.08;
    }

    this.camera.position.set(-20, 20, 20);
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false; // to keep speech bubble more consistently placed

    var self = this;
    window.addEventListener('resize', function() {
      var width = mainEl.clientWidth,
          height = mainEl.clientHeight;
      self.camera.aspect = width/height;
      self.camera.updateProjectionMatrix();
      self.renderer.setSize(width, height);
    }, false);
  }

  _setupLights() {
    var pointLight = new THREE.PointLight(0xffffff, 0.3, 50);
    pointLight.position.set(0, 20, 0);
    this.scene.add(pointLight);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    this.scene.add(new THREE.HemisphereLight(0xCCF0FF, 0xFFA1C7, 0.3));
  }
}

var start = function() {
  console.log("YDO");
  var e = new Earth();
  e.render();
}

module.exports = start;
