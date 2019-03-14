const { Users } = require('../models/users');

const auth = (req,res,next)=>{
    const token = req.body.token;
    Users.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(user.id != req.body.id){
	    return res.json({
                auth:false,
                err:"there is no user",
            });
	}
        next();
    });
}

module.exports = { auth };
