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
        var thisL = new LV({ "data": self.pp['angerjoy'] });
        console.log(thisL.compute());
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


