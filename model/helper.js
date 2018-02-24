const bcrypt = require('bcryptjs');

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
    }
}

module.exports = {utilis}
