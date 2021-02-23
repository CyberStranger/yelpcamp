const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection erorr: '));
db.once("open", () => {
  console.log("Database connected");
});

const sample = arr => arr[Math.floor(Math.random() * arr.length)];



const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10
    const camp = new Campground({
      author: '602bddc5f538ec8a964906d7',
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: `https://source.unsplash.com/collection/483251`,
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim illum fugiat quos. At dolore eos incidunt odio hic, fugiat saepe culpa ullam aperiam tempora nostrum vero, recusandae atque deserunt fuga?',
      price
    })
    await camp.save();
  }
}

seedDb().then(() => mongoose.connection.close());
