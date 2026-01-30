const express = require("express");
const path = require("path");

const app = express();
const usermodel = require("./models/user");
const signupmodel = require("./models/signup");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  let { email, password } = req.body;
  bcrypt.genSalt(10, function (err, salt) {
    let signup = bcrypt.hash(password, salt, async (err, hash) => {
      await signupmodel.create({
        email,
        password: hash
      });
      let token = jwt.sign({email}, 'secret');
      res.cookie('token', token);
      res.render('signin');
    });
  });
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.post("/signin", async (req, res) => {
  let user = await signupmodel.findOne({email: req.body.email});
  if(!user){
    return res.send("Invalid Email");
  }
  bcrypt.compare(req.body.password, user.password, (err, result) => {
    if(result){
      res.render('index')
    } else{
      res.send('Incorrect password');
    }
  })
});


app.post("/create", async (req, res) => {
  let { name, email, image } = req.body;
  await usermodel.create({
    name: name,
    image: image,
    email: email,
  });
  res.redirect("/read");
});

app.get("/read", async (req, res) => {
  let user = await usermodel.find();
  res.render("read", { users: user });
});

app.get("/delete/:id", async (req, res) => {
  let users = await usermodel.findOneAndDelete({ _id: req.params.id });
  res.redirect("/read");
});

app.get("/edit/:id", async (req, res) => {
  let user = await usermodel.findOne({ _id: req.params.id });
  res.render("edit", { users: user });
});

app.post("/edit/:id", async (req, res) => {
  let { name, email, image } = req.body;
  await usermodel.findOneAndUpdate(
    { _id: req.params.id },
    { image, name, email },
  );
  res.redirect("/read");
});

app.get('/logout', (req, res) => {
  res.cookie("token", "");
  res.redirect('signin');
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
