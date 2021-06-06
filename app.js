if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection erorr: '));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'this-should-be-a-better-secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 *24 * 7
  }
}
app.use(session(sessionConfig))
app.use(flash());

// Passport setup ==>
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// <== Passport setup


// Flash messages setup ==>
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // adding information about current user into res.locals
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
// <== Flash messages setup

// Routes setup ==>
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
// <== Routes setup

app.get('/', (req, res) => {
  res.render('home');
});


app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong'
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('APP RUNNING ON PORT 3000');
});
