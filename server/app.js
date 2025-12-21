var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

// Routes List
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productsRouter');

const materialsRouter = require('./routes/materialsRouter');
const branchesRouter = require('./routes/branchesRouter');


var app = express();
app.use(cors({
    origin: true,
    credentials: true
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', 'uploads'))
);


// Use Routes
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/materials', materialsRouter);
app.use('/branches', branchesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
    console.log("Endpoint Not Found")
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: req.app.get('env') === 'development' ? err : {}
    });
});

module.exports = app;
