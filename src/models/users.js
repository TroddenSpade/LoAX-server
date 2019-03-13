const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    }
});

const Users = mongoose.model('Users',usersSchema);

module.exports = { Users };