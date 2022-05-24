/* eslint-disable no-unused-vars */
const express = require('express');
const Joi = require('joi');
const mysql = require('mysql2/promise');

const { mysqlConfig } = require('../../config');
const isLoggedIn = require('../../middleware/auth');
const validation = require('../../middleware/validation');

const router = express.Router();

const collectionsSchema = Joi.object({
  wine_id: Joi.number().required(),
  quantity: Joi.number().required(),
});

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`SELECT * FROM collections WHERE user_id = ${req.user.accountId}`);

    await con.end();

    return res.send(data);
  } catch (err) {
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

router.post('/', isLoggedIn, validation(collectionsSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`INSERT INTO collections (wine_id, user_id, quantity)
    VALUES (${mysql.escape(req.body.wine_id)}, 
    ${mysql.escape(req.user.accountId)}, 
    ${mysql.escape(req.body.quantity)})
    `);

    await con.end();

    if (!data.insertId) {
      return res.status(500).send({ err: 'Please try again later' });
    }
    return res.send({ msg: 'Successfully added Wine Sort' });
  } catch (err) {
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

router.post('/add', isLoggedIn, validation(collectionsSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`UPDATE collections 
    SET quantity = quantity + ${mysql.escape(req.body.quantity)} 
    WHERE wine_id = ${mysql.escape(req.body.wine_id)}
    `);

    await con.end();

    if (!data.affectedRows) {
      return res.status(500).send({ err: 'Please try again later' });
    }
    return res.send({ msg: 'Successfully updated Wine Sort' });
  } catch (err) {
    return res.status(500).send({ err: 'A server issue has occured - please try again later 2' });
  }
});

router.post('/remove', isLoggedIn, validation(collectionsSchema), async (req, res) => {
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`UPDATE collections 
    SET quantity = quantity - ${mysql.escape(req.body.quantity)} 
    WHERE wine_id = ${mysql.escape(req.body.wine_id)}
    `);

    await con.end();

    if (!data.affectedRows) {
      return res.status(500).send({ err: 'Please try again later' });
    }
    return res.send({ msg: 'Successfully updated Wine Sort' });
  } catch (err) {
    return res.status(500).send({ err: 'A server issue has occured - please try again later 2' });
  }
});

module.exports = router;
