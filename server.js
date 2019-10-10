const express = require('express');
const app = express();
const PORT = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(cors());
app.use(bodyParser.json());

let dataBase = {
  users: [
    {
      id: '1',
      name: 'john',
      email: 'john@email.com',
      password: 'johnspassword',
      savedRecipes: 0
    },
    {
      id: '2',
      name: 'jane',
      email: 'jane@email.com',
      password: 'janespassword',
      savedRecipes: 0
    }
  ]
};

app.get('/', (req, res) => {
  res.send(dataBase.users);
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;

  dataBase.users.forEach(user => {
    if (user.id === id) {
      found = true;
      return res.json(user);
    }
  })
  if (!found) {
    res.status(400).json('user not found');
  }
})

app.post('/register', (req, res) => {
  let { email, name, password } = req.body;
  
  dataBase.users.push({
    id: '3',
    name: name,
    email: email,
    password: password,
    savedRecipes: 0
  });

  res.send(dataBase.users[dataBase.users.length - 1]);
})

app.post('/signin', (req, res) => {
  if (req.body.email === dataBase.users[0].email &&
      req.body.password === dataBase.users[0].password) {
        res.json(res.json(dataBase.users[0]));
      } else {
        res.status(400).json('Invalid email or password');
      }
})

app.put('/recipes', (req, res) => {
  const { id } = req.body;
  let found = false;

  dataBase.users.forEach(user => {
    if (user.id === id) {
      found = true;
      user.savedRecipes++;
      return res.json(user.savedRecipes);
    }
  })
  if (!found) {
    res.status(400).json('user not found');
  }
})

app.delete('/recipes', (req, res) => {
  
})

app.listen(PORT, () => {
  console.log(`You're listening on port ${PORT}...`);
});