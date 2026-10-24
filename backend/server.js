const express = require('express');
const mysql = require('mysql2/promise');

const app = express();

const  db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'caredirect'
});

app.get('/plans', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM service_categories');
  res.json(rows);
});

app.get('/rooms', async(req,res) =>{
  const [rows] = await db.query('SELECT * FROM rooms');
  res.json(rows);
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});