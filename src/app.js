const express = require('express');
const cors = require('cors');

const UserRoutes = require('./routes/v1/users');
const WineRoutes = require('./routes/v1/wines');

const { serverPort } = require('./config');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send({ msg: 'Server is running' });
});

app.use('/v1/users/', UserRoutes);
app.use('/v1/wines/', WineRoutes);

app.all('*', (req, res) => {
  res.status(404).send({ err: 'Page not found' });
});

app.listen(serverPort, () => console.log(`Server is running on port ${serverPort}`));
