import $ from 'jquery';
import * as THREE from 'three';

const CAMERATYPE = 'persp'; // or 'ortho'
const loader = new THREE.JSONLoader();

function adjustMaterial(material, emit) {
  emit = emit || 0;
  material.shininess = 0;
  material.shading = THREE.FlatShading;
  material.map.generateMipmaps = false;
  material.map.magFilter = THREE.NearestFilter;
  material.map.minFilter = THREE.NearestFilter;
  if (emit) {
    material.emissiveIntensity = emit;
    material.emissive = {
      r: 0.45,
      g: 0.45,
      b: 0.45
    };
  }
}

function adjustMaterials(obj, emit) {
  if (obj.material) {
    if (obj.material.map) {
      adjustMaterial(obj.material, emit);
    } else if (obj.material.materials) {
      _.each(obj.material.materials, function(mat) {
        adjustMaterial(mat, emit);
      });
    }
  }
  obj.children.map(function(child) {
    adjustMaterials(child, emit);
  });
}

class MainMenu {
  constructor() {
    this._setupScene();
    this._setupLights();

    var self = this;
    loader.load('/earth.json', function(geo, mats) {
      var mesh = new THREE.Mesh(geo, new THREE.MeshFaceMaterial(mats));
      adjustMaterials(mesh, 0.35);
      mesh.scale.set(6,6,6);
      mesh.rotation.set(-0.4,0,-0.4);
      self.scene.add(mesh);
      self.earth = mesh;
    })
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    if (this.earth) {
      this.earth.rotation.y += 0.001;
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
      camera.zoom = 0.08;
    }

    this.camera.position.set(-20, 20, 20);
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();

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

var m = new MainMenu();
m.render();
