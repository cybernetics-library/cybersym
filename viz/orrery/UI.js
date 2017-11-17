import * as THREE from 'three';

var turnOnPlanetFrame = true;
var planetFrameDim = 200;

class UI {

  constructor(config) {
    this.renderer = config.renderer;
    this.scene = config.scene;
    this.camera = config.camera;
    this.setupUI()
  }

  setupUI() {

    if(turnOnPlanetFrame) {
      this.planetframe = document.getElementById('planetframe')
      this.planetframe.innerHTML = '<iframe src="http://simulation.cybernetics.social/planet" width=' + planetFrameDim + ' height=' + planetFrameDim + '></iframe>';
    } 

    this.planettooltip = document.getElementById('planettooltip')


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

  movePlanetFrame(config) {
    var width = window.innerWidth, height = window.innerHeight;
    var widthHalf = width / 2, heightHalf = height / 2;

    var pos = new THREE.Vector3();

    pos.setFromMatrixPosition(config.obj.mesh.matrixWorld);
    pos.project(this.camera);

    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;


    if(turnOnPlanetFrame) {
      this.planetframe.style.left = (pos.x - (planetFrameDim / 2)) + "px";
      this.planetframe.style.top = (pos.y - 10 - planetFrameDim) + "px";
    }

    this.planettooltip.innerHTML = "HEY DUDE";
    this.planettooltip.style.left = pos.x + "px";
    this.planettooltip.style.top = pos.y + "px";
  }





}

export default UI;

