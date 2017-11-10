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
  }

  compute() {
    console.log(this.data.lv_vars);
    var s = new odex.Solver(2);
    //s.solve(LotkaVolterraFunc(2/3, 4/3, 1, 1), 0, [1, 1], 1, function(n,x0,x1,y) {
      //console.log(n,x0,x1,y);
    //}).y
    console.log(s.solve(LotkaVolterraFunc(2/3, 4/3, 1, 1), 0, [1, 1], 6).y)
    console.log(this.data);
  }

}


