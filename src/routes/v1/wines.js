const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ msg: 'Wines' });
});

router.post('/', (req, res) => {
  res.send({ msg: 'Wine added' });
});

module.exports = router;
