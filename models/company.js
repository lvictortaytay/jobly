//using strict mode
"use strict";

//will be utilizing the database
const db = require("../db");

//utilizing two types of erros from the express error class
const { BadRequestError, NotFoundError } = require("../expressError");

// requiring this function 
const { sqlForPartialUpdate } = require("../helpers/sql");




//this is the company class with many methods ( the first being to create and throw an error if comp exists )
class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */









// C R E A T E   method --------------------------------------------------------------------------------------------------------------------
  static async create({ handle, name, description, numEmployees, logoUrl }) {
    //first check to see if there is a company that already exists with the data that is given
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);
    
    //if there is data is true ( throw error , duplicate company meaning the handle or bandname has to be unique )
    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    //if the if statement does not work that means that the company handle is unique , the go with query to create
    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];
    

    //returns the company after it has been created
    return company;
  }








// F I N D   A L L      method --------------------------------------------------------------------------------------------------------------------
  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  //this is a method to get all of the companies in the database ( may need this for a drop down option )
  static async findAll() {
    const companiesRes = await db.query(
      //this is the query , it is ordered by alphebetical in name 
      `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }







  // S P E C I F I C     C O M P  +  method --------------------------------------------------------------------------------------------------------------------
  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/



  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];
    
    //simple check to see if a specific company was not found according to its handle 
    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }






static async search(term){
  const searchRes = await db.query(`
    SELECT handle,name,description,num_employees AS "numEmployees",logo_url AS "logoUrl" FROM companies WHERE handle LIKE "$1"
  `, [handle])

  if(!searchRes.rows){
    throw new NotFoundError(`no companies found for search term ${term}`);
  }
}



static async minNum(num){
  const res = await db.query(`
  SELECT handle,name,description,num_employees AS "numEmployees",logo_url AS "logoUrl" FROM companies WHERE numEmployees > $1
`, [num])
const companies = res.rows
return companies
}



static async maxNum(num){
  const res = await db.query(`
  SELECT handle,name,description,num_employees AS "numEmployees",logo_url AS "logoUrl" FROM companies WHERE numEmployees < $1
`, [num])
const companies = res.rows
return companies
}




  // U P D A T E    C O M P  +  method --------------------------------------------------------------------------------------------------------------------
  /** Update company data with `data`.
   * using data given to update a company , this is a put request on the server 
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */



  //update function , takes in two paramns ( handle and the data to update )
  static async update(handle, data) {
    //utilizing this from sql.js to help
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);
    //using the keys in the obj to easily choose where to update from
    //utlizing the handles as well , can be a mass update 
    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];
    
    //if company returned is not true the throw an error
    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }











// D E L E T E   C O M P  +  method --------------------------------------------------------------------------------------------------------------------
  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/
  //simple query using the handle to choose which company to delete 
  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];
    //if company not found throw error stating what handle you tried to find
    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}





//exporting this class to be used in the routes 
module.exports = Company;
