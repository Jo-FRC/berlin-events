var express = require('express');
var app = express();
var multer = require('multer');
var spicedPg = require('spiced-pg');
var config = require('./passwords.json');
var db = spicedPg('postgres:' + config.name + ':' + config.password + '@localhost:5432/events');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var fs = require('fs');
var url = require('url');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var checkPass = require('./checkPass');
var hashPassword = checkPass.hashPassword;
var checkPassword = checkPass.checkPassword;

app.use(cookieSession({
    secret: 'a really hard to guess secret',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static("./public"));

app.get('/berlinevents', function(req, res){
    db.query('SELECT * FROM links ORDER by created_at DESC').then(function(results) {
        res.json(
            {
                links: results.rows
            });

    }).catch(function(err) {
        console.log(err);
        res.json({
            success: false
        });
    });
});

app.post('/berlinevents/link', function(req, res){
    console.log(req.body);
    db.query("INSERT INTO links(link, title) VALUES ($1, $2) RETURNING id",
    [req.body.url, req.body.title])
    .then (function(result) {
        console.log(result + "Risultato Post");
        res.json({
            title: req.body.title,
            link: req.body.url,
            id: result.rows[0].id
        });
    }).catch(function(err) {
        console.log(err);
        res.json({
            success: false
        });
    });
});

function requireNotLoggedIn(req, res, next) {
    if (req.session.user) {
        res.redirect('/berlinevents');
    } else {
        return;
    }
}

app.post('/berlinevents/signup', function(req, res) {
    console.log(req.body);
    if (req.body.username && req.body.email && req.body.password) {
        hashPassword(req.body.password)
            .then(function(hash){
                return db.query("INSERT INTO users(username, email, password) VALUES ($1, $2, $3) RETURNING id",
                [req.body.username, req.body.email, hash])
            .then(function(result){
                req.session.user = {
                    email :req.body.email,
                    username : req.body.username,
                    id : result.rows[0].id
                };
                res.json({
                    'username' : req.session.user.username,
                    'email' :  req.session.user.email
                });
                console.log(req.session.user.username);
            });
            }).catch(function(err){
                console.log(err);
            });
    }
});

app.post('/berlinevents/login', function(req, res) {
    // console.log(req.body);
    if (req.body.username && req.body.password){
        db.query("SELECT users.username, users.id, password FROM users WHERE username = $1",
        [req.body.username]).then(function(result){
            console.log(result.rows);
            checkPassword(req.body.password, result.rows[0].password).then(function(doesMatch){
                if(doesMatch){
                    console.log('match!');
                    req.session.user = {
                        username : result.rows[0].username,
                        email : req.body.email,
                        password : result.rows[0].password,
                        id : result.rows[0].id
                    };
                    // res.end();
                    res.send({
                        'username' : req.session.user.username
                    });
                } else {
                    console.log('No match');
                }
            }).catch(function(err){
                console.log(err);
            });

        }).catch(function(err){
            console.log(err);
        });
    }
});


app.listen(8080, function(){
    console.log("I'm listening on 8080");
});
