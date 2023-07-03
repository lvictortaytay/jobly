"use strict";
//this is using strict mode 



//requiring the database to be used as well
const db = require("../db");

//now we are requiring bcrypt so that we can start hashing and comparing 
const bcrypt = require("bcrypt");


//requiring this thing i have no idea how it works ( ask john )
const { sqlForPartialUpdate } = require("../helpers/sql");

//requiring the different methods on the express error class
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

//this is the dynamic work factor that can be adjusted in the config class
const { BCRYPT_WORK_FACTOR } = require("../config.js");









//this is the user class which methods will be used in the server and routes
class User {




// A U T H E N T I C A T I O N  method -----------------------------------------------------------------------------------------------------
  static async authenticate(username, password) {
    
    //first check if the user is in the data base with the given username , if they are return the user info 
    const result = await db.query(
          `SELECT username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    //if the user exist then stare the bcrypt check ( isValid )
    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      //rememeber ^ returns a boolean
      if (isValid === true) {
        //take oute the password from the user obj so it cannot be accessed then return the full thing ( may be passed as a jot )
        delete user.password;
        return user;
      }
    }

    //if none of this works then throw unauthorized , this can be passed as middleware
    throw new UnauthorizedError("Invalid username/password");
  }











// R E G I S T E R   method ------------------------------------------------------------------------------------------------------------------
  /** Register user with data.
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/


  //takes in data in order to register or insert into a database a new row 
  static async register(
      { username, password, firstName, lastName, email, isAdmin }) {
        //ofc first have to check is there is already a user that exist with the given username 
    const duplicateCheck = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );
    

    //this is like ( username already exist : try logging in )
    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    //this is prepping the password to be stored in the database  , using bcrypt with the work factor 
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);


    //returns the user after the insert is made with the hashed password not the real password!
    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
        [
          username,
          hashedPassword,
          firstName,
          lastName,
          email,
          isAdmin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

















  // R E G I S T E R   method ------------------------------------------------------------------------------------------------------------------

  //this is what finds all user like if there is a drop down or use this to search 
  static async findAll() {
    //simple select all query 
    const result = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           ORDER BY username`,
    );

    return result.rows;
  }

















// G E T   U S E R   method ------------------------------------------------------------------------------------------------------------------
  /** Given a username, return data about user.
   *
   * Returns { username, first_name, last_name, is_admin, jobs }
   *   where jobs is { id, title, company_handle, company_name, state }
   *
   * Throws NotFoundError if user not found.
   **/

  //getting a specific user by their username 
  static async get(username) {
    const userRes = await db.query(
          `SELECT username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = userRes.rows[0];
    //if there is no user then throw an error 
    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }














// U P D A T E     method ------------------------------------------------------------------------------------------------------------------
  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, email, isAdmin }
   *
   * Returns { username, firstName, lastName, email, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING username,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                email,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password;
    return user;
  }










  



// D E L E T E     method ------------------------------------------------------------------------------------------------------------------
  static async remove(username) {
    let result = await db.query(
          `DELETE
           FROM users
           WHERE username = $1
           RETURNING username`,
        [username],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
  }
}


module.exports = User;
