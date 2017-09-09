const {Client} = require('pg')

class Bread {
  constructor() {
    this.client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'bread',
      password: null,
      port: 5432,
    })
    this.client.connect();
  }

  createTable(){
    this.client.query('CREATE TABLE IF NOT EXISTS data(dataID serial PRIMARY KEY,string TEXT NOT NULL,integer INTEGER NOT NULL,float FLOAT NOT NULL,date DATE NOT NULL, boolean BOOLEAN NOT NULL);',(err, res) => {
        if(err)console.log(err);
        this.client.end()
    })
  }

  readAll(cb){
    this.client.query('SELECT * FROM data;',(err, res) => {
        cb(res.rows)
        this.client.end()
    })
  }

  pageIndex(skip, cb) {
    this.client.query(`SELECT * FROM data limit 5 offset ${skip};`,(err,data)=>{
      cb(data.rows)
      this.client.end()
    })
  }

  filterAll(id, string, integer, float, startDate, endDate, boolean, cb) {
    let arrArg = [id,string,integer,float,boolean,startDate];
    let arrDatabase = ['dataid','string','integer','float','boolean','date'];
    let tempStr = ``;
    let count = 0;
    for(let i=0;i<arrArg.length;i++){

    if(i<5){
      if(arrArg[i] === "Choose the boolean ...")count--;
      if(arrArg[i]){
        count++;
        if(count === 1){
          tempStr = arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
        }else if(count > 1){
          tempStr += ' and '+arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
        }
      }
      if(i === arrArg.length-1){
        if(count === 0){
          tempStr = `dataid = '${arrArg[0]}'`
        }
      }
    }else if(i>=5){
      arrArg[6] = endDate;
      if(arrArg[i] && arrArg[i+1]){

        count++;
        if(count === 1){
          tempStr = arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
        }else if(count > 1){
          tempStr += ' and '+arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
        }
      }

      if(i === arrArg.length-2){
        if(count === 0){
          tempStr = `dataid = '${arrArg[0]}'`
        }
      }
      arrArg.pop();
    }
  }
  this.client.query(`SELECT * FROM data WHERE ${tempStr};`,(err,res)=>{
    cb(res.rows)
    this.client.end()
  })
  }

  pageIndexFilter(id, string, integer, float, startDate, endDate, boolean,skip, cb) {
    let arrArg = [id,string,integer,float,boolean,startDate];
    let arrDatabase = ['dataid','string','integer','float','boolean','date'];
    let tempStr = ``;
    let count =0;
    for(let i=0;i<arrArg.length;i++){

    if(i<5){

      if(arrArg[i] === "Choose the boolean ..."){
        arrArg[i] = null;
      }else if(arrArg[i]){
        count++;
        if(count === 1){
          tempStr = arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
        }else if(count > 1){
          tempStr += ' and '+arrDatabase[i] +` = `+ `'${arrArg[i]}'`;
        }
      }
    }else if(i>=5){
      arrArg[6] = endDate;
      if(arrArg[i] && arrArg[i+1]){
        count++;
        if(count === 1){
          tempStr = arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
        }else if(count > 1){
          tempStr += ' and '+arrDatabase[i] +` between `+ `'${arrArg[i]}'`+"and"+`'${arrArg[i+1]}'`
        }
      }

      if(i === arrArg.length-2){
        if(count === 0){
          tempStr = `dataid = '${arrArg[0]}'`
        }
      }
      arrArg.pop();
    }
  }

  this.client.query(`SELECT * FROM data WHERE ${tempStr} limit 5 offset ${skip};`,(err,res)=>{
    cb(res.rows)
    this.client.end()
  })

  }



  findById(id,cb){
    this.client.query(`SELECT * FROM data WHERE data.dataid = '${id}'`,(err,res)=>{
      cb(res.rows)
      this.client.end()
    })
  }

  edit(id,string,integer,float,date,boolean){
    this.client.query(`UPDATE data SET string = '${string}', integer = '${integer}', float = '${float}', date = '${date}', boolean = '${boolean}' WHERE dataid = '${id}';`,(err,res)=>{
      if(err)console.log(err);
      this.client.end()
    })
  }

  add(string, integer, float, date, boolean) {
    this.client.query(`INSERT INTO data (dataID,string,integer,float,date,boolean) VALUES ('${Number(String(Date.now()).substring(7,12))}','${string}','${integer}','${float}','${date}','${boolean}');`,(err,res)=>{
      if(err)console.log(err);
      this.client.end()
    })
  }

  delete(id){
    this.client.query(`DELETE FROM data WHERE dataid = '${id}';`,(err,res)=>{
      if(err)console.log(err);
      this.client.end()
    })
  }
}

let bread = new Bread();

// bread.readAll();
// bread.findById(78529)
// bread.add("haish",2,3.4,"2017-08-9",true)
export {Bread as default}
