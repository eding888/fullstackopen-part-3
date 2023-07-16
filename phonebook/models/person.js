require('dotenv').config();

const MONGOURL = process.env.MONGOURL;

const mongoose = require('mongoose');

mongoose.set('strictQuery',false);

console.log('connecting to', MONGOURL);

mongoose.connect(MONGOURL)
  .then(result => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
    name: String,
    number: Number,
    id: Number
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema);