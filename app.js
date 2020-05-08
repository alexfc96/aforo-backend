const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');

require('dotenv').config();

const dbPath = process.env.MONGODB_URI;

mongoose
  .connect(dbPath, {
    useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`conected to ${dbPath}`);
  })
  .catch((error) => {
    console.error(error);
  });

const app = express();

app.use(
  cors({
    credentials: true,
    origin: [process.env.FRONTEND_DOMAIN],
  }),
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60, // 1 day
    }),
    secret: process.env.SECRET_SESSION,
    resave: true,
    saveUninitialized: true,
    name: 'aforo',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

const authRouter = require('./routes/auth');
const companyRouter = require('./routes/company');
const establishmentRouter = require('./routes/establishment'); //que este vaya dentro de la company?
const demoRouter = require('./routes/demo');

app.use('/', authRouter);
app.use('/company', companyRouter);
app.use('/establishment', establishmentRouter);
app.use('/protected', demoRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).json({ code: 'not found' });
});

// catch 405 and forward to error handler
app.use((req, res, next) => {
  res.status(405).json({ code: 'method not allowed' });
});

// catch 409 and forward to error handler
app.use((req, res, next) => {
  res.status(409).json({ code: 'already exists' });
});

// catch 422 and forward to error handler
app.use((req, res, next) => {
  res.status(422).json({ code: 'user already exists' });
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500).json({ code: 'unexpected', error: err });
  }
});

module.exports = app;
