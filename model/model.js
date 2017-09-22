"use strict";
const { Pool } = require('pg')

const pool = new Pool(
{
    user: 'bim',
    host: 'localhost',
    database: 'breaddb',
    password: '12345',
    port: 5432,
});

function filterQuery(userQuery, command, limit, offset) {
  let sqlQuery = ''
  let filterQuery = []
  let isFilter = false;

  if(command === 'getTableDataCount') {
    sqlQuery = 'SELECT COUNT(*) FROM bread'
  }
  else if(command === 'getTableData') {
    sqlQuery = 'SELECT * FROM bread'
  }

  if(userQuery.checkboxid && userQuery.id){
    filterQuery.push(`id = '${userQuery.id}'`);
    isFilter = true;
  }
  if(userQuery.checkboxstring && userQuery.datastring){
    filterQuery.push(`datastring = '${userQuery.datastring}'`);
    isFilter = true;
  }
  if(userQuery.checkboxinteger && userQuery.datainteger){
    filterQuery.push(`datainteger = ${userQuery.datainteger}`);
    isFilter = true;
  }
  if(userQuery.checkboxfloat && userQuery.datafloat){
    filterQuery.push(`datafloat = ${userQuery.datafloat}`);
    isFilter = true;
  }
  if(userQuery.checkboxdate && userQuery.startdate && userQuery.enddate){
    filterQuery.push(`datadate BETWEEN '${userQuery.startdate}' AND '${userQuery.enddate}'`);
    isFilter = true;
  }
  if(userQuery.checkboxboolean && userQuery.databoolean){
    filterQuery.push(`databoolean = '${userQuery.databoolean === "True" ? true : false}'`);
    isFilter = true;
  }
  if(isFilter){
    sqlQuery += ' WHERE ' + filterQuery.join(' AND ');
  }
  if(command === 'getTableData') {
    sqlQuery += ` ORDER BY id LIMIT ${limit} OFFSET ${offset};`
  }
  return sqlQuery;
}

function getTableDataCount(cb, userQuery, limit, offset) {
  let filteredQuery = filterQuery(userQuery, "getTableDataCount", limit, offset)
  pool.query(filteredQuery, (err, res) => {
    cb(res.rows[0].count)
  });
}

function getTableData(cb, userQuery, limit, offset) {
  let filteredQuery = filterQuery(userQuery, "getTableData", limit, offset)
  pool.query(filteredQuery, (err, res) => {
    cb(res.rows)
  })
}

function insertToTable(datastring, datainteger, datafloat, datadate, databoolean) {
  const insertQuery = `INSERT INTO bread(datastring, datainteger, datafloat, datadate,
  databoolean) VALUES('${datastring}', ${datainteger}, ${datafloat}, '${datadate}',
  '${databoolean}');`;
  pool.query(insertQuery, (err, res) => {
    if(err) {
      throw err;
    }
  })
}

function searchEditDatabase(cb, id) {
  const searchQuery = `SELECT * FROM bread WHERE id = ${id}`;
  pool.query(searchQuery, (err, singleData) => {
    if(err) {
      throw err;
    }
    cb(singleData.rows[0]);
  });
}

function editDatabase(id, datastring, datainteger, datafloat, datadate, databoolean) {
  const editQuery = `UPDATE bread SET datastring = '${datastring}',
  datainteger = ${datainteger}, datafloat = ${datafloat}, datadate = '${datadate}',
  databoolean = '${databoolean}' WHERE id = ${id}`;
  pool.query(editQuery, (err, singleData) => {
    if(err) {
      throw err;
    }
  });
}

function deleteDatabase(id) {
  const deleteQuery = `DELETE from bread where id = ${id}`
  pool.query(deleteQuery, (err, singleData) => {
    if(err) {
      throw err;
    }
  });
}

module.exports = {
  getTableData: getTableData,
  getTableDataCount: getTableDataCount,
  insertToTable: insertToTable,
  searchEditDatabase: searchEditDatabase,
  editDatabase: editDatabase,
  deleteDatabase: deleteDatabase
}
