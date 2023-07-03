"use strict";
//this is the routes for authentication ( will be used as middleware in the main app.js )




//have to require jsonschema ( used to check the data before it goes into the database )
const jsonschema = require("jsonschema");

//using the userclass 
const User = require("../models/user");
const express = require("express");
const router = new express.Router();
//will be signing jots in this file 
const { createToken } = require("../helpers/tokens");

//one of the schemas for the data in the req.body
const userAuthSchema = require("../schemas/userAuth.json");
//authintication schema for the data in the req.body 
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");




//this returns a jot token for further authentication 
//something will go to this route just to create a js token , returns the signed token
router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});
















/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newUser = await User.register({ ...req.body, isAdmin: false });
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
