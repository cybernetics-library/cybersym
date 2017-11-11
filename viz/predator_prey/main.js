import Vue from 'vue'
import LV from './lotkavolterra';


var apiURL = "http://localhost:5000/pp";
window.vueapp = new Vue({
  el: '#app',
  data: {
    message: "Vue is working.",
    rawdata: null,
    LVs: null,
    LVphases: null
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

        self.rawdata = JSON.parse(xhr.responseText);
        self.LVs = {};
        self.LVphases = {};

        _.each(self.rawdata, function(v, k) {

          // use JS to solve LV          
          var thisL = new LV({ "data": v });
          var prec = thisL.precompute({
            "s_start": 0,
            "s_end": 10,
            "s_interval": 0.1
          });
          self.LVs[k] = thisL;
          self.LVphases[k] = prec;
          

          // use API to solve LV          
          self.LVphases[k] = v.phase_curve;

        });

        console.log("Fetched data from /pp.");
      }
      xhr.send()
    },

		listToPath: function(multi, data) {

      var s = "M" + (multi * data[0][0]) + " " + (multi  * data[0][1]) 
      _.each(data.slice(1), function(d) {
        s += " L" + (multi * d[0]) + " " + (multi * d[1]);
      });
      return s;
		},

  }
})


