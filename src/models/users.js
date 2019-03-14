const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config').get();
const SALT_I = 10;

const usersSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    name:{
        type:String,
        maxlength:50,
    },
    username:{
        type:String,
        required:true,
        unique:1,
    },
    avatar:{
        type:String,
        default:"",
    },
    bio:{
        type:String,
    },
    token:{
        type:String,
    }
});

usersSchema.pre('save',function(next){
    let user = this;
    if(user.isModified('password')){
        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err) return next(err);
            bcrypt.hash(user.password,salt,function(err,hash){
             if(err) return next(err);
                user.password = hash;
		next();
            });
        });
    }else{
        next();
    }
});

usersSchema.methods.comparePassword = function(pass,cb){
    bcrypt.compare(pass,this.password,function(err,isMatch){
        if(err) return cb(err);
        cb(null,isMatch);
    });
};

usersSchema.methods.genToken = function(cb){
    const token = jwt.sign(this._id.toHexString(),config.SECRET);
    this.token = token;
    this.save((err,user)=>{
        if(err) return cb(err);
        cb(null,user);
    });
};

usersSchema.statics.findByToken = function(token,cb){
    let user = this;
    jwt.verify(token,config.SECRET,(err,decode)=>{
        user.findOne({'_id':decode,token:token},(err,user)=>{
            if(err) return cb(err);
            cb(null,user);
        });
    });
}

const Users = mongoose.model('Users',usersSchema);

module.exports = { Users };
