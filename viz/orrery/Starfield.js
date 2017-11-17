import * as THREE from 'three';
import _ from 'lodash'
import './GeometryUtils.js'

class Starfield {

  constructor(config) {

    ///// stars
    var rs = config.size_range[0];
    var re = config.size_range[1];
    var rstep = (re - rs) / config.size_count;


    var sphere = new THREE.SphereGeometry(config.distance, 100, 100);

    this.stargroup = new THREE.Group();
    var self = this;
    _.each(_.range(rs, re, rstep), function(siz) {
      _.each(config.colors, function(col) {

        var geom = new THREE.Geometry();

        var pointn = config.count / config.size_count / config.colors.length;

        _.each(THREE.GeometryUtils.randomPointsInGeometry(sphere, pointn), function(vert) {
          geom.vertices.push(vert);
        });

        var mat = new THREE.PointsMaterial({
          color: new THREE.Color(col),
          size: siz,
        });
        self.stargroup.add(new THREE.Points(geom, mat));

      });
    });

  }

  addToScene(scene) {
    scene.add(this.stargroup);
  }

}

export default Starfield;


