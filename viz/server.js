var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');

(function() {

  var webpack = require('webpack');
  var webpackConfig = require('./webpack.config');
  var compiler = webpack(webpackConfig);

  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');

  app.use(webpackDevMiddleware(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath,
  }));

  app.use(webpackHotMiddleware(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }));

  app.use(express.static('assets'));

})();

////////////////////////////////
///////// ROUTES HERE //////////
////////////////////////////////

app.get('/earth', function(req, res){
    res.sendFile(__dirname + '/earth/index.html');
});

app.get('/orrery', function(req, res){
    res.sendFile(__dirname + '/orrery/index.html');
});

app.get('/predator_prey', function(req, res){
    res.sendFile(__dirname + '/predator_prey/index.html');
});

app.get('/monuments', function(req, res){
    res.sendFile(__dirname + '/monuments/index.html');
});

app.get('/planet', function(req, res){
    res.sendFile(__dirname + '/planet/index.html');
});

app.get('/galaxy', function(req, res){
    res.sendFile(__dirname + '/galaxy/index.html');
});

app.get('/splitscreen', function(req, res){
    res.sendFile(__dirname + '/splitscreen/index.html');
});


///////// express server a
var server = http.createServer(app);

server.listen(process.env.PORT || 8081, function() {
	console.log("Listening on %j", server.address());
});


