const express = require('express');
const app = express();
app.use(express.json());
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
    response.json(persons);
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

    const newPerson = {
      'id': Math.floor((Math.random() * 1000 + 1)),
      'name': body.name,
      'number': body.number
    };
    persons.push(newPerson);
    response.json(newPerson);
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});