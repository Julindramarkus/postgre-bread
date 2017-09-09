import Bread from "./model/Bread.js"

const express = require("express");
const app = express();
const path = require("path")
const bodyParser = require("body-parser")
const {Client} = require('pg')
const moment = require('moment');

let bread = new Bread();


app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")

app.use(express.static(path.join(__dirname,"public")))

app.use(
  bodyParser.urlencoded({
    extended:false
  })
)

app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  next();
});


app.get("/", function(req, res) {
  let queryLength = Object.keys(req.query).length;
  if (queryLength >= 0 && queryLength <= 1) {
    bread.readAll(function(dataAll) {
      let pages = req.query.pages;
      if(pages === undefined)pages=0
      else Number(pages);
      bread.pageIndex(Number(pages),function(data) {
        console.log(data);
        let prev, next;
        if(Number(pages) >= 0){
          prev = Number(pages) - 5;
          next = Number(pages) + 5;
        }
        res.render("index", {
          title: "Postgres Bread",
          dataLimit: data,
          dataAll: dataAll.length,
          prev: prev,
          next: next,
          id:"",
          string:"",
          integer:0,
          float:0,
          startDate:"",
          endDate:"",
          boolean:"",
          url:"",
          filter:"",
          queryLength:queryLength,
          moment:moment
        });
      });
    });
  } else if (queryLength > 1) {
    let id = req.query.id;
    let string = req.query.string;
    let integer = Number.parseInt(req.query.integer);
    let float = req.query.float;
    let boolean = req.query.boolean;
    let startDate = req.query.start_date;
    let endDate = req.query.end_date;

    let checkbox_id = req.query.checkbox_id;
    let checkbox_string = req.query.checkbox_string;
    let checkbox_integer = req.query.checkbox_integer;
    let checkbox_float = req.query.checkbox_float;
    let checkbox_boolean = req.query.checkbox_boolean;
    let checkbox_date = req.query.checkbox_date;
    // let checkbox = [checkbox_id,checkbox_string,checkbox_integer,checkbox_float,checkbox_boolean,checkbox_date];
    if (checkbox_id || checkbox_string || checkbox_integer || checkbox_float || checkbox_boolean || checkbox_date) {
      bread.filterAll(id,string,integer,float,startDate,endDate,boolean,function(dataAll) {
        let pages = req.query.pages;
        if(pages === undefined)pages=0
        else Number(pages);
          bread.pageIndexFilter(id,string,integer,float,startDate,endDate,boolean,Number(pages),function(data) {

            var currentUrl = req.url;
            let prev, next;
            if(Number(pages) >= 0){
              prev = Number(pages) - 5;
              next = Number(pages) + 5;
              currentUrl = currentUrl.replace(`&pages=${next-5}`,"");
            }
              res.render("index", {
                title: "Postgres Bread",
                prev: prev,
                next: next,
                dataLimit: data,
                dataAll: dataAll.length,
                id:id,
                string:string,
                integer:Number.parseInt(integer),
                float:float,
                startDate:startDate,
                endDate:endDate,
                boolean:boolean,
                checkbox_id:checkbox_id,
                checkbox_string:checkbox_string,
                checkbox_integer:checkbox_integer,
                checkbox_float:checkbox_float,
                checkbox_boolean:checkbox_boolean,
                checkbox_date:checkbox_date,
                url:currentUrl,
                filter:"filter",
                queryLength:queryLength,
                moment:moment
              });
            }
          );
        }
      );
    } else {
      id = "";
      string = "";
      integer = 0;
      float = 0;
      startDate = "";
      endDate = "";
      boolean = "";
      bread.filterAll(id,string,integer,float,startDate,endDate,boolean,function(dataAll) {
        let pages = req.query.pages;
        if(pages === undefined)pages=0
        else Number(pages);
          bread.pageIndexFilter(
            id,
            string,
            integer,
            float,
            startDate,
            endDate,
            boolean,
            Number(pages),
            function(data) {
              res.render("index", {
                title: "Postgres Bread",
                prev: -5,
                next: 5,
                dataLimit: [],
                dataAll: dataAll.length,
                id:"",
                string:"",
                integer:0,
                float:0,
                startDate:"",
                endDate:"",
                boolean:"",
                url:"",
                filter:"",
                queryLength:queryLength,
                moment:moment
              });
            }
          );
        }
      );
    }
  }
});


app.get("/add", function(req, res) {
  res.render("add", {
    title: "Postgres Bread"
  });
});

app.post("/add", function(req, res) {
  let string = req.body.string;
  let integer = req.body.integer;
  let float = req.body.float;
  let date = req.body.date;
  let boolean = req.body.boolean;
  bread.add(string, integer, float, date, boolean);
  res.redirect("/");
});

app.get("/update/:id", function(req, res) {
  bread.findById(Number(req.params.id), function(data) {
    res.render("update", {
      title: "Postgres Bread",
      item: data[0]
    });
  });
});

app.post("/update", function(req, res) {
  let string = req.body.string;
  let integer = req.body.integer;
  let float = req.body.float;
  let date = req.body.date;
  let boolean = req.body.boolean;
  bread.edit(
    Number(req.body.dataID),
    string,
    integer,
    float,
    date,
    boolean
  );
  res.redirect("/");
});

app.get("/delete/:id", function(req, res) {
  bread.delete(req.params.id);
  res.redirect("/");
});



app.listen(3000, function() {
  console.log("server running at port 3000");
});
