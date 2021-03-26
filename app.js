const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



/*****************************GET REQUESTS****************************/
app.get("/",(req,res)=>{
	res.render("home");
});








/*******************************************************/
app.listen(3000, function() {
  console.log("Server started on port 3000");
});