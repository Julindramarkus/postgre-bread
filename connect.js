
const { Client } = require('pg')
const client = new Client({
  user: 'Fahmi',
  host: 'localhost',
  database: 'crud',
  password: '270899',
  port: 5432
})
client.connect()

client.query('SELECT * FROM bread', (err, res) => {
  console.log(err, res)
  client.end()
})
