var mongoose = require('mongoose');
var mongoose = require('mongoose');

var Schema =mongoose.Schema;

var userSchema = new Schema({
	username:String,
	email:String,
  password:String,
  posts:Array
})
var countSchema = new Schema({
	count:Array
})

var User = mongoose.model('User',userSchema,'users');
var Count = mongoose.model('Count',countSchema,'users');

module.exports = {User:User,
                 Count:Count}
//module.exports=Count