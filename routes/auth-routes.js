var router = require('express').Router();
var passport = require('passport');
var bcrypt = require('bcrypt');
const saltRounds = 10;
var User = require('../models/user-model');

var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user_id, done) {
    console.log(' i am serailizing')
    done(null, user_id);             
}); 

passport.deserializeUser(function(id, done) {
    User.User.findById(id).then(function(user){
      console.log('i m de serializing ')
      done(null, user); 

    })            
});

router.get('/success', function(req, res){
		res.send({state: 'success', user: req.user.username});
	});

	//sends failure login state back to angular
	router.get('/failure', function(req, res){
		res.send({state: 'failure', user: null, message: "Invalid username or password"});
	});








passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'},
   function(username, password, done) {
    User.User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err);}
      
      else if(!user){
        return done(null, false);
      }
      else{
        var hash = user.password;
        var pass =password;
      bcrypt.compare(pass, hash, function(err, res) {
        if(res==true){
          return done(null, user);
        }
        else{
          return done(null, false);
        }
     
 })};
      
      
    });
  }
));

router.post('/login',
  passport.authenticate('local', { successRedirect: '/auth/success',
                                   failureRedirect: '/auth/failure' }))

router.post('/signup',function(req,res){
  console.log('there is a request');
  var username=req.body.username;
  var email =req.body.email;
  var password =req.body.password;
  
  User.User.findOne({email:email},function(err,user){
   if(err){
     console.log(err)
   }
    else{
      if(user){
        res.json({state: 'failure', user: null, message: "This email is already registerd"})
      }
      else{
        bcrypt.hash(password, saltRounds, function(err, hash) {
  // Store hash in your password DB.
    new User.User({username:username,email:email,password:hash}).save(function(err,user){
    if(err){
      console.log(err)}
    else{
      var user_id = user._id;
      console.log(user._id)
       req.login(user_id,function(err){
         if(err){
           console.log('err');
           res.redirect('/auth/failure');
         }
         else{
          res.redirect('/auth/success');
         } 
        }
        )
       }
   })
});
      
      
      }
    }
  })

})

module.exports = router;