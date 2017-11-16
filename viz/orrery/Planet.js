import * as THREE from 'three';

//code mashup of view-source:https://threejs.org/examples/canvas_geometry_birds.html
// and https://github.com/OwenMcNaughton/Planets.js/blob/master/js/Planet.js

var planetFactors = {};
planetFactors.sepFac = 0.12; 
planetFactors.cohFac = 0.03;
planetFactors.aliFac = 0.01;
planetFactors.tarFac = 0.31;
planetFactors.gravFac = 1.2;
planetFactors.maxSpeed = 0.015;
planetFactors.maxForce = 0.001;
planetFactors.cohDist = 0.2;
planetFactors.sepDist = 0.2;
planetFactors.aliDist = 0.1;

window.planetFactors = planetFactors;

var debugcounter = 0;
var gravConstant = 0.0000001;

var bound_width = 1;
var bound_height = 1;
var bound_depth = 1;


function sphereVolumeToRadius(v) {
  return Math.pow((3 * v / ( 4 * Math.PI)), 1/3);
}

class Planet {

       
  constructor(config) {
    this.pos = config.pos.clone();
    this.vel = config.vel.clone();
    this.rot = config.rot.clone();
    this.mass = config.mass;
    this.moving = config.moving;
    this.attributes = config.attr;

    this.acc = new THREE.Vector3(0, 0, 0);
    
    this.vfrom = new THREE.Vector3(0, 1, 0);
    

    this.radius = sphereVolumeToRadius(this.mass) * 0.04;

    //this.geo = new THREE.ConeGeometry(0.05, 0.23, 7) ;
    this.geo = new THREE.SphereGeometry(this.radius, 12, 12);
    this.material = new THREE.MeshBasicMaterial({color: this.attributes.color});
    this.mesh = new THREE.Mesh(this.geo, this.material);

    this.name = this.attributes.name;
    this.mesh.name = this.attributes.name;

    this.meshUpdate();

    this.stepcounter = 0;

    this.velArrow = new THREE.ArrowHelper(this.vel, this.pos, 1, 0x67abef);
    this.accArrow = new THREE.ArrowHelper(this.acc, this.pos, 1, 0xd366ef);

    //this.gravityArrows = [];
    //for(var i = 0; i < this.attributes.planetN - 1; i++) {
      //var arr = new THREE.ArrowHelper(this.vel, this.pos, 1, 0xff0fF0);
      //arr.name = "arrow-" + this.mesh.name + "-" + i 
      //this.gravityArrows.push(arr);
    //}

  } 

  static randomPos() {
    var posx = Math.random() * 4 - 2;
    var posy = 0; //Math.random() * 3 - 1 ;
    var posz = Math.random() * 4 - 2 ;
    return new THREE.Vector3(posx, posy, posz);
  }
        
  static randomVel() {
    var amp = planetFactors.maxSpeed;
    var vel = new THREE.Vector3(Math.random() * amp - (amp / 2),
      0, //Math.random() * amp - (amp / 2),
      Math.random() * amp - (amp / 2)
    );
    return vel;
    }
        
  static randomRot() {
    return new THREE.Euler(Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              0 //Math.random() * Math.PI * 2
    );
  }
 

  addToScene(scene) {
    scene.add(this.mesh);
    scene.add(this.velArrow);
    scene.add(this.accArrow);
    //this.gravityArrows.forEach(arr => {
      //scene.add(arr)
    //});
  }

  setGoal(target) {
    this._goal = target;
  }

  log(message) {
//    if(this.stepcounter < 5) { console.log(message); }
  }


	targetVector( target, amount ) {
		var steer = new THREE.Vector3();
		steer.subVectors( target, this.pos );
		steer.multiplyScalar( amount );
		return steer;
	}


  cohesion(planets) {
    var count = 0;
    var sum = new THREE.Vector3(0, 0, 0);
   
    var self = this;
    planets.forEach(b => {
      var dist = self.pos.distanceTo(b.pos);
      if(dist > 0.001 && dist < planetFactors.cohDist) {
        sum.add(b.pos);
        count++;
      }
    });
    
    if(count > 0) {
      sum.divideScalar(count);
      return this.seek(sum);
    } else {
      return new THREE.Vector3(0, 0, 0);
    }
  }

	separation(planets) {
    var count = 0;
    var sum = new THREE.Vector3(0, 0, 0);
   
    var self = this;
    planets.forEach(b => {
      var dist = self.pos.distanceTo(b.pos);
      if(dist > 0.001 && dist < planetFactors.sepDist) {
        var diff = new THREE.Vector3(self.pos.x, self.pos.y, self.pos.z);
        diff.sub(b.pos);
        diff.normalize();
        diff.divideScalar(dist);
        sum.add(diff);
        count++;
      }
    });
    
    if(count > 0) {
      sum.divideScalar(count);
    }
    
    if(sum.x == 0 && sum.y == 0 && sum.z) {
      return diff;
    }
    
    if(sum.lengthSq() > 0) {
      sum.normalize();
      sum.multiplyScalar(planetFactors.maxSpeed);
      sum.sub(this.vel);
      sum.clampLength(0, planetFactors.maxForce);
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

  wrapBounds() {
    if ( this.pos.x >   bound_width ) this.pos.x = - bound_width;
    if ( this.pos.x < - bound_width ) this.pos.x =   bound_width;
    if ( this.pos.y >   bound_height ) this.pos.y = - bound_height;
    if ( this.pos.y < - bound_height ) this.pos.y =  bound_height;
    if ( this.pos.z >  bound_depth ) this.pos.z = - bound_depth;
    if ( this.pos.z < - bound_depth ) this.pos.z =  bound_depth;
  }

  seek(target) {
    this.log(this.stepcounter); 
    target.sub(this.pos);
    target.setLength(planetFactors.maxSpeed);

    target.sub(this.vel);
    target.clampLength(0, planetFactors.maxForce);
    return target;
  }

  alignment(planets) {
    var count = 0;
    var sum = new THREE.Vector3(0, 0, 0);
   
    var self = this;
    planets.forEach(b => {
      var dist = self.pos.distanceTo(b.pos);
      
      self.log("dist: " + dist);
      if(dist > 0.001 && dist < planetFactors.aliDist) {
        if(self.stepcounter < 5) { console.log(); }
        sum.add(b.vel);
        count++;
      }
    })
    
    if(count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(planetFactors.maxSpeed);
      sum.sub(this.vel);
      sum.clampLength(0, planetFactors.maxForce);
      return sum;
    } else {
      return new THREE.Vector3(0, 0, 0);
    }
  }

  gravity(planets) {
    var sum = new THREE.Vector3(0, 0, 0);

    var arrowCounter = 0;

    var self = this;
    planets.forEach((b, i) => {
      //console.log(b.name);
      //console.log(self.name);
      var dist = self.pos.distanceTo(b.pos);
      if((b.name != self.name) && (dist > (self.radius + b.radius))) {
        var target = new THREE.Vector3();
        target.copy( b.pos );
        target.sub(self.pos);

        // https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation
        target.setLength((gravConstant * b.mass) / Math.pow(dist, 2));
        sum.add(target);

      }
    });
  
    return sum;
   }



  moveUpdate(planets) {
  
    var sep = this.separation(planets);
    var ali = this.alignment(planets);
    var coh = this.cohesion(planets);

    var grav = this.gravity(planets)

    this.acc = new THREE.Vector3(0,0,0);
    
    //if(!(typeof sep === 'undefined')) {
      //sep.multiplyScalar(planetFactors.sepFac);
      //this.acc.add(sep);
    //}
    //if(!(typeof ali === 'undefined')) {
      //ali.multiplyScalar(planetFactors.aliFac);
      //this.acc.add(ali);
    //}
    if(!(typeof coh === 'undefined')) {
      coh.multiplyScalar(planetFactors.cohFac);
      this.acc.add(coh);
    }
    if(!(typeof grav === 'undefined')) {
      grav.multiplyScalar(planetFactors.gravFac);
      this.acc.add(grav);
    }

    //var tar = new THREE.Vector3(0, 1, 0);
    //tar = this.seek(tar);
    //tar.multiplyScalar(planetFactors.tarFac);
    //this.acc.add(tar);

    //this.acc.add(this.boundSphere());

      
    this.vel.add(this.acc);
    //this.vel.clampLength(0, planetFactors.maxSpeed);

    this.pos.add(this.vel);


    // rotate geo
    var quat = new THREE.Quaternion();
    var v = new THREE.Vector3(this.vel.x, this.vel.y, this.vel.z);
    v.normalize();
    quat.setFromUnitVectors(this.vfrom, v);
    this.rot.setFromQuaternion(quat)


    var self = this;
 //    this.wrapBounds();
  }

  arrowUpdate() {
    this.accArrow.setDirection(this.acc);
    this.accArrow.setLength(Math.max(0.001, this.acc.length() * 500));
    this.accArrow.position.x = this.pos.x;
    this.accArrow.position.y = this.pos.y;
    this.accArrow.position.z = this.pos.z;
    this.velArrow.setDirection(this.vel);
    this.velArrow.setLength(Math.max(0.001, this.vel.length() * 30));
    this.velArrow.position.x = this.pos.x;
    this.velArrow.position.y = this.pos.y;
    this.velArrow.position.z = this.pos.z;
    //this.gravityArrows.forEach(arr => {
      //arr.position.x = self.pos.x;
      //arr.position.y = self.pos.y;
      //arr.position.z = self.pos.z;
    //});

   }

  meshUpdate() {
    this.mesh.position.x = this.pos.x;
    this.mesh.position.y = this.pos.y;
    this.mesh.position.z = this.pos.z;
    this.mesh.rotation.x = this.rot.x;
    this.mesh.rotation.y = this.rot.y;
    this.mesh.rotation.z = this.rot.z;
  }

  update(planets) {
    if (this.moving == true)  {
      this.moveUpdate(planets);
    }
    this.meshUpdate();
    this.arrowUpdate();
    this.stepcounter ++;
	}

}

export default Planet;
