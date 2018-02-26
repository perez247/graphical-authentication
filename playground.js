let {utilis} = require('./model/helper');
const randomstring = require('randomstring');

const sha256 = require('js-sha256');

console.log(sha256.hmac('key','password'));
console.log(sha256.hmac('key','password'));