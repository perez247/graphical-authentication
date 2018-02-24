require('./config/config');

const express = require('express');
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {User} = require('./model/user');

const publicPath = path.join(__dirname, './public');
hbs.registerPartials(__dirname+'/views/partials');
let app = express();
app.set('view-engine','hbs');

app.use('/', express.static(publicPath));
app.use(bodyParser.json());

app.get('/login',(req,res)=>{
    res.render('login.hbs');
});

app.get('/register',(req,res)=>{
    res.render('register.hbs');
});

app.post('/verifyEmail',async (req,res)=>{
    try {
        let stats = await User.uniqueEmail(req.body.email);
        res.send({stats});
    } catch (e) {
        res.send({
            stats:false,
            reason:e
        });
    }
});

app.post('/createuser', async (req,res)=>{
    try {
        let body = _.pick(req.body,['userId','lineValues','hPassword','recovery']);
        let user = await new User.model(body).save();
        res.send({user});      
    } catch (error) {
        res.send({error})
    }
})

app.get('*',(req,res)=>{
    res.send({e:'page not found'});
});

PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`);
})