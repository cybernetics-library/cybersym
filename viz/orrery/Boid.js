import * as THREE from 'three';

//code mashup of view-source:https://threejs.org/examples/canvas_geometry_birds.html
// and https://github.com/OwenMcNaughton/Boids.js/blob/master/js/Boid.js

var sepFac = 0.02; 
var cohFac = 0.03;
var aliFac = 0.01;
var tarFac = 0.1;
var maxSpeed = 0.03;
var maxForce = 0.001;

var debugcounter = 0;

class Boid {

  static randomPos() {
  var posx = Math.random() * 3 - 1;
  var posy = Math.random() * 3 - 1 ;
  var posz = Math.random() * 3 - 1 ;
  return new THREE.Vector3(posx, posy, posz);
  }
        
  static randomVel() {
  var amp = 0.01;
  maxSpeed;
  var vel = new THREE.Vector3(Math.random() * amp - (amp / 2),
    Math.random() * amp - (amp / 2),
    Math.random() * amp - (amp / 2));
  return vel;
  }
        
  static randomRot() {
  return new THREE.Euler(Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2);
  }
        
  constructor(config) {
  this.pos = config.pos.clone();
  this.vel = config.vel.clone();
  this.rot = config.rot.clone();
  this.attributes = config.attr;

  this.acc = new THREE.Vector3(0, 0, 0);
  
  this.vfrom = new THREE.Vector3(0, 1, 0);
  
  this.cohDist = 2;
  this.sepDist = 2;
  this.aliDist = 1;

  this.geo = new THREE.ConeGeometry(0.05, 0.23, 7) ;
  this.material = new THREE.MeshBasicMaterial({color: 0x93bcff});
  this.mesh = new THREE.Mesh(this.geo, this.material);

  this.mesh.name = this.attributes.name;

  this.meshUpdate();

  this.stepcounter = 0;

  this.helperArrow = new THREE.ArrowHelper(this.vel, this.pos, 1, 0xffff00);
  } 

  addToScene(scene) {
  scene.add(this.mesh);
  scene.add(this.helperArrow);
  }

  setGoal(target) {
  this._goal = target;
  }

  log(message) {
  if(this.stepcounter < 5) { console.log(message); }
  }


	targetVector( target, amount ) {
		var steer = new THREE.Vector3();
		steer.subVectors( target, this.pos );
		steer.multiplyScalar( amount );
		return steer;
	}


  cohesion(boids) {
  var count = 0;
  var sum = new THREE.Vector3(0, 0, 0);
  
  for(var i = 0; i < boids.length; i++) {
    var dist = this.pos.distanceTo(boids[i].pos);
    if(dist > 0.001 && dist < this.cohDist) {
      sum.add(boids[i].pos);
      count++;
    }
  }
  
  if(count > 0) {
    sum.divideScalar(count);
    return this.seek(sum);
  } else {
    return new THREE.Vector3(0, 0, 0);
  }
  }

	separation(boids) {
    var count = 0;
    var sum = new THREE.Vector3(0, 0, 0);
    
    for(var i = 0; i < boids.length; i++) {
      var dist = this.pos.distanceTo(boids[i].pos);
      if(dist > 0.001 && dist < this.sepDist) {
        var diff = new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z);
        diff.sub(boids[i].pos);
        diff.normalize();
        diff.divideScalar(dist);
        sum.add(diff);
        count++;
      }
    }
    
    if(count > 0) {
      sum.divideScalar(count);
    }
    
    if(sum.x == 0 && sum.y == 0 && sum.z) {
      return diff;
    }
    
    if(sum.lengthSq() > 0) {
      sum.normalize();
      sum.multiplyScalar(maxSpeed);
      sum.sub(this.vel);
      sum.clampLength(0, maxForce);
    }
    return sum;
	}

  avoid( target ) {
    var steer = new THREE.Vector3();
    steer.copy( this.pos );
    steer.sub( target );
    steer.multiplyScalar( 1 / this.pos.distanceToSquared( target ) );
    return steer;
  }

  boundSphere() {
    var steer = this.pos.clone();
    steer.sub([0,0,0])
    steer.setLength(6);
    return this.avoid(steer);
  }

  seek(target) {
    this.log(this.stepcounter); 
    target.sub(this.pos);
    target.normalize();
    target.multiplyScalar(maxSpeed);

    target.sub(this.vel);
    this.helperArrow.setDirection(target)
    this.helperArrow.setLength(target.length()* 10)
    target.clampLength(0, maxForce);
    return target;
  }

  alignment(boids) {
    var count = 0;
    var sum = new THREE.Vector3(0, 0, 0);
    
    boids.forEach(b => {
      var dist = this.pos.distanceTo(b.pos);
      
      this.log("dist: " + dist);
      if(dist > 0.001 && dist < this.aliDist) {
        if(this.stepcounter < 5) { console.log(); }
        sum.add(b.vel);
        count++;
      }
    })
    
    if(count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(maxSpeed);
      sum.sub(this.vel);
      sum.clampLength(0, maxForce);
      return sum;
    } else {
      return new THREE.Vector3(0, 0, 0);
    }
  }

  gravity(boids) {

  }

  moveUpdate(boids) {
  
    var sep = this.separation(boids);
    var ali = this.alignment(boids);
    var coh = this.cohesion(boids);

    
    if(!(typeof sep === 'undefined')) {
      sep.multiplyScalar(sepFac);
      this.acc.add(sep);
    }
    if(!(typeof ali === 'undefined')) {
      ali.multiplyScalar(aliFac);
      this.acc.add(ali);
    }
    if(!(typeof coh === 'undefined')) {
      coh.multiplyScalar(cohFac);
      this.acc.add(coh);
    }

    //var tar = new THREE.Vector3(0, 0, 0);
    //tar = this.seek(tar);
    //tar.multiplyScalar(tarFac);
    //this.acc.add(tar);

    //this.acc.add(this.boundSphere());

    //this.acc.add(this.gravity(boids));
      
    this.vel.add(this.acc);
    this.vel.clampLength(0, maxSpeed);

    this.pos.add(this.vel);

    var quat = new THREE.Quaternion();
    var v = new THREE.Vector3(this.vel.x, this.vel.y, this.vel.z);
    v.normalize();
    quat.setFromUnitVectors(this.vfrom, v);
    
    this.rot.setFromQuaternion(quat)

    this.log(this.helperArrow);
    this.helperArrow.position.x = this.pos.x;
    this.helperArrow.position.y = this.pos.y;
    this.helperArrow.position.z = this.pos.z;
  }

  meshUpdate() {
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    this.mesh.rotation.x = this.rot.x;
    this.mesh.rotation.y = this.rot.y;
    this.mesh.rotation.z = this.rot.z;
  }

  update(boids) {
    this.moveUpdate(boids);
    this.meshUpdate(boids);
    this.stepcounter ++;
	}

}

export default Boid;
