const sqlite3 = require("sqlite3").verbose();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');;
const path = require('path');

//koneksi
const { Client } = require('pg')
const client = new Client({
  user : 'william',
  host : 'localhost',
  database : 'breaddb',
  password : '123456',
  port : 5432
})

client.connect()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-control', 'no-cache');
  next();
});

app.get('/', function(req, res) {
  let filter = []
  let isFilter = false;
  if(req.query.cid && req.query.id){
    filter.push(`id = ${req.query.id}`)
    isFilter = true;
  }
  if(req.query.cstring && req.query.string){
    filter.push(`stringdata = '${req.query.string}'`)
    isFilter = true;
  }
  if(req.query.cinteger && req.query.integer){
    filter.push(`integerdata = ${req.query.integer}`)
    isFilter = true;
  }
  if(req.query.cfloat && req.query.float){
    filter.push(`floatdata = ${req.query.float}`)
    isFilter = true;
  }
  if(req.query.cdate && req.query.startdate && req.query.enddate){
    filter.push(`datedata BETWEEN '${req.query.startdate}' AND '${req.query.enddate}'`)
    isFilter = true;
  }
  if(req.query.cboolean && req.query.boolean){
    filter.push(`booleandata is ${req.query.boolean}`)
    isFilter = true;
  }
  let sql = 'SELECT count(*) AS total FROM bread'
  if(isFilter){
    sql += ` WHERE ${filter.join(' AND ')}`
  }
  client.query(sql, (err, data) => {
    if (err) {
      console.error(err);
      return res.send(err);
    }
    let total = data.rows[0].total
    let page = Number(req.query.page) || 1
    let offset = (page - 1) * 3
    let limit = 3
    let pages = (total == 0) ? 1 : Math.ceil(total/limit)
    let url = (req.url == "/") ? "/?page=1" : req.url
    sql = 'SELECT * FROM bread'
    if(isFilter){
      sql += ` WHERE ${filter.join(' AND ')}`
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`
    client.query(sql, (err, data) => {
      if (err) {
        console.error(err);
        return res.send(err);
      }
      res.render('list', {title: "BREAD", header: "BREAD", rows : data.rows, pagination :{page : page, pages : pages, offset : offset, limit : limit, url : url, total : total}, query: req.query});
    });
  });
});

app.get('/add', function(req,res) {
  res.render('add');
});

app.post('/add', function(req, res) {
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date =req.body.date;
  var boolean = JSON.parse(req.body.boolean);
  console.log(`tes ${date}`);
  client.query(`INSERT INTO bread(stringdata, integerdata, floatdata, datedata, booleandata) VALUES($1,$2,$3,$4,$5)`, [string, integer, float, date, boolean], (err) => {
    if(err) {
      console.error(err);
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.get('/edit/:id', function(req, res){
  client.query('SELECT * FROM bread WHERE id = $1', [req.params.id], (err, data)=>{
    if(err){
      console.error(err);
      return res.send(err);
    }
    if(data.rows.length > 0){
      res.render('edit',{item : data.rows[0]});
    }else{
      res.send('data tidak ditemukan')
    }
  })
})

app.post('/edit/:id', (req,res)=>{
  let id = req.params.id
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = JSON.parse(req.body.boolean);
  client.query(`UPDATE bread SET stringdata = $1, integerdata = $2, floatdata = $3, datedata = $4, booleandata = $5 WHERE id = $6`, [string, integer, float, date, boolean, id], (err) => {
    if(err) {
      console.error(err);
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.get('/delete/:id', (req, res)=>{
  client.query('DELETE FROM bread WHERE id = $1', [req.params.id], (err)=>{
    if(err){
      console.error(err);
      return res.send(err);
    }
    res.redirect('/')
  })
})
app.listen(3000, function() {
  console.log("server is online")
});
