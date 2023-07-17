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
    name: {
      type: String,
      minlength: 3,
      required: true
    },
    number: {
      type: String,
      minlength: 10,
      required: true,
      validate:{
        validator: (v) => {
          return /^(\d{3}([-]?)\d{3}([-]?)\d{4})$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    id: {
      type: Number,
      required: true
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema);