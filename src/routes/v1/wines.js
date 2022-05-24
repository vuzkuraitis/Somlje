const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');

const { mysqlConfig } = require('../../config');
const isLoggedIn = require('../../middleware/auth');
const validation = require('../../middleware/validation');

const router = express.Router();

const winesSchema = Joi.object({
  title: Joi.string().lowercase().required(),
  region: Joi.string().lowercase().required(),
  year: Joi.number().required(),
});

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute('SELECT * FROM wines');

    await con.end();

    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured. Please try again later' });
  }
});

router.post('/', isLoggedIn, validation(winesSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    INSERT INTO wines (title, region, year)
    VALUES (${mysql.escape(req.body.title)}, ${mysql.escape(req.body.region)},
    ${mysql.escape(req.body.year)})`);
    await con.end();

    if (!data.insertId) {
      return res.status(500).send({ err: 'Please try again' });
    }
    return res.send({ msg: 'Successfully added Wine Sort' });
  } catch (err) {
    return res.status(500).send({ err: 'Server issue occured. Please try again later' });
  }
});

module.exports = router;
