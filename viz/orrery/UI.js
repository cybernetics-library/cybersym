import * as THREE from 'three';


class UI {

  constructor(config) {
    this.renderer = config.renderer;
    this.scene = config.scene;
    this.camera = config.camera;
    this.setupUI()
  }

  setupUI() {
    this.tooltip = document.getElementById('tooltip')
    this.tooltip.innerHTML = '<iframe src="https://www.nytimes.com" width=200 height=200></iframe>';

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
//        this.tooltip.innerHTML = '<iframe src="https://www.nytimes.com" width=200 height=200></iframe>';
        //obj.name;
        this.tooltip.style.left = `${ev.clientX + 20}px`;
        this.tooltip.style.top = `${ev.clientY}px`;
        this.tooltip.style.display = 'block';
      } else {
        this.tooltip.style.display = 'none';
      }
    }, false);
  }




}

export default UI;

