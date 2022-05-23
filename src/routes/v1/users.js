const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const { mysqlConfig } = require('../../config');

const router = express.Router();

const userSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

router.post('/register', async (req, res) => {
  let userDetails;
  try {
    // eslint-disable-next-line no-unused-vars
    userDetails = await userSchema.validateAsync(req.body);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data sent' });
  }
  try {
    const hash = bcrypt.hashSync(userDetails.password, 10);

    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    INSERT INTO users (name, email, password)
    VALUES (${mysql.escape(req.body.name)}, 
    ${mysql.escape(req.body.email)}, '${hash}')
    `);
    await con.end();

    if (!data.insertId || data.affectedRows !== 1) {
      console.log(data);
      return res.status(500).send({ err: 'A server issue has occured - please try again later' });
    }

    return res.send({ msg: 'Succesfully created account', accountId: data.insertId });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

router.get('/login', async (req, res) => {
  let userDetails;
  try {
    // eslint-disable-next-line no-unused-vars
    userDetails = await userLoginSchema.validateAsync(req.body);
  } catch (err) {
    console.log(err);
    return res.status(400).send({ err: 'Incorrect data sent' });
  }
  try {
    const con = await mysql.createConnection(mysqlConfig);
    const [data] = await con.execute(`
    SELECT id, email, password FROM users 
    WHERE email = ${mysql.escape(userDetails.email)} LIMIT 1`);
    await con.end();

    if (data.length === 0) {
      return res.status(400).send({ err: 'User Not Found' });
    }

    if (!bcrypt.compareSync(userDetails.password, data[0].password)) {
      return res.status(400).send({ err: 'Incorrect password' });
    }

    return res.send({ msg: 'Succesfully logged in', accountId: data[0].id });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'A server issue has occured - please try again later' });
  }
});

module.exports = router;
