import * as THREE from 'three';
import _ from 'lodash'
import './GeometryUtils.js'

//code mashup of view-source:https://threejs.org/examples/canvas_geometry_birds.html
// and https://github.com/OwenMcNaughton/Planets.js/blob/master/js/Planet.js

var planetFactors = {};
planetFactors.sepFac = 0.32; 
planetFactors.cohFac = 0.03;
planetFactors.aliFac = 0.00;
planetFactors.tarFac = 0.31;
planetFactors.gravFac = 0.1;
planetFactors.maxSpeed = 0.005;
planetFactors.maxForce = 0.001;
planetFactors.cohDist = 0.2;
planetFactors.sepDist = 0.2;
planetFactors.aliDist = 0.1;
planetFactors.boundFac = 0.1;
planetFactors.swirlFac = 0.1;
planetFactors.sunPullFac = 0.1;
planetFactors.sunPullMinDist = 0.7;
planetFactors.clampXYFac = 0.2;
planetFactors.maxDistFromCenter = 3;

window.planetFactors = planetFactors;


var planetStatic = {};
planetStatic.origin = new THREE.Vector3(0,0,0);


var debugcounter = 0;
var gravConstant = 0.0000001;

var bound_width = 1;
var bound_height = 1;
var bound_depth = 1;


function sphereVolumeToRadius(v) {
  v = Math.pow(v, 1);
  var r =  Math.pow((3 * v / ( 4 * Math.PI)), 1/3);
  return r;
}

class Planet {

       
  constructor(config) {
    this.id = config.id;
    this.pos = config.pos.clone();
    this.vel = config.vel.clone();
    this.rot = config.rot.clone();
    this.mass = config.mass;
    this.moving = config.moving;
    this.attributes = config.attr;

    if (!('debugArrows' in this.attributes)) {
      this.attributes.debugArrows = false;
    } 


    this.acc = new THREE.Vector3(0, 0, 0);
    
    this.vfrom = new THREE.Vector3(0, 1, 0);
    

    this.radius = sphereVolumeToRadius(this.mass) * 0.04;

    //this.geo = new THREE.ConeGeometry(0.05, 0.23, 7) ;
    if(this.id = "sunsunsun") {
      this.geo = new THREE.SphereGeometry(this.radius, 24, 24);
    } else {
      this.geo = new THREE.SphereGeometry(this.radius, 12, 12);
    }
     

    if( 'materialOverride' in this.attributes) {
      this.material = this.attributes.materialOverride.clone();
    } else {
      this.material = new THREE.MeshLambertMaterial({color: this.attributes.color});
      //this.material = new THREE.MeshPhongMaterial({color: this.attributes.color});
    }

    this.mesh = new THREE.Mesh(this.geo, this.material);

    this.name = this.attributes.name;
    this.mesh.name = this.attributes.name;

    this.meshUpdate();

    this.stepcounter = 0;

    if(this.attributes.debugArrows) {
      this.velArrow = new THREE.ArrowHelper(this.vel, this.pos, 1, 0x67abef);
      this.accArrow = new THREE.ArrowHelper(this.acc, this.pos, 1, 0xd366ef);
    }


  } 

  static randomPos(config) {
    var randomDirection = new THREE.Vector3(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).normalize();
    var radius3 = Math.random() * config.radius + 1;
    randomDirection.multiplyScalar(radius3);
    return randomDirection.clone();
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

    if(this.attributes.debugArrows) {
      scene.add(this.velArrow);
      scene.add(this.accArrow);
    }
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
    _.each(planets, function(p, id) {
      var dist = self.pos.distanceTo(p.pos);
      if(dist > 0.001 && dist < planetFactors.cohDist) {
        sum.add(p.pos);
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
    _.each(planets, function(p, id) {
      var dist = self.pos.distanceTo(p.pos);
      if(dist > 0.001 && dist < planetFactors.sepDist) {
        var diff = new THREE.Vector3(self.pos.x, self.pos.y, self.pos.z);
        diff.sub(p.pos);
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


  clampToXZ() {
    var steer = new THREE.Vector3();
    var proj = new THREE.Vector3();

    steer.copy( this.pos );
    proj.copy( this.pos );
    proj.y = 0;
    steer.sub( proj );
    steer.negate();
    steer.clampLength(0, planetFactors.maxForce);
    return steer;
  }


	boundSphere() {

    var dist = this.pos.distanceTo(planetStatic.origin);

    if(dist > planetFactors.maxDistFromCenter) {
      var steer = new THREE.Vector3();
      steer.copy( this.pos );
      steer.sub( planetStatic.origin );
      steer.setLength(0.1 / Math.pow((dist - planetFactors.maxDistFromCenter), 2));
      steer.negate();
      return steer;
    }
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
    _.each(planets, function(p, id) {
      var dist = self.pos.distanceTo(p.pos);
      
      self.log("dist: " + dist);
      if(dist > 0.001 && dist < planetFactors.aliDist) {
        if(self.stepcounter < 5) { console.log(); }
        sum.add(p.vel);
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
    _.each(planets, function(p, id) {
      //console.log(b.name);
      //console.log(self.name);
      var dist = self.pos.distanceTo(p.pos);
      if((p.name != self.name) && (dist > (self.radius + p.radius))) {
        var target = new THREE.Vector3();
        target.copy( p.pos );
        target.sub(self.pos);

        // https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation
        target.setLength((gravConstant * p.mass) / Math.pow(dist, 2));
        sum.add(target);

      }
    });
  
    return sum;
   }

	swirl() {

		var steer = new THREE.Vector3();
		steer.copy( this.pos );
		var up = new THREE.Vector3(0,1,0);
		steer.applyAxisAngle ( up , Math.PI / 2 )

		steer.setLength(1)
		steer.setLength(this.mass / 1000)

		return steer;
  }

	pullTowardsSun() {
    var dist = this.pos.distanceTo(planetStatic.origin);
    if(dist > 0.001 && dist > planetFactors.sunPullMinDist) {

      var steer = new THREE.Vector3();
      steer.copy( this.pos );
      steer.negate();
      steer.setLength(this.mass / 1000)

      return steer;

    }
  }


  //findSimilarPlanets(planets) {
    //var sum = new THREE.Vector3(0, 0, 0);

    //var arrowCounter = 0;

    //var self = this;
    //_.each(planets, function(p, id) {
      ////console.log(b.name);
      ////console.log(self.name);
      //var dist = self.pos.distanceTo(p.pos);
      //if((p.name != self.name) && (dist > (self.radius + p.radius))) {
        //var target = new THREE.Vector3();
        //target.copy( p.pos );
        //target.sub(self.pos);

        //// https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation
        //target.setLength((gravConstant * p.mass) / Math.pow(dist, 2));
        //sum.add(target);

      //}
    //});
  
    //return sum;
  //}

  moveUpdate(planets) {
  

    this.acc = new THREE.Vector3(0,0,0);
    
    var sep = this.separation(planets);
    if(!(typeof sep === 'undefined')) {
      sep.multiplyScalar(planetFactors.sepFac);
      this.acc.add(sep);
    }

    var ali = this.alignment(planets);
    if(!(typeof ali === 'undefined')) {
      ali.multiplyScalar(planetFactors.aliFac);
      this.acc.add(ali);
    }

    var coh = this.cohesion(planets);
    if(!(typeof coh === 'undefined')) {
      coh.multiplyScalar(planetFactors.cohFac);
      this.acc.add(coh);
    }

    var grav = this.gravity(planets)
    if(!(typeof grav === 'undefined')) {
      grav.multiplyScalar(planetFactors.gravFac);
      this.acc.add(grav);
    }

    var boundF = this.boundSphere();
    if(!(typeof boundF === 'undefined')) {
      boundF.multiplyScalar(planetFactors.boundFac);
      this.acc.add(boundF);
    }

    var swirlF = this.swirl();
    if(!(typeof swirlF === 'undefined')) {
      swirlF.multiplyScalar(planetFactors.swirlFac);
      this.acc.add(swirlF);
    }

    var sunPullF = this.pullTowardsSun();
    if(!(typeof sunPullF === 'undefined')) {
      sunPullF.multiplyScalar(planetFactors.sunPullFac);
      this.acc.add(sunPullF);
    }


    var clampF = this.clampToXZ();
    if(!(typeof clampF === 'undefined')) {
      clampF.multiplyScalar(planetFactors.clampXYFac);
      this.acc.add(clampF);
    }
    //var tar = new THREE.Vector3(0, 1, 0);
    //tar = this.seek(tar);
    //tar.multiplyScalar(planetFactors.tarFac);
    //this.acc.add(tar);

    //this.acc.add(this.boundSphere());

      
    this.vel.add(this.acc);
    this.vel.clampLength(0, planetFactors.maxSpeed);

    this.pos.add(this.vel);


    // rotate geo
    var quat = new THREE.Quaternion();
    var v = new THREE.Vector3(this.vel.x, this.vel.y, this.vel.z);
    v.normalize();
    quat.setFromUnitVectors(this.vfrom, v);
    this.rot.setFromQuaternion(quat)


    var self = this;
  }

  arrowUpdate() {
    this.accArrow.setDirection(this.acc);
    this.accArrow.setLength(Math.max(0.001, this.acc.length() * 200));
    this.accArrow.position.x = this.pos.x;
    this.accArrow.position.y = this.pos.y;
    this.accArrow.position.z = this.pos.z;
    this.velArrow.setDirection(this.vel);
    this.velArrow.setLength(Math.max(0.001, this.vel.length() * 30));
    this.velArrow.position.x = this.pos.x;
    this.velArrow.position.y = this.pos.y;
    this.velArrow.position.z = this.pos.z;

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
    if (this.moving == true)  {  this.moveUpdate(planets); }
    this.meshUpdate();
    if(this.attributes.debugArrows) {  this.arrowUpdate(); }
    this.stepcounter ++;
	}

}

export default Planet;


