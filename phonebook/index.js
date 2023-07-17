require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require("./models/person");
const app = express();
app.use(express.json());
app.use(morgan(function (tokens, req, res) {
  const body = req.body;
  let content = null;
  if(body) content = JSON.stringify(body);
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    content
  ].join(' ')
}));
app.use(cors());
app.use(express.static('build'));


const checkExistanceAndUpdateResponse = (req, res, next) => {
  res.checkExistanceAndRespond = (obj, responseCode) => {
    if(obj){
      if(responseCode) 
        res.status(responseCode).end()
        .catch(error => next(error));
      else res.json(obj);
    }
    else res.status(404).end();
  }

  next();
}

app.use(checkExistanceAndUpdateResponse);

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

let date = new Date();



app.get('/api/persons', (request, response, next) => {
    Person.where({})
      .then(persons => {
        response.checkExistanceAndRespond(persons);
      })
      .catch(error => next(error));
});

app.get('/info', (request, response, next) => {
    date = new Date();
    response.send(
        `<div>Phonebook has info for ${persons.length} Person.</div>
         <div>${date.toString()}</div>`
    );
});

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;

    Person.where({id}).findOne()
      .then(person => {
        response.checkExistanceAndRespond(person);
      })
      .catch(error => next(error));
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id);
    Person.findOneAndDelete({id: id})
      .then(person => {
        response.checkExistanceAndRespond(person, 204);
      })
      .catch(error => next(error));
    
})
app.put('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id);
    const body = request.body;
    const updatedPerson = {
      'id': body.id,
      'name': body.name,
      'number': body.number,
    }
    Person.findOneAndUpdate({id: id}, updatedPerson, { new: true, runValidators: true, context: 'query' })
      .then(person => {
        response.checkExistanceAndRespond(person);
      })
      .catch(error => next(error));
})

const checkNameExists = (name) => {
  return persons.some(person => person.name === name);
}
app.post('/api/persons/', (request, response, next) => {
    const body = request.body;
    
    if(checkNameExists(body.name))
      return response.status(400).json({
        error: 'name already exists in server'
      });

    const newPerson = new Person({
      id: date.getTime(),
      name: body.name,
      number: body.number
    });

    if(body.id) newPerson.id = body.id;
    
    newPerson.save()
      .then(savedPerson => {
        response.json(savedPerson);
      })
      .catch(error => next(error));
    
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});