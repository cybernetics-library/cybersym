import Vue from 'vue'

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
        console.log(self.pp);
        console.log("Fetched data from /pp.");
      }
      xhr.send()
    }
  }
})


