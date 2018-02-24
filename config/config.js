let env = process.env.NODE_ENV ||  "development";

if(env === "development" || env === "test"){
    let envConfig = require('./config.json');

    Object.keys(envConfig[env]).forEach((key)=>{
        process.env[key] = envConfig[env][key];
    });
}
