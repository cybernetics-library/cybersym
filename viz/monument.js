import * as THREE from 'three';
import md5 from 'blueimp-md5';

const COLORS = {
  'economics': 0xef0707,
  'biology': 0x09a323,
  'architecture': 0xe5c212,
  'society': 0x4286f4,
  'computation': 0xff87c7,

  'art': 0xef0707,
  'business': 0x09a323,
  'cognition': 0xe5c212,
  'media': 0x4286f4,
  'humanities': 0xff87c7,

  'politics': 0xef0707,
  'systems': 0x09a323,
  'science': 0xe5c212,

  'design': 0x222222
};

function genMat(topic) {
  var color = COLORS[topic];
  var mat = new THREE.MeshLambertMaterial({color: color, refractionRatio: 0.95});
  mat.emissiveIntensity = 0.6;
  mat.emissive = {
        r: 0.45,
        g: 0.45,
        b: 0.45
  };
  return mat;
}

const TOPIC_MATS = Object.keys(COLORS).reduce((agg, k) => {
  agg[k] = genMat(k);
  return agg;
}, {});


function sortTopics(topics, book_id) {
  // turn to array
  var topics = Object.keys(topics).map(t => [
    t, topics[t],
    parseInt(md5(`${t}${book_id}`).substring(0, 12), 16)
  ]);

  topics.sort((a, b) => {
    return a[2] - b[2];
  });
  return topics
}

function valFromHash(hash, lo, hi) {
  return (hash%(hi-lo+1))+lo;
}

function createMonument(checkout) {
  // generate object for topic
  var topics = sortTopics(checkout['topics'], checkout['book_id']);
  var minHeight = 1.2/(topics.length+1),
      baseHeight = 2.2/(topics.length+1),
      height = 0, obj;
  topics.map(topic => {
    var nPieces = topics.length >= 2 ? 1 : valFromHash(topic[2], 2, 3);
    for (var i=0; i<nPieces; i++) {
      var nextHeight = valFromHash(topic[2], minHeight, baseHeight);
      var geo = new THREE.CylinderGeometry(
          Math.sqrt(valFromHash(topic[2] * (i+1), 1, 3))/2,
          Math.sqrt(valFromHash(Math.sqrt(topic[2] * (i+1)), 1, 3))/2,
          nextHeight, 8);
      var mesh = new THREE.Mesh(geo, TOPIC_MATS[topic[0]]);
      if (!obj) {
        geo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, nextHeight/2, 0 ) ); // set pivot to origin
        obj = new THREE.Mesh(geo, TOPIC_MATS[topic[0]]);
      } else {
        obj.add(mesh);
      }
      mesh.position.y = height/2;
      height += nextHeight;
    }
  });
  obj.rotation.set(
    valFromHash(topics[0][2], -3, 3),
    valFromHash(topics[0][2], -3, 3),
    valFromHash(topics[0][2], -3, 3));
  return obj;
}

export default createMonument;
