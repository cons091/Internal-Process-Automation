const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requestRoutes = require('./routes/requests.routes');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

app.get('/', (req, res) => {
  res.send('Internal Requests Automation API');
});

module.exports = app;
