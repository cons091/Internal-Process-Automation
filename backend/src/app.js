const express = require('express');
const cors = require('cors');
require('dotenv').config();

const requestRoutes = require('./routes/request.routes');
const authRoutes = require('./routes/auth.routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/request', requestRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/request', requestRoutes);

app.get('/', (req, res) => {
  res.send('Internal Requests Automation API');
});

module.exports = app;
