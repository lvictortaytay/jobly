const express = require("express")
const { ExpressError } = require("../expressError")
const jobRoute = new express.Router();
const { BadRequestError } = require("../expressError");
const Job = require("../models/jobs")


const db = require("../db")
 


jobRoute.post("/create" , async function(req , res , next){
    try{

    }catch(err){

    }
})

module.exports = jobRoute