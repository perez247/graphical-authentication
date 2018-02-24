const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
const _ = require('lodash');
// const bcrypt = require('bcryptjs');
const validator = require('validator');

const {utilis} = require('./helper');

var userSchema = new mongoose.Schema({
    userId: {
        type:String, 
        required:true, 
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique:true
    },
    lineValues: {
        type:String,
        trim:true,
        length:7,
    },
    recovery: {
        type:String,
        maxlength:64,
        set: utilis.hashPassword
    },
    password:{
        type:String,
        required:true,
        minlength: 6,
        set: utilis.hashPassword
    },
    tokens:[{
        access:{
            type:String,
            required:true
        },
        token:{
            type:String,
            required:true            
        }
    }]
  });

  userSchema.methods.toJSON = function(){
    return _.pick(this.toObject(),['_id','email','name']);
  }

  userSchema.methods.generateAuthToken = function(){
    let user = this;
    let access = "auth";
    let token = jwt.sign({_id:user._id.toHexString(),access},process.env.JWT_SECRET).toString();
    // user.tokens = [];
    user.tokens.push({access,token});
    return user.save().then(()=>{
        return token;
    });
  }

  userSchema.methods.removeToken = function(token){
    let user = this;

    return user.update({
        $pull:{
            tokens:{token}
        }
    })
  }

  userSchema.statics.findByToken = function(token){
      let User = this;
      let decoded;

      try {
          decoded = jwt.verify(token,process.env.JWT_SECRET);
      } catch (e) {
          return Promise.reject();
      }

      return User.findOne({
          '_id': decoded._id,
          'tokens.access':decoded.access,
          'tokens.token':token
      })
  }

  userSchema.statics.findCredentials = function(data){
      return User.findOne({email:data.email}).then((user)=>{
            if(!user)
                return Promise.reject();
            return new Promise((resolve,reject)=>{
                if(utilis.comparePassword(data.password,user.password)){
                    resolve(user);
                }
                else  
                    reject();
            })
      })
  }

class User{

    static model = mongoose.model('User',userSchema);

    static verifyEmail = (email)=>{
        return new Promise((resolve,reject)=>{
            if(validator.isEmail(email))
                resolve(email);
            else
                reject(`${email} is not an email`);
        })
    }

    static uniqueEmail = (email)=>{
        return new Promise((resolve,reject)=>{
            return User.verifyEmail(email).then((email)=>{
                if(!User.model.find({userId:email}))
                    resolve(true);
                else
                    reject(`${email} has already been taking`);
            })
        })
    }
}

module.exports = {
    User
}