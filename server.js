const express = require('express');
const app = express();
const PORT = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

app.listen(PORT, () => {
  console.log(`You're listening on port ${PORT}...`);
});