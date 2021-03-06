var express = require('express');
var app = express();
var spicedPg = require('spiced-pg');
var config = require('./passwords.json');
var db = spicedPg('postgres:' + config.name + ':' + config.password + '@localhost:5432/events');
var bodyParser = require('body-parser');
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
    db.query('SELECT links.id, links.link, links.title, links.created_at, count(comments.link_id) FROM links LEFT JOIN comments on comments.link_id = links.id GROUP BY links.id ORDER by links.created_at DESC').then(function(results) {
        console.log(results.rows);
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
    // console.log(req.body);
    db.query("INSERT INTO links(link, title, user_id, username) VALUES ($1, $2, $3, $4) RETURNING id",
    [req.body.url, req.body.title, req.session.user.id, req.session.user.username])
    .then (function(result) {
        // console.log(result + "Risultato Post");
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

app.post('/berlinevents/signup', function(req, res) {
    // console.log(req.body);
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
                // console.log(req.session.user.username);
            });
        }).catch(function(err){
            console.log(err);
        });
    }
});

app.get('/getUserinfo', function(req, res){
    Promise.all([
        db.query('SELECT users.username, users.email, links.id, links.link, links.title FROM users LEFT JOIN links on links.user_id = users.id  WHERE users.id = $1', [req.session.user.id]),
        db.query('SELECT comment_text, comments.link_id FROM comments WHERE (comments.user_id = $1)',[req.session.user.id])
    ]).then(function(results) {
        console.log(results[0].rows);
        // console.log(req.session.user);
        res.json({
            email :results[0].rows[0].email,
            username : results[0].rows[0].username,
            id : results[0].rows[0].id,
            links : results[0].rows,
            comments : results[1].rows,
        });
    }).catch(function(err){
        console.log(err);
    });
});

app.post('/berlinevents/login', function(req, res) {
    // console.log(req.body);
    if (req.body.username && req.body.password){
        db.query("SELECT users.username, users.id, password FROM users WHERE username = $1",
        [req.body.username]).then(function(result){
            // console.log(result.rows);
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
                    // console.log(req.session.user.username);
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



//get the page with comments
app.get('/link/:id', function(req, res) {
    console.log('/link/' + req.params.id + ' - ' + req.body);
    db.query('SELECT * FROM links WHERE id =$1 ', [req.params.id])
    .then(function(result) {
        return db.query('SELECT * FROM  comments WHERE link_id = $1 ORDER by created_at DESC',[req.params.id])
        .then(function (result2){
            var commentsByParentId = {};
            var final = [];
            result2.rows.forEach(function(comment) {
                if (!comment.parent_id) {
                    final.push(comment);
                } else {
                    if (!commentsByParentId[comment.parent_id]) {
                        commentsByParentId[comment.parent_id] = [];
                    }
                    commentsByParentId[comment.parent_id].push(comment);
                }
            });

            addRepliesToComments(final);

            function addRepliesToComments(comments) {
                if (!comments) {
                    return;
                }
                comments.forEach(function(comment) {
                    comment.replies = commentsByParentId[comment.id];
                    addRepliesToComments(comment.replies);
                });
                console.log('this is the final fucntion' + final);
            }
            // console.log("link/id");
            // console.log(result2.rows);
            res.json({
                link : result.rows[0],
                comments : final
                // allComments: result2.rows.length
            });
            console.log(final);
        }).catch(function(err) {
            console.log(err);
            res.sendStatus(500);
        });
    });
});


//function for comment
function handleComment(req, res) {
    console.log( req.body);
    db.query("INSERT INTO comments( username, user_id, comment_text, link_id, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [req.session.user.username ,req.session.user.id , req.body.text, req.params.id, req.body.parent_id || null])
    .then(function(result) {
        res.json({
            username : req.session.user.username,
            user_id : req.session.user.id,
            comment_text : req.body.text,
            id : result.rows[0].id,
            parent_id : req.body.parent_id
        });
    }).catch(function(err) {
        console.log(err);
        res.sendStatus(500);
    });
}


//change roter to /image/:id/comment
app.post('/link/:id', handleComment);
//change roter to /image/:id/comment
app.put('/link/:id', handleComment);

app.listen(8080, function(){
    console.log("I'm listening on 8080");
});
