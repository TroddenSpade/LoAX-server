const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const config = require('../config/config').get();
const port = config.PORT ;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE);

app.listen(port,()=>{
    console.log("It's Working !")
});