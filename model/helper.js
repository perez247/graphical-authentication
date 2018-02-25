const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');

let utilis = {
    hashPassword:(password)=>{
        password = password.trim();
        if(password.length<6)
            return ''
        var salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    },

    comparePassword:(plainText, hashPassword)=>{
        return bcrypt.compareSync(plainText,hashPassword);
    },

    lineValue:(value)=>{
        try {
            let count = 0;
            value.split(',').forEach((element)=>{
                element = parseInt(element);
                if(typeof element === 'number' && element>0)
                    count++;
            });
            return count===3;
        } catch (error) {
            return false;
        }
    },

    generateOtp:()=> randomstring.generate(),
}

module.exports = {utilis}
