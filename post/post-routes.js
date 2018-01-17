var router = require('express').Router();
var passport = require('passport');
var User = require('../models/user-model');


router.get('/findAllPost',function(req,res){
  var poll =[];
  var options =[];
  
  User.User.find({},function(err,user){
    var post =[];
    if(err){
      console.log(err)}
    else{
      if(!user){
        console.log("not any user");
      }
      for(var i=0;i<user.length;i++){
        options={post:user[i].posts,id:user[i]._id}
        poll.push(options)
      }
      console.log(poll)
      
      res.json(poll)
    }
  })


})

router.get('/findmypost/:id',function(req,res){
  var poll=[];
 console.log(req.params.id);
  User.User.findOne({_id:req.params.id},function(err,user){
  if(err){
     console.log(err)
   }
  
  else if(!user){
    console.log(err)
  }
    else{
      poll.push({post:user.posts,id:user._id})
    }
    res.json(poll);
  
  })

})


router.put('/updateCount/count',function(req,res){
  //var query = require('url').parse(req.url,true).query;
  var newPost =[];
  console.log(req.body)
  var z
  const url = require('url');
  var obj;
  User.User.findOne({ _id:req.body.id }, function (err, user) {
   if(err){
     console.log(err)
   }
   else{
     for(var i=0;i<user.posts.length;i++){
       for(var key in user.posts[i].count){
         if(user.posts[i].ui==req.body.ui&&user.posts[i].name==req.body.name){
           obj=user.posts[i].count;
           z =i;
         }
       }
       
     }

    for(var key in obj){
      if(key==req.body.count){
      obj[key] = obj[key]+1;
      }
    }
     //res.json(obj)
    
    var pst = user.posts[z]
    pst.count = obj;
     
    for(var i=0;i<user.posts.length;i++){
      
      if(i==z){
       newPost.push(pst)
      }
      else{
        newPost.push(user.posts[i])
      }
      
    }
    User.User.findByIdAndUpdate(user._id,
    { 
        "$set": { "posts": newPost} 
    } ,
    { "new": true, "upsert": true },
    function (err, user) {
        if (err) throw err;
        res.json(user)
     }
  );
     
   }
 })
})



router.put('/createPost',function(req,res){
   var id = Math.random().toString(36).substr(2, 9)
   var name = req.body.name;
   var option = req.body.options.split(";")
   console.log(option)
   var optionCount ={};
   for(var i=0;i<option.length;i++){
    optionCount[option[i]]=0;
  }
  console.log(optionCount)
   var pollData = {name:name,option:option,count:optionCount,ui:Math.random().toString(36).substr(2, 9)};
   console.log(pollData)
  if(req.isAuthenticated()){
    User.User.findByIdAndUpdate(req.user._id,
    { 
        "$push": { "posts": pollData } 
    } ,
    { "new": true, "upsert": true },
    function (err, user) {
        if (err) throw err;
      
      
        res.json(user)
     }
 );
  }
  else{
     res.send('you are not authenticated')
  }
  
})


module.exports = router;