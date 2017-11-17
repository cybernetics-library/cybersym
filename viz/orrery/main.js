import $ from 'jquery';
import _ from 'lodash'
import * as THREE from 'three';
import Vue from 'vue'
import OrbitControls from './orbit';
import {System, Being} from './Being';
import Planet from './Planet';
import Starfield from './Starfield';

var timer = new Timer();
const CAMERATYPE = 'persp'; // or 'ortho'


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

function randomColor() {
  var cssHSL = "hsl(" + Math.round(360 * Math.random()) + ',' +
                    Math.round(25 + 70 * Math.random()) + '%,' + 
                     Math.round(45 + 10 * Math.random()) + '%)';
//  return new THREE.Color("hsl(0, 100%, 50%)");
  return new THREE.Color(cssHSL);
}


class Orrery {
  constructor() {
    this._setupScene();
    this._setupLights();

    var geometry = new THREE.SphereGeometry(6, 32, 32);
    // var material = new THREE.MeshBasicMaterial({color: 0x93bcff});
		var material = new THREE.MeshPhongMaterial({color: 0x93bcff, shading: THREE.FlatShading, wireframe: true});
    var group = new THREE.Group();

    this.scene.add(group)
    this.orrery = group;

    this.planetGroup = new THREE.Group();
    this.planetGroup.name = "planetGroup";
		this.orrery.add(this.planetGroup);

    this.planets = {};

    this.populate();

    this._setupUI();
    // var axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );
  }


  addPlanet(planetattr) {
    var planet = new Planet(planetattr);
    this.planets[planet.id] = planet;
    planet.addToScene(this.planetGroup);
  }

  populate() {

    this.starfield = new Starfield({
      count: 5000,
      distance: 100,
      size_range: [0.2, 1.0],
      size_count: 4,
      colors: [0xffffff, 0xEEEEEE, 0xDDDDDD]
    });
    this.starfield.addToScene(this.orrery);
    this.orrery.add(this.starfield.particles)

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
    this.systems.forEach(s => s.beings.forEach(b => this.orrery.add(b.group)));

    window.birds = birds;
    window.THREE = THREE;

///// planets

		//this.planets = [];
    //this.planetN = 210;
    //for (var i=0; i<this.planetN; i++) {
      //var planetattr = { pos: Planet.randomPos(),
                            //vel: Planet.randomVel(),
                            //rot: Planet.randomRot(),
                            //moving: true,
                            //mass: 1,
                            //attr: { color: randomColor(),
                                    //name: "Planet-" + i,
                                    //planetN: this.planetN,
                                    //debugArrows: true,
																		 //}
                         //}
      //this.addPlanet(planetattr);
    //}
    ////var moonattr = { pos: new THREE.Vector3(1,1,1),
                            ////vel: new THREE.Vector3(0,-0.005,0),
                            //rot: Planet.randomRot(),
                            //moving: true,
                            //mass: 3,
                            //attr: { color: 0x12FFF3,
                                    //name: "Moon",
                                    //planetN: this.planetN }
                     // }
    //this.addPlanet(moonattr);

    var sunattr = { 
                            id: "sunsunun",
                            pos: new THREE.Vector3(0,0,0),
                            vel: new THREE.Vector3(0,0,0),
                            rot: Planet.randomRot(),
                            mass: 30,
                            moving: false,
                            attr: { color: 0xfcf80c,
                                    name: "Sun",
                                    debugArrows: false,
                            }
                    }
    this.addPlanet(sunattr);


    window.planets = this.planets;

  }

  render() {
    var self = this;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
//    this.orrery.rotation.y += 0.001;
		this.systems.forEach(s => s.update());
    _.each(self.planets, function(v, k) {
       v.update(self.planets)
    });
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

/////////////////////
/////////////////////
//

var APIbase = "http://library.cybernetics.social"
var planets_endpoint = "/planets"
var data = {};
data.planets = {};

function startApiLoop() {
    fetchData();
  }

function fetchData() {
  $.getJSON(APIbase + planets_endpoint, function(newdata) {
    if(!(_.isEqual(data, newdata))) {
      var diffkeys = _.difference(_.keys(newdata), _.keys(data));
      if( diffkeys.length > 0) {

        _.each(diffkeys, function(k) {
          console.log(k);

          var planetattr = { 
                          id: k,
                          pos: Planet.randomPos(),
                          vel: Planet.randomVel(),
                          rot: Planet.randomRot(),
                          mass: 1,
                          moving: true,
                          attr: { color: new THREE.Color(newdata[k].color),
                                  name: "planet",
                                  debugArrows: true,
                          }
                  }
          console.log(planetattr);
          orrery.addPlanet(planetattr);

        });
        // there are new planets!
      } else {
        // no new planets, but planet attributes have changed
      }
    }
  })
}

///////////////////
////////////////////
//
window.THREE = THREE;
var orrery = new Orrery();
window.orrery = orrery;
orrery.render();
startApiLoop();

