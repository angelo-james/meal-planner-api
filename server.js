const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
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

app.put('/recipe', (req,res) => {
  let { recipe, email } = req.body;

  db.insert({
    recipe: recipe,
    email: email
  })
  .into('userrecipes')
  .then(data => {
    return db.select('*').from('userrecipes')
    .where('email', '=', email)
    .then(recipes => {
      res.json(recipes)
    })
  })

  .catch(err => res.status(400).json('unable to save recipe'));
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

app.get('/recipes/:email', (req, res) => {
  const { email } = req.params;
  
  db.select('*').from('userrecipes')
  .where('email', '=', email)
  .then(data => {
    res.json(data)
  })
})

app.delete('/recipes', (req, res) => {
  let { email, recipe } = req.body;

  db.del().from('userrecipes').where({
    email,
    recipe
  })
  .then(response => {
    res.json('Recipe was removed')
  })
  .catch(err => {
    res.json('Invalid request');
  })
})

app.listen(PORT, () => {
  console.log(`You're listening on port ${PORT}...`);
});