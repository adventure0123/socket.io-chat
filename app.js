var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var server=require('http').Server(app);
var io=require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.get('/users', function(req,res){
  if(!req.query||!req.query.name){
    res.redirect('/');
  }
  if(users[req.query.name]){
      console.log(users);
      // res.render('index', { err: 'Nickname has exist' });
      res.render('index',{ err: 'Nickname has existed' });
      return;
  }
  users[req.query.name]=req.query.name;
  //console.log(req.query.name);
  res.render('users',{nickname:req.query.name});
  return;
});

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var users={};
io.on('connection',function(socket){
  console.log("connection");
  //user online
  socket.on('online',function(data){
    if(!users[data.userName]){
      users[data.userName]=data.userName;
    }
    socket.name=data.userName;
    //boradcast the user name
    io.emit('online',{userName:data.userName,users:users});
  });

  //someone say
  socket.on('chat',function(data){
    socket.broadcast.emit('chat',data);
  });

  // someone left  
  socket.on('disconnect',function(){
    console.log('disconnect');
    if(users[socket.name]!=null){
       delete users[socket.name];
       socket.broadcast.emit('offline',{userName:socket.name,users:users});
    }
    //socket.broadcast.emit('new',' disconnect ,num of connection:'+numC);
  });
});
//app.listen(8080);
server.listen(8080,function(){
  console.log("server listening on port:8080");
});
module.exports = app;

