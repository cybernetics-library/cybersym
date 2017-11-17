import * as THREE from 'three';

// <https://stackoverflow.com/a/13542669/1097920>
function shadeColor(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

function uniform(rng) {
  var [l, u] = rng;
  return Math.round(l + Math.random() * (u-l));
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



class System {
  constructor(n, herdSizes, geo, color, altitude) {
    this.beings = [];

    for (var i=0; i<n; i++) {
      var being = new Being(uniform(herdSizes), geo, color, altitude);
      this.beings.push(being);
    }


  }

  setVelocities(velocity) {
    this.beings.forEach(b => b.velocity = velocity);
  }

  update() {
    this.beings.forEach(b => b.update());
  }
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
      var height = box.getSize().y;
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
      this.herd.forEach(member => {
        member.s.phi += this.velocity.x;
        member.s.theta += this.velocity.y;
        member.position.setFromSpherical(member.s);
      });

      var o = new THREE.Vector3(0,0,0);
      var newDir = new THREE.Vector3();
      var quaternion = new THREE.Quaternion();
      var rotationAxis = new THREE.Vector3(0,0,1);
      this.herd.forEach(member => {



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

export { // without default
    System,
    Being,
}
