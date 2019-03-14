const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./src/config/config').get();
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

usersSchema.pre('save',(next)=>{
    if(usersSchema.isModified('password')){
        bcrypt.genSalt(SALT_I,(err,salt)=>{
            if(err) return next(err);
            bcrypt.hash(this.password,salt,(err,hash)=>{
                if(err) return next(err);
                this.password = hash;
            });
        });
    }else{
        next();
    }
});

usersSchema.methods.comparePassword = (pass,cb)=>{
    bcrypt.compare(pass,this.password,(err,isMatch)=>{
        if(err) return cb(err);
        cb(null,isMatch);
    });
};

usersSchema.methods.genToken =(cb)=>{
    const token = jwt.sign(this._id.toHexString(),config.SECRET);
    this.token = token;
    this.save((err,this)=>{
        if(err) return cb(err);
        cb(null,this);
    });
};

usersSchema.statics.findByToken = (token,cb)=>{
    jwt.verify(token,config.SECRET,(err,decode)=>{
        this.findOne({'_id':decode,token:token},(err,user)=>{
            if(err) return cb(err);
            cb(null,user);
        });
    });
}

const Users = mongoose.model('Users',usersSchema);

module.exports = { Users };