"use strict"
const express = require ('express');
const app = express();
const path = require('path');
const bodyParser= require('body-parser')
const moment = require('moment');
const {Client} = require('pg')
const client = new Client({
  user: 'Fahmi',
  host: 'localhost',
  database: 'crud',
  password: '270899',
  port: 5432
})
client.connect();
app.use(bodyParser.urlencoded({extended:true}))
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')))
app.use(function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','no-cache');
  next();
})
app.get('/',function(req, res){
  let id,string,integer,float,date,boolean,filter=false;
  let bagianWhere =[];
  let halaman = Number(req.query.page) || 1;
  let url = "/?page=1";
  if(url.indexOf('&cari=') != -1){
    halaman =1;
  }
  url = url.replace('&cari=','');
  if(typeof req.query.cek_id !== 'undefined'){
    bagianWhere.push(`id='${req.query.id}'`);
    filter = true;
  }
  if(typeof req.query.cek_string !== 'undefined'){
    bagianWhere.push(`string='${req.query.string}'`);
    filter = true;
  }
  if(typeof req.query.cek_integer !== 'undefined'){
    bagianWhere.push(`integer='${req.query.integer}'`);
    filter = true;
  }
  if(typeof req.query.cek_float !== 'undefined'){
    bagianWhere.push(`float='${req.query.float}'`);
    filter = true;
  }
  if(typeof req.query.cek_date !== 'undefined'){
    bagianWhere.push(`date='${req.query.date}'`);
    filter = true;
  }
  if(typeof req.query.cek_boolean !== 'undefined'){
    bagianWhere.push(`boolean='${req.query.boolean}'`);
    filter = true;
  }
  let sql = 'SELECT count(id) AS totalRecord FROM data ';
  if (filter){
    sql += ' WHERE ' + bagianWhere.join('AND');
  }
  client.query(sql, (err, data) => {
    if (err) {
      console.error(err)
      return res.send(err);
    }
    var limit = 3
    var offset = (halaman-1) * limit
    var total = data.rows[0].totalrecord;
    // console.log(total, limit);
    var jumlahHalaman = (total == 0) ? 1 : Math.ceil(total/limit);
    sql = "SELECT * FROM data";
    if(filter){
      sql += ' WHERE ' + bagianWhere.join(' AND ')
    }
    sql += ' ORDER BY id'
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    client.query(sql, (err, data) => {
      if (err) {
        console.error(err)
        return res.send(err);
      }

      res.render('list', {title:"BREAD", data: data.rows,
      halaman:halaman,limit: limit, offset: offset, jumlahHalaman: jumlahHalaman,total:total, url: url, query: req.query });

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

  client.query("INSERT INTO data (string, integer, float, date, boolean) VALUES ($1, $2, $3, $4, $5)", [string, integer, float, date, boolean], function(err){
    res.redirect('/');
  });
});

app.get('/edit/:id',function(req, res){
  let id = req.params.id;
  console.log(id);
  client.query(`SELECT * FROM data WHERE id = '${id}'` ,function(err, data) {
    if (err){
      console.log(err);
      res.send(err);
    }
    if (data.rows.length > 0) {
      res.render('edit', {data : data.rows[0]});
    }
  })
})
app.post('/edit/:id',function(req,res){
  let string = req.body.string;
  let integer= parseInt(req.body.integer);
  let float= parseFloat(req.body.float);
  let date = req.body.date;
  let id = req.params.id
  let boolean= req.body.boolean;
  client.query(`UPDATE data SET string= '${string}', integer = ${integer}, float = '${float}', date = '${date}', boolean = '${boolean}' WHERE id = '${id}' ` ,function(err, row) {
    if (err){
      console.log(err);
      res.send(err);
    }else{
      res.redirect('/')
    }
  })
})

app.get ('/delete/:id', function(req,res) {
  var id = req.params.id
  client.query ("DELETE FROM data Where id=$1", [id], (err,rows) =>{
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
app.listen(3000,function(){
  console.log("server jalan di port 3000");
})
