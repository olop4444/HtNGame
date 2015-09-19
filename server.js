var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');

app.listen(80);

var serve = serveStatic(__dirname + "/static/");

function handler(request, response) {
  var done = finalhandler(request, response);
  serve(request, response, done);
}

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
