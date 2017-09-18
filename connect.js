const { Client } = require('pg')
const client = new Client({
  user: 'Firmansyah',
  host: 'localhost',
  database: 'breaddb',
  password: '123456',
  port: 5432
})
client.connect()

client.query('SELECT * From bread', (err, res) => {
  console.log(err, res)
  client.end()
})
