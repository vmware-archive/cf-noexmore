
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var mongo = require('mongodb');
var monk = require('monk');

var services = JSON.parse(process.env.VCAP_SERVICES);
var mongoUri = services['mongolab-n/a'][0].credentials.uri;
var db = monk(mongoUri);

var redis = require('redis');
var redisCreds = services['rediscloud-n/a'][0].credentials;
var redisClient = redis.createClient(redisCreds['port'], redisCreds['hostname'], {auth_pass: redisCreds['password']});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/helloworld', routes.helloworld);
app.get('/userlist', routes.userlist(db));
app.get('/newuser', routes.newuser);
app.post('/adduser', routes.adduser(db));

app.get('/todo', routes.todo(redisClient));
app.post('/todo', routes.saveTodo(redisClient));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
