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
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons);
    })
});

app.get('/info', (request, response) => {
    date = new Date();
    response.send(
        `<div>Phonebook has info for ${persons.length} people.</div>
         <div>${date.toString()}</div>`
    );
});

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const personAtID = persons.find(person => person.id === id);

    if(personAtID) response.json(personAtID);
    else response.status(404).end();
    
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
})
app.put('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const body = request.body;
    if(!(body.name || body.number || body.id))
      return response.status(400).json({ 
        error: 'name/number/id is missing' 
      });
    const updatedPerson = {
      'id': body.id,
      'name': body.name,
      'number': body.number,
    }
    persons = persons.map(person => {
      if(person.id === id) return updatedPerson;
      else return person;
    });
    response.json(updatedPerson);
})

const checkNameExists = (name) => {
  return persons.some(person => person.name === name);
}
app.post('/api/persons/', (request, response) => {
    const body = request.body;
    if(!body.name || !body.number)
      return response.status(400).json({ 
        error: 'name/number is missing' 
      });
    
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
    
    newPerson.save().then(savedPerson => {
      response.json(savedPerson);
    })
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});