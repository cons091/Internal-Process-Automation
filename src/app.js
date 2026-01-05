const express = require('express');
const cors = require('cors');

const requestRoutes = require('./routes/requests.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
  res.send('Internal Requests Automation API');
});

module.exports = app;
