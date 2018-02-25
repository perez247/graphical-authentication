const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
const _ = require('lodash');
// const bcrypt = require('bcryptjs');
const validator = require('email-validator');

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
        required:true,
        trim:true,
        length:7,
        validate:{
            validator:utilis.lineValue,
            message: 'Invalid graphical password'
        }
    },
    recovery: {
        type:String,
        required:true,
        maxlength:64
    },
    hPassword:{
        type:String,
        required:true,
        maxlength: 64
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
    return _.pick(this.toObject(),['userId','lineValues']);
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

    // static model = mongoose.model('User',userSchema);

    static verifyEmail(email){
        return new Promise(function(resolve,reject){
            if(validator.validate(email))
                resolve(email);
            else
                reject(`${email} is not an email`);
        })
    }

    static async uniqueEmail(email){
        return new Promise(function(resolve,reject){
            return User.verifyEmail(email).then(function(email){
                return User.model.find({userId:email}).then(function(user){
                    if(user.length>0)
                        reject(`${email} has already been taking`);
                    else
                        resolve(true);
                },function(e){
                    reject(`bad request`);
                })
            }).catch(function(e){
                reject(e);
            });
        })
    }
}

User.model = mongoose.model('User',userSchema);

module.exports = {
    User
}