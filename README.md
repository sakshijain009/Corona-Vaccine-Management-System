# VIYOND 
#### _V for Virus, Will not Go Beyond.._ <br>
<img src="refer/home.png">
This project is developed as an academic project for DBMS subject. It is Web Application based on management of Corona Vaccine which runs on localhost server.

### Prerequisites
Must haves:
- MYSQL(Using XAMPP)
- Browser(That supports HTML and CSS)
- Terminal that supports Nodejs and git commands.

### Installing
To install all the dependencies write the following command on your terminal:<br>
`npm install`
<br><br>
Dependencies that are used for the project include:<br>
`const express = require("express");`<br>
`const bodyParser = require("body-parser");`<br>
`const ejs = require("ejs");`<br>
`const mysql = require("mysql");`<br>
`const dotenv = require("dotenv");`<br>
`const bcrypt = require("bcryptjs");`<br>
`const jwt = require("jsonwebtoken");`<br>
`const cookieParser = require("cookie-parser");`<br>

## Getting Started
Firstly we recommend to install Hyper terminal or any other prompt that supports Nodejs. After the installation clone the files in your pc, traverse to the cloned folder in your pc through your terminal and then use the command `npm start` to run it on localhost. Make sure before running the project, you create the database in your xampp server by pasting the commands in tables.sql file. On starting the execution, the project will run on port 3000.

## ER Diagram
<img src="refer/er.png">

## Mysql Connection
```
const mysql = require("mysql");

exports.start = mysql.createConnection({ 
  host: process.env.DATABASE_HOST, 
  user: process.env.DATABASE_USER, 
  password:process.env.DATABASE_PWD,
  database : process.env.DATABASE
});
```
```
con.start.connect((err) => {
  if (err) throw err;
  console.log('connected');
});
```
<br>


## How it works
Our web app using mysql database manages all the patients, hospital and inventory data.<br>
<img src="refer/homepart.png" height="400">
<br>
Inventory supplies vaccine to hospitals. Each hospital provides a particular brand of vaccine (Say Covaxin or Covishield). Patients can register for hospitals in their area and the hospital can view all the patient requests for vaccine in their hospital on creating an account and loggin in. This aids in easy management of data for the hospitals.<br>
## Built With
- HTML - Markup language
- CSS - Style Sheet language
- Javascript- Client Scripting language
- MySQL - Database Management
- node.js - Backend Development environment
- express.js - Fast, unopinionated, minimalist web framework for Node.js

## Contributors
- Sakshi Jain (U19CS048)
- Himani Verma (U19CS075)
- Riya Sharma (U19CS079)
- Esha Srivastav (U19CS109)

