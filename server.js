const express = require('express');
const app = express();
const PORT = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const knex = require('knex');

app.use(cors());
app.use(bodyParser.json());

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'aj',
    password: '',
    database: 'meal-planner-db'
  }
});

app.get('/', (req, res) => {
  res.send(dataBase.users);
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('users')
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not Found')
      }
    })
    .catch(err => res.status(400).json('Error getting user'));
})

app.post('/register', (req, res) => {
  let { email, name, password } = req.body;

  const hash = bcrypt.hashSync(password, saltRounds);

  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail => {
      return trx('users')
      .returning('*')
      .insert({
        email: loginEmail[0],
        name: name,
        joined: new Date()
      })
      .then(user => {
        res.send(user[0]);
      })
    })
    .then(trx.commit)
    .catch(trx.rollback)
  })

  .catch(err => res.status(400).json('unable to register'));
})

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);

      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
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