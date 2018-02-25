const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken');
const _ = require('lodash');
// const bcrypt = require('bcryptjs');
const {utilis} = require('./helper');

var otpSchema = new mongoose.Schema({
    userId: {
        type:String, 
        required:true, 
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique:false
    },
    otp: {
        type:String,
        default:utilis.generateOtp(),
    }
  });

  otpSchema.methods.toJSON = function(){
    return _.pick(this.toObject(),['userId','otp']);
  }

class Otp{

    // static model = mongoose.model('User',userSchema);
    static findUserAndOtp(data){
        return new Promise(function(resolve,reject){
            Otp.model.findOne({
                userId:data.email,
                otp:data.otp
            }).then(function(otp){
                Otp.model.removeOne({
                    otp:otp.otp
                });
                resolve(true);
            },function(e){
                reject(false);
            })
        })
    }

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

Otp.model = mongoose.model('Otp',otpSchema);

module.exports = {
   Otp
}