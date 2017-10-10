"use strict"

const express = require ('express');
const app = express();
const path = require('path');
const bodyParser= require('body-parser')
const moment = require('moment');

const {Client} = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'bread',
  password: 'e90900bc7d',
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


  let sql = 'SELECT count(id) AS totalrecord FROM datahasil ';
  if (filter){
    sql += ' WHERE ' + bagianWhere.join('AND');
  }
  client.query(sql,( err,data) => {
    console.log(data.rows);

    // let totalRecord = data.totalRecord;
    // let limit = 3;
    // let offset = (halaman-1)*limit;
    // let jumlahHalaman = (totalRecord == 0) ? 1: Math.ceil(totalRecord/limit);
    let page = Number(req.query.page) || 1
    let limit = 3;
    let offset = (page-1) * 3;
    let total = data.rows[0].totalrecord;

    let pages = (total == 0) ? 1 : Math.ceil(total/limit);
    let url = (req.url == "/") ? "/?page=1" : req.url;
    sql = `SELECT * FROM datahasil `
    if(filter){
      sql += ' WHERE ' + bagianWhere.join('AND');
    }
    sql += ` LIMIT ${limit} OFFSET ${offset}`
    console.log(sql);
    client.query(sql,(err,data) => {
      // console.log(data)
      //res.render('list',{title: "BREAD", data:data.rows, halaman:halaman,jumlahHalaman:jumlahHalaman,query:req.query,url:url});
      res.render('list', {title: "BREAD", header: "BREAD", data : data.rows,  pagination: {page: page, limit: limit, offset: offset, pages: pages, total: total, url: url}, query: req.query});

      });
    });
  });

app.get('/add',function(req, res){
  res.render('add');
})

app.post('/add',function(req, res){

  let string = req.body.string;
  let integer= parseInt(req.body.integer);
  let float= parseFloat(req.body.float);
  let date = req.body.date;
  let id = Date.now();
  let boolean= req.body.boolean;
  // console.log(string);
  // console.log(date);
  // console.log(float);
  // console.log(integer);
  // console.log(boolean);

    client.query(`INSERT INTO datahasil(id,string, integer, float, date, boolean) VALUES ('${id}','${string}',${integer},'${float}','${date}','${boolean}')`,function(err, row) {
        if (err){
            console.log(err);
            res.send(err);
          }else{
            res.redirect('/')
        }
      });
})

app.get('/edit/:id',function(req, res){
  let id = req.params.id;
  console.log(id);
  client.query(`SELECT * FROM datahasil WHERE id = '${id}'` ,function(err, data) {
      if (err){
          console.log(err);
          res.send(err);
        }
      //    else{
      //     res.render('edit',{data:data.rows[0]})
      // }
      if (data.rows.length > 0) {
    console.log( data.rows[0].date = moment(data.rows[0].date).format("YYYY-MM-DD"))
    res.render('edit', {data : data.rows[0]});
    console.log(data.rows[0]);
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


    client.query(`UPDATE datahasil SET string= '${string}', integer = ${integer}, float = '${float}', date = '${date}', boolean = '${boolean}' WHERE id = '${id}' ` ,function(err, row) {
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
  client.query ("DELETE FROM datahasil Where id=$1", [id], (err,rows) =>{
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
