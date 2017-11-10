import $ from 'jquery';
import * as THREE from 'three';
import OrbitControls from './orbit';

const CAMERATYPE = 'persp'; // or 'ortho'

function uniform(rng) {
  var [l, u] = rng;
  return Math.round(l + Math.random() * (u-l));
}

class Being {
  constructor(popSize, geometry, color, altitude) {
    this.velocity = {
      x: 0,
      y: 0,
      z: 0
    };

    var center = {
      x: Math.random() * Math.PI*2,
      y: Math.random() * Math.PI*2
    };
    var material = new THREE.MeshBasicMaterial({color: color});

    this.group = new THREE.Group();
    this.herd = [];
    for (var i=0; i<popSize; i++) {
      var member = new THREE.Mesh(geometry, material);
      var box = new THREE.Box3().setFromObject(member);
      var height = box.size().y;
      member.s = new THREE.Spherical(
        1+altitude+height/2,
        center.x + (Math.random() - 1)/8,
        center.y + (Math.random() - 1)/8);
      member.position.setFromSpherical(member.s);
      this.herd.push(member);
      this.group.add(member);
    }
  }

  update() {
    this.group.rotation.x += this.velocity.x;
    this.group.rotation.y += this.velocity.y;
    this.group.rotation.z += this.velocity.z;
  }
}

class System {
  constructor(n, herdSizes, geo, color, altitude) {
    this.beings = [];
    for (var i=0; i<n; i++) {
      var being = new Being(uniform(herdSizes), geo, color, altitude);
      this.beings.push(being);
    }
  }

  setVelocities(velocity) {
    this.beings.map(b => b.velocity = velocity);
  }

  update() {
    this.beings.map(b => b.update());
  }
}


class Earth {
  constructor() {
    this._setupScene();
    this._setupLights();

    var geometry = new THREE.SphereGeometry(1, 32, 32);
    var material = new THREE.MeshBasicMaterial({color: 0x93bcff});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(6,6,6);
    // mesh.rotation.set(-0.4,0,-0.4);
    this.scene.add(mesh);
    this.earth = mesh;
    this.populate();
  }

  populate() {
    this.systems = [];
    var forests = new System(24, [5,8],
      new THREE.ConeGeometry(0.02, 0.08, 4),
      0x10a025, 0);
    var people = new System(12, [5,8],
      new THREE.SphereGeometry(0.02, 32, 4),
      0x134fb2, 0);
    var birds = new System(12, [8,16],
      new THREE.ConeGeometry(0.01, 0.03, 4),
      0xf3ff21, 0.1);
    people.beings.map(b => {
      b.velocity = {
        x: (Math.random() - 1)/100,
        y: (Math.random() - 1)/100,
        z: (Math.random() - 1)/100
      }
    });
    birds.beings.map(b => {
      b.velocity = {
        x: (Math.random() - 1)/100,
        y: (Math.random() - 1)/100,
        z: (Math.random() - 1)/100
      }
    });
    this.systems.push(forests);
    this.systems.push(people);
    this.systems.push(birds);
    this.systems.map(s => s.beings.map(b => this.earth.add(b.group)));
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    if (this.earth) {
      this.earth.rotation.y += 0.001;
      this.systems.map(s => s.update());
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
        if (CAMERATYPE === 'persp') {
          this.controls.minDistance = 10;
          this.controls.maxDistance = 50;
        } else {
          this.controls.maxZoom = 0.2;
          this.controls.minZoom = 0.1;
    }

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

var e = new Earth();
e.render();
