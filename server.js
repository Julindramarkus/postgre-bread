'use strict'

const express = require('express')
const app = express();
const path = require('path');
const moment = require('moment');
const bodyParser = require('body-parser');
const {Client} = require('pg');
const client = new Client({
  user:'postgres',
  host:'localhost',
  database: 'Crud',
  password: '12345',
  port: 5432
})
client.connect();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('portMikha', 3000)
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-cache');
  next()
});

//router
app.get('/', function(req, res) {
  console.log(req.url);
  let url = (req.url == "/") ? "/?page=1" : req.url;

  //filter
  let filter = []
  let isFilter = false;
  let sql = 'SELECT count(*) AS total FROM crud'
  if(req.query.cid && req.query.id){
    filter.push(`id = '${req.query.id}'`);
    isFilter = true;
  }
  if(req.query.cstring && req.query.string){
    filter.push(`stringdata = '${req.query.string}'`);
    isFilter = true;
  }
  if(req.query.cinteger && req.query.integer){
    filter.push(`integerdata = '${Number(req.query.integer)}'`);
    isFilter = true;
  }
  if(req.query.cfloat && req.query.float){
    filter.push(`floatdata = '${parseFloat(req.query.float)}'`);
    isFilter = true;
  }
  if(req.query.cdate && req.query.startdate && req.query.enddate){
    filter.push(`datedata BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`);
    isFilter = true;
  }
  if(req.query.cboolean && req.query.boolean){
    filter.push(`booleandata = '${JSON.parse(req.query.boolean) ? 'true' : 'false'}'`);
    isFilter = true;
  }
  if(isFilter){
    sql += ' WHERE ' + filter.join(' AND ')
  }

  // count record on table
  client.query(sql, (err, data) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    // pagination
    var page = Number(req.query.page) || 1
    var limit = 3
    var offset = (page-1) * 3
    var total = data.rows[0].total;
    var pages = (total == 0) ? 1 : Math.ceil(total/limit);
    sql = "SELECT * FROM crud";
    if(isFilter){
      sql += ' WHERE ' + filter.join(' AND ')
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    // select with pagination
    client.query(sql, (err, rows) => {
      if (err) {
        console.error(err)
        return res.send(err);
      }
      console.log(rows.rows);
      res.render('list', {title: "BREAD",header: "BREAD", rows: rows.rows, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
    });
  });
});

app.get('/add', function(req,res) {
  res.render('add', {title: "Test | add"});
});


app.post('/add', function(req,res) {
  // console.log(typeof req.body.boolean);
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = req.body.boolean;

  client.query("INSERT INTO user (string,integer,float,date,boolean) VALUES ($1 ,$2 ,$3 ,$4 ,$5)", [string, integer, float, date, boolean], function(err, rows){
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  }) ;
});

app.get('/edit/:id', function(req,res) {
  let id = req.params.id;
  client.query("SELECT * FROM user WHERE id = $1", [id], function(err, rows){
    if (err) {
      console.error(err);
      return res.send(err);
    }
    if (rows.rows.length > 0) {
      rows.rows[0].datedata = moment(rows.rows[0].datedata).format('YYYY-MM-DD');
      res.render('edit', {title: "Test | edit", item: rows[0] });
    } else{
      res.send('Undefined!')
    }
  })
});

app.post('/edit/:id', function(req,res) {
  let id = Number(req.params.id) //pakai number karna dia ubah string jadi number
  let string = req.body.string;
  let integer = parseInt(req.body.integer);
  let float = parseFloat(req.body.float);
  let date = req.body.date;
  let boolean = req.body.boolean;

  client.query("UPDATE user SET string=$1, integer=$2, float=$3, date=$4, boolean=$5 WHERE id = $6", [string, integer, float, date, boolean, id], function(err){ //tanda ? di ganti jadi $ karna dah ganti databasenya
    res.redirect('/');
  }) ;
});

app.get('/delete/:id', function(req, res){
  var id = req.params.id;
  client.query("DELETE FROM user WHERE id = $1", [id], function(err, rows){
    if (err) {
      console.error(err);
      return res.send(err);
    }
    res.redirect('/');
  })
});

app.listen(3000, function(){
  console.log("SERVER OK DELIVERY OK");
})
