import * as THREE from 'three';
import $ from 'jquery';


class UI {

  constructor(config) {
    this.turnOnPlanetFrame = true;
    this.turnOnPlanetName = true;
    this.planetFrameDim = 100;


    this.renderer = config.renderer;
    this.scene = config.scene;
    this.camera = config.camera;
    this.orrery = config.orrery; 
    this.setupUI()
  }

  setupUI() {

    if(this.turnOnPlanetFrame) {
      this.planetframe = document.getElementById('planetframe')
      this.planetframe.innerHTML = '<iframe id="planetiframe" src="http://simulation.cybernetics.social/planet?noname" width=' + this.planetFrameDim + ' height=' + this.planetFrameDim + '></iframe>';
			this.planetiframe = document.getElementById('planetiframe')
    } 

    if(this.turnOnPlanetName) {
			this.planettooltip = document.getElementById('planettooltip')

      for(var i = 0; i < this.orrery.lastFewPlanetN; i++) {
        $('#planettooltips')
        .append('<div class="planettooltips" id="planettooltips_' + i + '"></div>')
      }
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
    if('params' in window && 'planetFrameDim' in window.params) {
      this.planetFrameDim = parseInt(window.params.planetFrameDim);
    }

    var width = window.innerWidth, height = window.innerHeight;
    var widthHalf = width / 2, heightHalf = height / 2;

    var pos = new THREE.Vector3();

    pos.setFromMatrixPosition(config.obj.mesh.matrixWorld);
    pos.project(this.camera);

    pos.x = ( pos.x * widthHalf ) + widthHalf;
    pos.y = - ( pos.y * heightHalf ) + heightHalf;


    if(this.turnOnPlanetFrame == true) {
      this.planetframe.style.left = (pos.x - (this.planetFrameDim / 2)) + "px";
      this.planetframe.style.top = (pos.y - 25 - this.planetFrameDim) + "px";
      this.planetframe.style.borderRadius = (this.planetFrameDim / 4) + "px";
      this.planetframe.style.overflow = "hidden";
      this.planetiframe.width = this.planetFrameDim;
      this.planetiframe.height  = this.planetFrameDim;
    } else {
      this.planetframe.style.display = "none";
    }

    if(this.turnOnPlanetName) {
      this.planettooltip.innerHTML = config.obj.name;
      this.planettooltip.style.left = (pos.x - 200/2) + "px";
      this.planettooltip.style.top = (pos.y + 15) + "px";


      var self = this;
      _.each(self.orrery.lastFewPlanets, function(p, i) {


        $('#planettooltips_' + i).html(self.orrery.planets[p].name);
        var thispos = new THREE.Vector3();
        thispos.setFromMatrixPosition(self.orrery.planets[p].mesh.matrixWorld);
        thispos.project(self.camera);
        thispos.x = ( thispos.x * widthHalf ) + widthHalf;
        thispos.y = - ( thispos.y * heightHalf ) + heightHalf;

        $('#planettooltips_' + i).html(self.orrery.planets[p].name);
        $('#planettooltips_' + i).css({
          left: (thispos.x - 200/2) + "px",
          top:  (thispos.y + 15) + "px",
        });
      });


    } else {
      this.planettooltip.style.display = "none";
      $(".planettooltips").css("display", "none");
    }

  }





}

export default UI;

