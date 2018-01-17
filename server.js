// server.js
// where your node app starts

// init project
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var session= require('express-session');
var bcrypt = require('bcrypt');
//var MongoStore = require('connect-mongo')(session);
var MongoDBStore = require('connect-mongodb-session')(session)
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var authRoutes = require('./routes/auth-routes');
var postRoutes = require('./post/post-routes');
var mongoose = require('mongoose');

var app = express()

mongoose.connect('mongodb://test:test@ds163826.mlab.com:63826/oauth',function(){
  console.log('connected to mlab');
})


var store = new MongoDBStore(
      {
        uri: 'mongodb://test:test@ds163826.mlab.com:63826/oauth',
        collection: 'sessions'
      });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));



//seession and cookie

/*app.use(cookieSession({
	maxAge:24*60*60*1000,
	keys:['xGHVHMJB'],
}));*/
app.use(session({ secret: 'keyboard cat',
                 store: store,
                 resave:false,
                 saveUninitialized: false,
                 }))

//initialize passport to use the cookie
app.use(passport.initialize());
app.use(passport.session());


//handling routes
app.use('/auth',authRoutes);
app.use('/posts',postRoutes);
  
app.get('/isAuthenticated',function(req,res){
  
  if(req.user){
    res.json({authenticate:true,user:req.user.username,id:req.user._id})
  }
  else{
    res.json({authenticate:false,user:""})
    
  }
  
  
  
  
})  
  




app.get('/logout',function(req,res){
  req.logout();
  req.session.destroy();
  console.log('logged out');
  res.send("logout successfully")
})
app.get("/", function (request, response) {
  console.log(request.isAuthenticated())
  
  if(request.user){
    console.log('yes you are signed in')
    console.log(request.user)
    response.render('index',{signed:true})
  }
  else{
    console.log(request.user);
    console.log('no you are not signed in')
    response.render('index',{signed:false});
  }
});


// Simple in-memory store for now

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
