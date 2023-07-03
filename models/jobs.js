"use strict"
//always use strict mode i guess



const db = require("../db")
const {
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
  } = require("../expressError");




class Job {

    static async CreateJob(data){
        const { title , salary , equity , company_handle } = data;
        const newJob = await db.query(`INSERT INTO jobs (title , salary , equity , company_handle) VALUES($1,$2,$3)` , [title , salary , equity , company_handle])
        return newJob
    }


    static async Update(data , id){
        const { title , salary , equity , company_handle } = data;
        const check = await db.query(`SELECT * FROM jobs WHERE id = $1`, [id])
        if(!check){
            throw new NotFoundError(`cannot find job at id :${id}`)
        }
        const update = await db.query(`UPDATE jobs SET(title = $1, salary = $2 , equity = $3, company_handle = $4) WHERE id = $5` , [title , salary , equity , company_handle , id])
        return update;
        
    }







}

module.exports = Job;