const express = require('express');
const path = require('path');
const app = express();
const usermodel = require('./models/user');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/create', async (req, res) => {
  let {name, email, image} = req.body;
   await usermodel.create({
    name: name,
    image: image,
    email: email
  });
  res.redirect('/read');
});

app.get('/read', async (req, res) => {
  let user = await usermodel.find();
  res.render('read', {users:user});
});


app.get('/delete/:id', async (req, res) => {
  let users = await usermodel.findOneAndDelete({_id: req.params.id});
  res.redirect('/read');
});

app.get('/edit/:id', async (req, res) => {
  let user = await usermodel.findOne({_id: req.params.id});
  res.render('edit', {users: user});
});

app.post('/edit/:id', async (req,res) => {
  let {name, email, image} = req.body;
  await usermodel.findOneAndUpdate(
    {_id: req.params.id},
    {image, name, email}
  );
  res.redirect('/read');
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});