import Vue from 'vue'
import LV from './lotkavolterra';


var apiURL = "http://localhost:5000/pp";
new Vue({
  el: '#app',
  data: {
    message: "Vue is working.",
    pp: null
  },
  created: function () {
    this.fetchData();
    this.timer = setInterval(this.fetchData, 30 * 1000)
  },
  beforeDestroy: function() {
    clearInterval(this.timer);
  },
  methods: {
    fetchData: function () {
      var xhr = new XMLHttpRequest()
      var self = this
      xhr.open('GET', apiURL)
      xhr.onload = function () {
        self.pp = JSON.parse(xhr.responseText);
        var thisL = new LV({ "graph_relations": self.pp['angerjoy'] });
        console.log(thisL);
        window.pp = self.pp
        console.log(self.pp);
        console.log("Fetched data from /pp.");
      }
      xhr.send()
    },
    computeLotkaVolterra: function() {

    }

  }
})

var aLotkaVolterra = function(a, b, c, d) {
  /*a is the natural growth rate of rabbits in the absence of predation, (positive)
    b is the death rate per encounter of rabbits due to predation, (negative)
    c is the natural death rate of foxes in the absence of food/rabbits, (negative)
    d is the efficiency of turning predated rabbits into foxes.(positive) */ 

  return function(x, y) {
    return [
      a * y[0] - b * y[0] * y[1],
      c * y[0] * y[1] - d * y[1]
    ];
  };
};






