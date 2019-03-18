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
    Posts.find().skip(skip).sort({_id:order}).limit(limit).exec(async(err,doc)=>{
        if(err) return res.status(400).send(err);
	for(let i=0;i<doc.length;i++){
	    await Users.findById(doc[i].user_data.userid,(error,user)=>{
		doc[i].user_data.username = user.username;
		doc[i].user_data.avatar = user.avatar;
	    });
	}
	res.send(doc);
    });
});

app.get('/api/myposts',(req,res)=>{
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    Posts.find({"user_data.userid":req.query.userid})
	.skip(skip)
	.sort({_id:order})
	.limit(limit)
	.exec((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.send(doc);
    });
});

// POST
app.post('/api/signup',(req,res)=>{
    console.log(req.body);
    const user = new Users(req.body);
    user.save((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            signup:true,
            user:doc
        });
    });
});

app.post('/api/signin',(req,res)=>{
    Users.findOne({'email':req.body.email},(err,user)=>{
        if(!user) res.json({isAuth:false,err:'email doesnt exists !'});
        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) return res.json({isAuth:false,err:"wrong password !"});
            user.genToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.json({
                    isAuth:true,
                    user:user,
                });
            });
        });
    });
});

app.post('/api/checktoken',(req,res)=>{
    Users.findById(req.body.id,(err,doc)=>{
	if(err) return res.json({valid:false});
	if(doc.token == req.body.token){
	    res.json({valid:true,user:doc});
	}else{
	    res.json({valid:false});
	}
     });
});

app.post('/api/addpost',(req,res)=>{
    const post = new Posts(req.body);
    post.save((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            post_success:true,
            user:doc
        });
    });
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
