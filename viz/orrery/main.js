import $ from 'jquery';
import _ from 'lodash'
import * as THREE from 'three';
import Vue from 'vue'

window.$ = $;

import OrbitControls from './orbit';
import Planet from './Planet';
import Starfield from './Starfield';
import UI from './UI';

const CAMERATYPE = 'persp'; // or 'ortho'
var timerCounter = 0;


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

    var group = new THREE.Group();

    this.scene.add(group)
    this.orrery = group;

    this.planetGroup = new THREE.Group();
    this.planetGroup.name = "planetGroup";
		this.orrery.add(this.planetGroup);

    this.planets = {};

    this.planetFocusID = null;
    this.lastFewPlanets = [];
    this.lastFewPlanetN = 3;

    this.populate();

    this.UI = new UI({
        renderer: this.renderer,
        scene: this.scene,
        camera: this.camera,
        orrery: this
    });
    console.log("CALL");
    // var axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );
  }


  addPlanet(planetattr) {
    var planet = new Planet(planetattr);
    this.planets[planet.id] = planet;
    planet.addToScene(this.planetGroup);
    this.planetFocusID = planet.id

    // last few planets is a queue
    this.lastFewPlanets.push(planet.id);
    if(this.lastFewPlanets.length > this.lastFewPlanetN) { this.lastFewPlanets.shift(); }
  }

  populate() {

    this.starfield = new Starfield({
      count: 5000,
      distance: 100,
      size_range: [0.1, 1.0],
      size_count: 4,
      colors: [0xffffff, 0xEEEEEE, 0xDDDDDD]
    });
    this.starfield.addToScene(this.orrery);

    window.THREE = THREE;

///// planets

    this.planetN = 210;
    for (var i=0; i<this.planetN; i++) {
      var planetattr = {
                            id: "randomplanet-" + i,
                            pos: Planet.randomPos({ radius: 2}),
                            vel: Planet.randomVel(),
                            rot: Planet.randomRot(),
                            moving: true,
                            mass: 1,
                            attr: { color: randomColor(),
                                    name: "Planet-" + i,
                                    planetN: this.planetN,
                                    debugArrows: false,
                                     }
                         }
      if('params' in window && 'randomplanets' in window.params && window.params.randomplanets != false) {
        this.addPlanet(planetattr);
      }

    }
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
                            mass: 300,
                            moving: false,
                            attr: { color: 0xfcf80c,
                                    name: "Sun",
                                    debugArrows: false,
                                    materialOverride: new THREE.MeshPhongMaterial({
                                      color: 0xce3221,
                                      emissive: 0xc3c259,
                                      specular: 0xffffbf,
                                      shininess: 20,
                                      transparent: false,
                                      opacity: 0.9 }),
                            }
                    }
    this.addPlanet(sunattr);


    window.planets = this.planets;

  }

  render() {
    timerCounter++;
    var self = this;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    this.orrery.rotation.y += 0.002;
    this.orrery.rotation.x = Math.sin(timerCounter / 100) / 10;
    _.each(self.planets, function(v, k) {
       v.update(self.planets)
    });

    if(this.planetFocusID in this.planets) {
      this.UI.movePlanetFrame({
        obj: this.planets[this.planetFocusID],
        pos: this.planets[this.planetFocusID].pos
      });
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
      canvas: document.getElementById('orrery')
    });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.setSize(width, height);

    this.scene = new THREE.Scene();
    if (CAMERATYPE === 'persp') {
      this.camera = new THREE.PerspectiveCamera(45, aspect, .1, 20000);
      this.camera.zoom = 2.5;
    } else {
      this.camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, 1, 1000),
      this.camera.zoom = 0.08;
    }

    this.camera.position.set(-3, 3, 3);
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


  _setupLights() {
    var pointLight = new THREE.PointLight(0xffffff, 3.3, 2);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.3, 50);
    pointLight.position.set(0, 20, 0);
    this.scene.add(pointLight);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    this.scene.add(new THREE.HemisphereLight(0xCCF0FF, 0xFFA1C7, 0.3));
  }
}

/////////////////////
/////////////////////
//

var APIbase = "https://library.cybernetics.social"
var planets_endpoint = "/planets"
var data = {}; data.planets = {};
var planetFocusID;
var fetchTimer;

function startApiLoop() {
    fetchData();
    fetchTimer = setInterval(fetchData, 1 * 1000)
  }

function fetchData() {
  $.getJSON(APIbase + planets_endpoint, function(newdata) {
    if(!(_.isEqual(data, newdata))) {
      var diffkeys = _.difference(_.keys(newdata), _.keys(data));
      if( diffkeys.length > 0) {
        // there are new planets!

        _.each(diffkeys, function(k) {
          var thisplanet = newdata[k];
          console.log(k);

          var planetattr = {
                          id: k,
                          pos: Planet.randomPos({ radius: 2 }),
                          vel: Planet.randomVel(),
                          rot: Planet.randomRot(),
                          mass: thisplanet.checkouts,
                          moving: true,
                          attr: { color: new THREE.Color(thisplanet.color),
                                  name: thisplanet.name,
                                  debugArrows: false,
                          }
                  }
          console.log(planetattr);
          orrery.addPlanet(planetattr);

        });
        data = newdata;
      } else {
        // no new planets, but planet attributes have changed

				function diffBetweenObjects(a, b) {
					// from https://stackoverflow.com/questions/31683075/how-to-do-a-deep-comparison-between-2-objects-with-lodash
					return _.reduce(a, function(result, value, key) {
							return _.isEqual(value, b[key]) ?
									result : result.concat(key);
					}, []);
        }
        var diff = diffBetweenObjects(data, newdata);
        orrery.planetFocusID = diff[0];

        _.each(diff, function(pid) {
          // last few planets is a queue
          orrery.lastFewPlanets.push(pid);
          if(orrery.lastFewPlanets.length > orrery.lastFewPlanetN) { orrery.lastFewPlanets.shift(); }
        });


        console.log("no new planets, but planet attributes have changed");
        console.log(diff);
        data = newdata;
      }
    } else {
      // nothing has changed!
      console.log("no change");

    }
  })
}

// process url parameters into an obj; this is so that the planet name can be hidden when an iframe calls it. -Dan
function processUrlParams() {
  var search = window.location.search;
  let hashes = search.slice(search.indexOf('?') + 1).split('&')
  var params = hashes.reduce((params, hash) => {
      let [key, val] = hash.split('=')
      return Object.assign(params, {[key]: decodeURIComponent(val)})
  }, {})
  window.params = params;
}
processUrlParams();



///////////////////
////////////////////
//
window.THREE = THREE;
var orrery = new Orrery();
window.orrery = orrery;
orrery.render();
startApiLoop();



