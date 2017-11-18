import * as THREE from 'three';


class UI {

  constructor(config) {
    this.turnOnPlanetFrame = true;
    this.turnOnPlanetName = true;
    this.planetFrameDim = 200;


    this.renderer = config.renderer;
    this.scene = config.scene;
    this.camera = config.camera;
    this.setupUI()
  }

  setupUI() {

    if(this.turnOnPlanetFrame) {
      this.planetframe = document.getElementById('planetframe')
      this.planetframe.innerHTML = '<iframe src="http://simulation.cybernetics.social/planet?noname" width=' + this.planetFrameDim + ' height=' + this.planetFrameDim + '></iframe>';
    } 

    if(this.turnOnPlanetName) {
			this.planettooltip = document.getElementById('planettooltip')
		}

    this.mousetooltip = document.getElementById('mousetooltip')

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
        this.mousetooltip.innerHTML = obj.name;
        this.mousetooltip.style.left = `${ev.clientX + 20}px`;
        this.mousetooltip.style.top = `${ev.clientY}px`;
        this.mousetooltip.style.display = 'block';
      } else {
        this.mousetooltip.style.display = 'none';
      }
    }, false);
  }

  movePlanetFrame(config) {
    var width = window.innerWidth, height = window.innerHeight;
    var widthHalf = width / 2, heightHalf = height / 2;

    var pos = new THREE.Vector3();

    pos.setFromMatrixPosition(config.obj.mesh.matrixWorld);
    pos.project(this.camera);

    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;


    if(this.turnOnPlanetFrame == true) {
      this.planetframe.style.left = (pos.x - (this.planetFrameDim / 2)) + "px";
      this.planetframe.style.top = (pos.y - 40 - this.planetFrameDim) + "px";
      this.planetframe.style.borderRadius = (this.planetFrameDim / 4) + "px";
      this.planetframe.style.overflow = "hidden";
    } else {
      this.planetframe.style.display = "none";
    }

    if(this.turnOnPlanetName) {
      this.planettooltip.innerHTML = config.obj.name;
      this.planettooltip.style.left = (pos.x - 100/2) + "px";
      this.planettooltip.style.top = (pos.y - 5) + "px";
    } else {
      this.planettooltip.style.display = "none";
    }

  }





}

export default UI;

