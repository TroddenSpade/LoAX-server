const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const reportsSchema = mongoose.Schema({
    user_id:{
        type:String,
        required:true,
    },
    post_id:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
});

const Reports = mongoose.model('Reports',reportsSchema);

module.exports = { Reports };