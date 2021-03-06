const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const config = require('./src/config/config').get();
const port = config.PORT ;
const SERVER = config.SERVER;
const app = express();
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./images/');
    },

});
const fileFilter =(req,file,cb)=>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
	cb(null,true);
    }else{
	cb("cant upload that format",false);
    }
}
const upload = multer({storage:storage,fileFilter:fileFilter});

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE,{
		useNewUrlParser: true,
        useCreateIndex: true});

const {Users} = require('./src/models/users');
const {Posts} = require('./src/models/posts');
const {Reports} = require('./src/models/reports');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use('/images',express.static('images'));
app.use(cookieParser());

// GET
app.get('/api/getuser',(req,res)=>{
    let id = req.query.userid;
    Users.findById(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            username:doc.username,
	    bio:doc.bio,
	    avatar:doc.avatar,
	    noPosts:doc.noPosts
        });
    });
});

String.prototype.toObjectId = function() {
  var ObjectId = (require('mongoose').Types.ObjectId);
  return new ObjectId(this.toString());
};

app.get('/api/getuserposts',(req,res)=>{
    let id = req.query.userid;
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    Posts.find({ user_data : id.toObjectId() })
    .skip(skip)
    .sort({_id:order})
    .limit(limit)
    .exec((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.send(doc);
    });
});

app.get('/api/posts',function(req,res){
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    Posts.find()
	.skip(skip)
	.sort({_id:order})
	.limit(limit)
	.populate('user_data','username avatar')
	.exec(async function(err,doc){
            if(err) return res.status(400).send(err);
	    res.send(doc);
	});
});

app.get('/api/myposts',(req,res)=>{
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    let id = req.query.userid;
    Posts.find({user_data : id.toObjectId() })
	.skip(skip)
 	.sort({_id:order})
	.limit(limit)
	.exec((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.send(doc);
    });
});

app.get('/api/search',async(req,res)=>{
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    let tag = req.query.tag;
    Posts.find({tags: { $in: [tag] }})
	.skip(skip)
	.sort({_id:order})
	.limit(limit)
	.populate('user_data','username avatar')
	.exec(async(err,doc)=>{
            if(err) return res.status(400).send(err);
            res.send(doc);
	});
});

app.get('/api/location',(req,res)=>{
    let skip = parseInt(req.query.skip);
    let limit = parseInt(req.query.limit);
    let order = req.query.order;
    let hash = req.query.hash;
    Posts.find()
	.skip(skip)
	.sort({_id:order})
	.limit()
	.populate('user_data','username avatar')
	.exec((err,doc)=>{
            if(err) return res.status(400).send(err);
            res.send(doc);
	});
});

// POST
app.post('/api/signup',(req,res)=>{
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
        if(!user) return res.json({isAuth:false,err:'email doesnt exist !'});
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

app.post('/api/addpost',upload.single('image'),(req,res)=>{
    const post = new Posts({
        ...req.body,
        image_url:`${SERVER}/${req.file.path}`,
    });
    post.save((err,doc)=>{
        if(err) return res.status(400).json({
            post_success:false,
            err:err
	});
	Users.findByIdAndUpdate(req.body.user_data,{ $inc: { noPosts: 1 } },(error,response)=>{
            if(error) return response.status(400).json({
		post_success:false,
		err:error
	    });
	     res.status(200).json({
                post_success:true,
                post:doc
            });
	});
    });
});

app.post('/api/report',(req,res)=>{
    const report = new Reports(req.body);
    report.save((err,doc)=>{
	if(err) return res.status(400).json({
	    report:false,
	    error:err
	});
	res.status(200).json({
	    report:true
	});
    });
});

// UPDATE
app.post('/api/userupdate',upload.single('image'),(req,res)=>{
    const userid = req.query.userid;
    if(req.file == undefined){
        var data ={
            ...req.body
        };
    }else{
	var data = {
	    ...req.body,
	    avatar:`${SERVER}/${req.file.path}`
	};
    }
    Users.findByIdAndUpdate(userid,data,{new:true},(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            update:true,
            user:doc,
        });
    });
});

app.post('/api/postupdate',(req,res)=>{
    const postid = req.query.id;
    Users.findByIdAndUpdate(postid,{
        ...req.body,
        image_url:`${SERVER}/${req.file.path}`,
    },
    {new:true},
    (err,doc)=>{
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
    let userid = req.query.userid;
    Posts.findByIdAndRemove(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
	 Users.findByIdAndUpdate(userid,{$inc: { noPosts: -1 } },(error,user)=>{
             if(err) return res.status(400).send(err);
             res.json({
         	delete:true,
             });
        });
    });
});

app.listen(port,()=>{
console.log("It's Working !")
});
