"use strict";

/** Shared config for application; can be required many places. */


// this allows for environment variables to be used 
require("dotenv").config();
// this just helps with styling , gives options with styling 
require("colors");




//the secret key is stored on the env variable that can be acessed with dotenv
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";


//the port to connect to is also stored on the process object ( env variable )
const PORT = +process.env.PORT || 3001;


// terinary operator , dynamic database selection
function getDatabaseUri() {
  return (process.env.NODE_ENV === "test")
      ? "jobly_test"
      : process.env.DATABASE_URL || "jobly";
}






//dynamic operator to enhance or slow down work factor 
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;



//this is where the colors comes into play 
console.log("Jobly Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
