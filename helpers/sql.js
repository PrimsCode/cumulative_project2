const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

//Helper function to take any data and update it into the database

//dataToUpdate: Object to be updated {field:value}
//jsToSql: Mapping out the field to match column name of the SQL database EX. {currentField: "current_field"}
function sqlForPartialUpdate(dataToUpdate, jsToSql) {

  //get the keys which are the field names from dataToUpdate
  const keys = Object.keys(dataToUpdate);

  //Error handling if data is not found
  if (keys.length === 0) throw new BadRequestError("No data");

  //Mapping out the field into the correct field name for the database EX. {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  //return updated data
  //setCols: Getting the correct field name for the database from data mapped out earlier
  //values: Setting the values from dataToUpdate
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
