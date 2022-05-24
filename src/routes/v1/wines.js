const express = require('express');
const mysql = require('mysql2/promise');

const { mysqlConfig } = require('../../config');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute('SELECT * FROM wines');

    await con.end();

    return res.send({ msg: 'Succesfully created account', accountId: data.insertId });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

module.exports = router;
