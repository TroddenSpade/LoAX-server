const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const config = require('./src/config/config').get();
const port = config.PORT ;
const app = express();

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE,{
		useNewUrlParser: true,
        useCreateIndex: true});

const {Users} = require('./src/models/users');
const {Posts} = require('./src/models/posts');
const {Reports} = require('./src/models/reports');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());

// GET
app.get('/api/getuser',(req,res)=>{
    let id = req.query.id;
    Users.findById(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.send(doc);
    });
});

app.get('/api/posts',(req,res)=>{
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    Posts.find().skip(skip).sort({_id:order}).limit(limit).exec((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.send(doc);
    });
});

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

// UPDATE
app.post('/api/userupdate',(req,res)=>{
    Users.findByIdAndUpdate(req.body._id,req.body,{new:true},(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            update:true,
            user:doc,
        });
    });
});

// DELETE
app.delete('/api/deletepost',(req,res)=>{
    let id = req.query.id;
    Posts.findByIdAndRemove(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            delete:true,
        });
    });
});

app.listen(port,()=>{
console.log("It's Working !")
});
