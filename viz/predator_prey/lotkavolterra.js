var odex = require('odex');

var LotkaVolterraFunc = function(a, b, c, d) {
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


export default class LV {
  constructor(param) {
    this.data = param.data;
    this.LVFunc = LotkaVolterraFunc(this.data.lv_vars.a, this.data.lv_vars.b, this.data.lv_vars.c, this.data.lv_vars.d);
    this.solver = new odex.Solver(2);
  }

  precompute(params) {
    var self = this;
    //console.log(this.data.lv_vars);
    //this.solver.solve(this.LVFunc, 0, [1, 1], 10, function(n,x0,x1,y) {
      //console.log(n,x0,x1,y);
    //}).y
    //console.log(this.solver.solve(this.LVFunc, 0, [1, 1], 6).y)
    //var res = _.map(_.range(0, 4, 0.1), function(d, i) {
      //return self.solver.solve(self.LVFunc, 0, [1, 1], d).y;
    //});
    //console.log(res);
    ////console.log(this.data);
    //

    //defaults
    var s_start = params.s_start || 0;
    var s_end = params.s_end || 10;
    var s_interval = params.s_interval || 0.1;

    var k = [];
    this.solver.denseOutput = true;
    this.solver.solve(this.LVFunc, s_start, [1, 1], s_end, this.solver.grid(s_interval, function(x,y) {
      k.push(y);
    }));

    return k;
  }

}


