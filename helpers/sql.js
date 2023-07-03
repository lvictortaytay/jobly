const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

//takes in two params , ( data to update , javascript to sql)
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  //extracting the keys from the data object and storing it in the keys variable
  const keys = Object.keys(dataToUpdate);
  //if there are no keys , then throw an error that there is no data 
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
  //mappign either jstosql or colname and setting each one to eql the idx + 1 
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );


  //returns an object 
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
