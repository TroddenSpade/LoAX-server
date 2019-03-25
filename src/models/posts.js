const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const postsSchema = mongoose.Schema({
    address:{
        type:String,
        required:true,
    },
    geoHash:{
        type:String,
        required:true,
    },
    caption:{
        type:String,
        required:true,
    },
    region:{
        latitude :{
            type:Number,
            required:true,
        },
        latitudeDelta:{
            type:Number,
            default: 0.0421
        },
        longitude:{
            type:Number,
            required:true,
        },
        longitudeDelta:{
            type:Number,
            default: 0.0421
        }
    },
    image_url:{
        type:String,
        required:true,
    },
    tags:{
        type:[String],
    },
    user_data:{
        type : mongoose.Schema.Types.ObjectId,
	ref : 'Users',
	required : true
    }
});

const Posts = mongoose.model('Posts',postsSchema);

module.exports = { Posts };
