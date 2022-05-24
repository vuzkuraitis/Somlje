/* eslint-disable no-unused-vars */
const express = require('express');
const Joi = require('joi');
const jsonwebtoken = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const { mysqlConfig, jwtSecret } = require('../../config');
const isLoggedIn = require('../../middleware/auth');

const router = express.Router();

const collectionsSchema = Joi.object({
  wine_id: Joi.string().required(),
  quantity: Joi.number().required(),
});

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`SELECT * FROM collections WHERE user_id = ${req.user.accountId}`);

    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

router.post('/', async (req, res) => {
  let wineDetails;
  try {
    wineDetails = await collectionsSchema.validateAsync(req.body);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data sent' });
  }

  const token = req.headers.authorization.split(' ')[1];
  const userDetails = jsonwebtoken.verify(token, jwtSecret);

  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`INSERT INTO collections (wine_id, user_id, quantity)
    VALUES (${mysql.escape(wineDetails.wine_id)}, 
    ${mysql.escape(userDetails.accountId)}, 
    ${mysql.escape(wineDetails.quantity)})
    `);

    await con.end();

    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

module.exports = router;
