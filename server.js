'use strict'
const sqlite3 = require("sqlite3").verbose();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require ('path');


//connection to postgresql server
const {Client} = require('pg')
const client = new Client({
  user: 'arry',
  host: 'localhost',
  database: 'breaddb',
  password: '12345',
  port: 5432 ,
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


app.get('/', (req, res)=>{
  //filter
  let filter = []
  let isFilter = false;

  if(req.query.cid && req.query.id){
    filter.push(`id = ${req.query.id}`)
    isFilter = true;
  }
  if(req.query.cstring && req.query.string){
    filter.push(`datastring = '${req.query.string}'`)
    isFilter = true;
  }
  if(req.query.cinteger && req.query.integer){
    filter.push(`datainteger = ${req.query.integer}`)
    isFilter = true;
  }
  if(req.query.cfloat && req.query.float){
    filter.push(`datafloat = ${req.query.float}`)
    isFilter = true;
  }
  if(req.query.cdate && req.query.startdate && req.query.enddate){
    filter.push(`datadate BETWEEN ${req.query.startdate} AND ${req.query.enddate}`)
    isFilter = true;
  }
  if(req.query.cboolean && req.query.boolean){
    filter.push(`databoolean is ${req.query.boolean}`)
    isFilter = true;
  }
  let sql = 'SELECT count(*) AS total FROM bread'
  if(isFilter){
    sql += ` WHERE ${filter.join(' AND ')}`
  }
  // count record on table
  client.query(sql,(err, data)=>{
    if (err) {
      console.error(err);
      return res.send(err);
    }
    //pagination
    let url = (req.url == "/") ? "/?page=1" : req.url
    let page = Number(req.query.page) || 1
    let limit = 3
    let offset = (page-1) * 3
    let total = data.rows[0].total
    let pages = (total == 0) ? 1 : Math.ceil(total/limit)
    let sql ='SELECT * FROM bread'
    if(isFilter){
      sql += ` WHERE ${filter.join(' AND ')}`
    }
      sql += ` LIMIT ${limit} OFFSET ${offset}`

    // select with pagination
    client.query(sql, (err, data)=>{
      if (err) {
        console.error(err)
        return res.send(err);
      }
      res.render('list', {title: "BREAD",header: "BREAD", rows: data.rows, pagination:{page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});
    });
  });
});

//add
app.get('/add',(req,res)=>{
  res.render('add');
});
app.post('/add',(req,res)=>{
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = JSON.parse(req.body.boolean);
  client.query(`INSERT INTO bread(datastring,datainteger,datafloat,datadate,databoolean) VALUES($1,$2,$3,$4,$5)`,[string,integer,float,date,boolean],(err) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
});


//edit
app.get('/edit/:id',(req,res)=>{
  let id = req.params.id
  client.query('SELECT * FROM bread WHERE id = $1', [req.params.id], (err, data)=>{
    if(err) {
      console.error(err)
      return res.send(err);
    }
    if(data.rows.length > 0){
      res.render('edit', {item: data.rows[0]});
    }else{
      res.send('Data Not Found');
    }
  })
})
app.post('/edit/:id', (req, res)=>{
  let id = req.params.id
  var string = req.body.string;
  var integer = parseInt(req.body.integer);
  var float = parseFloat(req.body.float);
  var date = req.body.date;
  var boolean = JSON.parse(req.body.boolean);
  client.query(`UPDATE bread SET datastring=$1, datainteger=$2, datafloat=$3, datadate=$4, databoolean=$5 WHERE id=$6` ,[string,integer,float,date,boolean,id],(err)=>{
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
})


//delete
app.get('/delete/:id', (req, res)=>{
  client.query(`DELETE FROM bread WHERE id =$1` ,[req.params.id],(err)=>{
    if (err) {
      console.error(err)
      return res.send(err);
    }
    res.redirect('/')
  })
})

app.listen(3000, ()=>{
  console.log("Server is Online")
});
