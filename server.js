const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const {Users} = require('./src/models/users');
const {Posts} = require('./src/models/posts');
const {Reports} = require('./src/models/reports');

const config = require('./src/config/config').get();
const port = config.PORT ;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE,{
		useNewUrlParser: true,
		useCreateIndex: true});

// POST
app.post('/api/adduser',(req,res)=>{
    console.log(req);
    const user = new Users(req.body);
    user.save((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            post:true,
            post_id:doc._id
        })
    })
});

app.listen(port,()=>{
    console.log("It's Working !")
});
