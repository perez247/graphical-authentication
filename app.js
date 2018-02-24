require('./config/config');

const express = require('express');
const hbs = require('hbs');
const path = require('path');
const bodyParser = require('body-parser');

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

app.get('/verifyEmail',async (req,res)=>{
    try {
        let stats = await User.uniqueEmail(req.email);
        res.send({stats});
    } catch (error) {
        res.send({
            stats: false,
            reason: error
        })
    }
})

app.get('*',(req,res)=>{
    res.send({e:'page not found'});
});

PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Listening on Port ${PORT}`);
})