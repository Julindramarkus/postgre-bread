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

    })
  }

  readAll(cb){
    this.client.query('SELECT * FROM data;',(err, res) => {
        cb(res.rows)

    })
  }

  pageIndex(skip, cb) {
    this.client.query(`SELECT * FROM data limit 5 offset ${skip};`,(err,data)=>{
      cb(data.rows)

    })
  }

  filterAll(id, string, integer, float, startDate, endDate, boolean, cb) {
    let arrArg = [id,string,integer,float,boolean,startDate];
    let arrDatabase = ['dataid','string','integer','float','boolean','date'];
    let tempStr = ``;
    let count = 0;
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
              tempStr = `string = '${string}'`
        }
      }
      arrArg.pop();
    }
  }
  this.client.query(`SELECT * FROM data WHERE ${tempStr};`,(err,res)=>{
    if(err)throw err;
    else{
      if(res.rows === undefined){
        cb([])
      }else{
        cb(res.rows)
      }

  }

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
          tempStr = `string = '${string}'`
        }
      }
      arrArg.pop();
    }
  }
  let dataq = `SELECT * FROM data WHERE ${tempStr} limit 5 offset ${skip};`
  console.log(dataq);
  this.client.query(dataq,(err,res)=>{
    // cb(res.rows)
    if(err)throw err;
    else{
      if(res.rows === undefined){
        cb([])
      }else{
        cb(res.rows)
      }

  }
  })

  }



  findById(id,cb){
      this.client.query(`SELECT * FROM data WHERE data.dataID = '${id}'`,(err,res)=>{
        if(err)throw err
        else cb(res.rows)
      })
  }

  edit(id,string,integer,float,date,boolean){
    this.client.query(`UPDATE data SET string = '${string}', integer = '${integer}', float = '${float}', date = '${date}', boolean = '${boolean}' WHERE dataid = '${id}';`,(err,res)=>{
      if(err)console.log(err);

    })
  }

  add(string, integer, float, date, boolean) {
    this.client.query(`INSERT INTO data (dataID,string,integer,float,date,boolean) VALUES ('${Number(String(Date.now()).substring(7,12))}','${string}','${integer}','${float}','${date}','${boolean}');`,(err,res)=>{
      if(err)console.log(err);

    })
  }

  delete(id){
    this.client.query(`DELETE FROM data WHERE dataid = '${id}';`,(err,res)=>{
      if(err)console.log(err);

    })
  }
}

// let bread = new Bread()
// bread.pageIndexFilter("","","","","","","Choose the boolean ...",0);
export {Bread as default}
