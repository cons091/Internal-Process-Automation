const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger');
const requestRoutes = require('./routes/request.routes');
const authRoutes = require('./routes/auth.routes');
const { globalLimiter } = require('./middlewares/limiter');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(globalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/request', requestRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Internal Requests Automation API');
});

app.use(errorHandler);

module.exports = app;