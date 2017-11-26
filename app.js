const express = require('express');
const path = require('path'); // already included in node
const bodyParser  = require('body-parser');


const app = express();
 
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));


// Index Route
app.get('/', (req, res) => {
  res.render('index');
});

// About Route
app.get('/about', (req, res) => {
  res.send('about');
});

const port = process.env.PORT || 3000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});





