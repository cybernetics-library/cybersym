import $ from 'jquery';
import * as THREE from 'three';
import OrbitControls from './orbit';
import {System, Being} from './Being';
import Boid from './Boid';

var timer = new Timer();
const CAMERATYPE = 'persp'; // or 'ortho'


function choice(choices) {
  var idx = Math.floor(Math.random() * choices.length);
  return choices[idx];
}

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




class Orrery {
  constructor() {
    this._setupScene();
    this._setupLights();

    var geometry = new THREE.SphereGeometry(1, 32, 32);
    // var material = new THREE.MeshBasicMaterial({color: 0x93bcff});
		var material = new THREE.MeshPhongMaterial({color: 0x93bcff, shading: THREE.FlatShading, wireframe: true});

    this.populate();

    this._setupUI();
    // var axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );
  }

  populate() {

	///// systems
    this.systems = [];
    var birds = new System(20, [8,16],
      new THREE.ConeGeometry(0.01, 0.23, 4),
      '#f3ff21', 0.1);
    birds.beings.forEach(b => {
      b.velocity = {
        x: (Math.random() - 1)/200,
        y: (Math.random() - 1)/200
      }
    });
    this.systems.push(birds);
    this.systems.forEach(s => s.beings.forEach(b => this.scene.add(b.group)));

    window.birds = birds;
    window.THREE = THREE;

///// planets
    this.planetGroup = new THREE.Group();
    this.planetGroup.name = "planetGroup";

		this.planets = [];
    this.planetN = 5;
    for (var i=0; i<this.planetN; i++) {
      var planet = new Boid({ pos: Boid.randomPos(),
                            vel: Boid.randomVel(),
                            rot: Boid.randomRot(),
                            mass: 3,
                            attr: { color: 0x12FF33,
                                    name: "Boid-" + i,
                                    planetN: this.planetN } });
      this.planets.push(planet);
    }
		this.planets.forEach(p => p.addToScene(this.planetGroup));
		this.scene.add(this.planetGroup);

    window.planets = this.planets;

  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
		this.systems.forEach(s => s.update());
    this.planets.forEach(b => b.update(this.planets));
  }

  _setupScene() {
    var width = window.innerWidth,
        height = window.innerHeight,
        aspect = width/height,
        D = 1;

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      canvas: document.getElementById('orrery')
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

    this.camera.position.set(-5, 5, 5);
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false; // to keep speech bubble more consistently placed

    var self = this;
    window.addEventListener('resize', function() {
      var width = window.innerWidth,
          height = window.innerHeight;
      self.camera.aspect = width/height;
      self.camera.updateProjectionMatrix();
      self.renderer.setSize(width, height);
    }, false);
  

  }

  _setupUI() {
    this.tooltip = document.getElementById('tooltip')

    this.renderer.domElement.addEventListener('mousemove', ev => {
      var mouse = {
        x: (ev.clientX/this.renderer.domElement.clientWidth) * 2 - 1,
        y: -(ev.clientY/this.renderer.domElement.clientHeight) * 2 + 1
      };
      var raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, this.camera);

      var intersects = raycaster.intersectObjects(this.scene.getObjectByName( "planetGroup" , true).children, true);
      if (intersects.length > 0) {
        var obj = intersects[0].object;
        this.tooltip.innerHTML = obj.name;
        this.tooltip.style.left = `${ev.clientX + 20}px`;
        this.tooltip.style.top = `${ev.clientY}px`;
        this.tooltip.style.display = 'block';
      } else {
        this.tooltip.style.display = 'none';
      }
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

var orrery = new Orrery();
window.orrery = orrery;
orrery.render();
