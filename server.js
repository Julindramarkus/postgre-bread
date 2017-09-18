"use strict"

const express = require('express');
const app = express();
const path = require('path')
const moment = require('moment');


const bodyParser = require('body-parser');

const { Client } = require('pg')
const client = new Client({
  user: 'Firmansyah',
  host: 'localhost',
  database: 'breaddb',
  password: '123456',
  port: 5432
})
client.connect()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-control', 'no-cache');
  next();
});


app.get('/', function(req, res) {
  var url = (req.url == "/") ? "/?page=1" : req.url;
  var page = Number(req.query.page) || 1
  if(url.indexOf('&submit=') != -1){
    page = 1;
  }
  url = url.replace('&submit=', '')
  //filter
  var filter = []
  var isFilter = false;
  var sql = 'SELECT count(*) AS total FROM bread'
  if(req.query.check_id && req.query.id){
    filter.push(`id = '${req.query.id}'`);
    isFilter = true;
  }
  if(req.query.check_string && req.query.string){
    filter.push(`stringdata = '${req.query.string}'`);
    isFilter = true;
  }
  if(req.query.check_integer && req.query.integer){
    filter.push(`integerdata = '${Number(req.query.integer)}'`);
    isFilter = true;
  }
  if(req.query.check_float && req.query.float){
    filter.push(`floatdata = '${parseFloat(req.query.float)}'`);
    isFilter = true;
  }
  if(req.query.check_date && req.query.startdate && req.query.enddate){
    filter.push(`datedata BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`);
    isFilter = true;
  }
  if(req.query.check_boolean && req.query.boolean){
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
    var limit = 3
    var offset = (page-1) * 3 //
    var total = data.rows[0].total;
    var pages = (total == 0) ? 1 : Math.ceil(total/limit);
    sql = "SELECT * FROM bread";
    if(isFilter){
      sql += ' WHERE ' + filter.join(' AND ')
    }
    sql += ' ORDER BY id'
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    console.log(sql);
    // select with pagination
    client.query(sql, (err, data) => {
      if (err) {
        console.error(err)
        return res.send(err);
      }
      res.render('list', {title: "BREAD",header: "BREAD", rows: data.rows, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
    });
  });
});



app.get('/add', function(req,res) {
  res.render('add', {title: "Add"});
});

app.post('/add', function(req,res) {
  let string = req.body.string
  let integer = req.body.integer
  let float = req.body.float
  let date = req.body.date
  let boolean = req.body.boolean

  client.query("INSERT INTO bread (stringdata, integerdata, floatdata, datedata, booleandata) VALUES ($1, $2, $3, $4, $5)", [string, integer, float, date, boolean], function(err){
    res.redirect('/');
  });
});

app.get ('/edit/:id', function (req, res){
  let id = req.params.id
  client.query("SELECT * FROM bread WHERE id = $1", [id], (err, data)=>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(data.rows.length > 0){
      data.rows[0].datedata = moment(data.rows[0].datedata).format('YYYY-MM-DD');
      console.log(data.rows[0].datedata);
      res.render('edit', {title: 'edit', item: data.rows[0]});
    }else{
      res.send('Data Not Found');
    }
  })
})

app.post('/edit/:id', function(req,res) {
  let id = Number(req.params.id)
  let string = req.body.string
  let integer = req.body.integer
  let float = req.body.float
  let date = req.body.date
  let boolean = req.body.boolean

  client.query("UPDATE bread SET stringdata = $1, integerdata = $2, floatdata = $3 , datedata = $4, booleandata = $5 WHERE id=$6", [string, integer, float, date, boolean, id], function(err){
    res.redirect('/');
  });
});

app.get ('/delete/:id', function(req,res) {
  var id = req.params.id
  client.query ("DELETE FROM bread Where id=$1", [id], (err,rows) =>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(rows.length > 0){
      res.render('delete', {item: rows[0]});
    }else{
      res.redirect('/');
    }
  })
})


app.listen(3000, function() {
  console.log("server is online")
});
