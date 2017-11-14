import TWEEN from 'tween.js';
import * as THREE from 'three';

class Space {
  constructor() {
    this.initComponents();
    this.initScene();
    this.initUI();
  }

  initComponents() {
    // setup DOM
    var container = document.createElement('div');
    document.body.appendChild(container);

    var tooltip = document.createElement('div');
    container.appendChild(tooltip);
    tooltip.className = 'tooltip';

    // setup renderer
    var renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true, antialias: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.0);
    container.appendChild(renderer.domElement);

    // setup camera
    var D = 1,
        aspect = window.innerWidth/window.innerHeight,
        camera = new THREE.OrthographicCamera(-D*aspect, D*aspect, D, -D, 1, 1000);
    camera.zoom = 0.08;
    camera.position.set(0, 10, 20);
    camera.updateProjectionMatrix();

    // on resize
    window.addEventListener('resize', function() {
      aspect = window.innerWidth / window.innerHeight;
      // for perspective cameras
      // camera.aspect = aspect;
      // for orthographic cameras
      camera.left = -D*aspect;
      camera.right = D*aspect;
      camera.top = D;
      camera.bottom = -D;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    this.camera = camera;
    this.renderer = renderer;
    this.tooltip = tooltip;
  }

  initUI() {
    this.renderer.domElement.addEventListener('mousemove', ev => {
      var mouse = {
        x: (ev.clientX/this.renderer.domElement.clientWidth) * 2 - 1,
        y: -(ev.clientY/this.renderer.domElement.clientHeight) * 2 + 1
      };
      var raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, this.camera);

      // TODO this.objs and this.names are on the planet
      // var intersects = raycaster.intersectObjects(Object.values(this.objs));
      // if (intersects.length > 0) {
      //   var obj = intersects[0].object;
      //   this.tooltip.innerHTML = this.names[obj.uuid];
      //   this.tooltip.style.left = `${ev.clientX + 20}px`;
      //   this.tooltip.style.top = `${ev.clientY}px`;
      //   this.tooltip.style.display = 'block';
      // } else {
      //   this.tooltip.style.display = 'none';
      // }
    }, false);
  }

  initScene() {
    // setup scene
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xCCCCFF, 0.03);

    // setup lighting
    var ambient = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(ambient);
    var pointLight = new THREE.PointLight(0xffffff,0.2);
    scene.add(pointLight);
    pointLight.position.set(0, 1, 0);

    // setup skybox/dome
    var skygeo = new THREE.SphereGeometry(100, 60, 40);
    var skymat = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('/skybox.png'),
      side: THREE.BackSide,
      fog: false
    })
    var skybox = new THREE.Mesh(skygeo, skymat);
    scene.add(skybox);

    this.camera.lookAt(scene.position);
    this.scene = scene;
    this.skybox = skybox;
  }

  start(onUpdate) {
    requestAnimationFrame(() => {
      this.start(onUpdate);
    });
    this.renderer.render(this.scene, this.camera);
    this.skybox.rotation.y += 0.0008;
    TWEEN.update();
    onUpdate();
  }
}

export default Space;
