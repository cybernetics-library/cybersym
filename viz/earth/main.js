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

function ask(question) {
  document.getElementById('question').innerHTML = question;
  document.getElementById('bubble').style.display = 'block';
}

class Being {
  constructor(popSize, geometry, color, altitude) {
    this.velocity = {
      x: 0,
      y: 0
    };

    var center = {
      x: Math.random() * Math.PI*2,
      y: Math.random() * Math.PI*2
    };
    // var material = new THREE.MeshBasicMaterial({color: color});
    var texture = new THREE.Texture(generateTexture(
      shadeColor(color, 0.3), shadeColor(color, -0.3)
    ));
    texture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5 } );

    this.group = new THREE.Group();
    this.herd = [];
    for (var i=0; i<popSize; i++) {
      var thisgeo = geometry.clone();
      thisgeo.applyMatrix( new THREE.Matrix4().makeRotationX(  Math.PI / 2 ) );
      var member = new THREE.Mesh(thisgeo, material);
      var box = new THREE.Box3().setFromObject(member);
      var height = box.size().y;
      member.s = new THREE.Spherical(
        1+altitude+height/2,
        center.x + (Math.random() - 1)/8,
        center.y + (Math.random() - 1)/8);
      member.position.setFromSpherical(member.s);
      // var axesHelper = new THREE.AxesHelper(0.1);
      // member.add(axesHelper);
      this.herd.push(member);
      this.group.add(member);
    }
  }

  update() {
    if (this.velocity.x || this.velocity.y) {
      this.herd.map(member => {
        member.s.phi += this.velocity.x;
        member.s.theta += this.velocity.y;
        member.position.setFromSpherical(member.s);
      });

      var o = new THREE.Vector3(0,0,0);
      var newDir = new THREE.Vector3();
      var quaternion = new THREE.Quaternion();
      var rotationAxis = new THREE.Vector3(0,0,1);
      this.herd.map(member => {



        var futureS = new THREE.Spherical(member.s.radius, member.s.phi + (this.velocity.x * 1), member.s.theta + (this.velocity.y * 1));
        var futureV = new THREE.Vector3();
        futureV.setFromSpherical(futureS);
        member.lookAt(futureV);

        //var curDir = member.getWorldDirection();
        //newDir.subVectors(member.position, o).normalize();
        //quaternion.setFromUnitVectors(curDir, newDir);
        //member.applyQuaternion(quaternion);
      });
    }
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

function generateTexture(c1, c2) {
	var size = 512;

	// create canvas
	var canvas = document.createElement( 'canvas' );
	canvas.width = size;
	canvas.height = size;

	// get context
	var context = canvas.getContext( '2d' );

	// draw gradient
	context.rect( 0, 0, size, size );
	// var gradient = context.createRadialGradient(0,0,0,0,size/2,size);
	var gradient = context.createLinearGradient( 0, 0, size, size );
	gradient.addColorStop(0, c1);
	gradient.addColorStop(0.5, c2);
	gradient.addColorStop(1, c1);
	context.fillStyle = gradient;
	context.fill();

	return canvas;
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
    this.populate();

    // var axesHelper = new THREE.AxesHelper( 5 );
    // this.scene.add( axesHelper );
  }

  populate() {
    this.systems = [];
    var forests = new System(24, [5,8],
      new THREE.ConeGeometry(0.02, 0.08, 4),
      '#10a025', 0);
    var people = new System(12, [5,8],
      new THREE.SphereGeometry(0.02, 32, 4),
      '#134fb2', 0);
    var birds = new System(12, [8,16],
      new THREE.ConeGeometry(0.01, 0.23, 4),
      '#f3ff21', 0.1);
    people.beings.map(b => {
      b.velocity = {
        x: (Math.random() - 1)/200,
        y: (Math.random() - 1)/200
      }
    });
    birds.beings.map(b => {
      b.velocity = {
        x: (Math.random() - 1)/200,
        y: (Math.random() - 1)/200
      }
    });
    this.systems.push(people);
    this.systems.push(birds);
    this.systems.push(forests);
    this.systems.map(s => s.beings.map(b => this.earth.add(b.group)));
    forests.beings.map(b => {
      var z = new THREE.Vector3(0,0,0);
      b.herd.map(member => {
        var v = new THREE.Vector3();
        v.subVectors(member.position, z).add(member.position);
        member.lookAt(v);
      });
    });
  }

  render() {
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
    if (this.earth) {
      // this.earth.rotation.y += 0.001;
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

var e = new Earth();
fetch('http://localhost:5000/questions/147517853').then(resp => {
  return resp.json();
}).then(json => {
  var question = choice(json.questions);
  ask(question);
});
e.render();
