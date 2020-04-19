
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const hb = require('express-handlebars');
const app = express();
const mysql = require('mysql');

const port = 3000;
const pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'Rayan1234',
    database : 'fanschoice',
    multipleStatements : true,
    connectionLimit : 4
});

app.use(express.static('static'));
app.use(session({ secret: 'csc336' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded());
app.engine('handlebars', hb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//query list
const query_users = 'SELECT userName FROM user ORDER BY userName;';
const query_stream = 'SELECT * FROM allreviews ORDER BY posted DESC;';
const query_create_user = 'INSERT INTO user (userName, email) VALUES (?, ?);';
const query_user_id_from_name = 'SELECT id FROM user WHERE userName = ?;';
const query_emails = 'SELECT email FROM user ORDER BY email;';
const query_artist = 'SELECT name from artist;' 
const query_artist_name = 'SELECT name from artist WHERE name = ?;' 
const query_post_revA = 'INSERT INTO reviewAlbum (name, content) VALUES (?, ?);'; //
const query_albums = 'select album.name from artist,album where album.artistid =artist.id and artist.name = ?;';
const query_song = 'SELECT single.name FROM artist,single WHERE single.artistid = artist.id and artist.name= ?;';
const query_topsingles = 'select name from sumlikessingle ORDER BY TOTAL DESC;';
const query_topalbums = 'select name from sumlikesalbum ORDER BY TOTAL DESC;';
 
function checkAuth(req, res, next) {
    if (!req.session.user_id) {
        res.redirect(302, '/login');
    } else {
        next();
    }
}

function debuglog(req, res, next) {
    console.debug(`${req.method} -- ${req.path} (params: ${JSON.stringify(req.params)}) [body: ${JSON.stringify(req.body)}]`);
    next();
}

function db(req, res, next) {
    pool.getConnection((error, connection) => {
        try {
            if (error) {
                console.error('Error connecting to the database.', error);
                res.render('error', { error });
            } else {
                req.connection = connection;
                next();
            }
        } finally {
            connection.release();
        }
    });
}

function query_chain(connection, queries) {
    return Promise.all(queries.map(([query, params]) => new Promise((resolve, reject) => {
        connection.query(query, params, (error, result) => {
            if (error) {
                console.error(`Error executing query: '${query}'.`);
                reject(error);
            } else {
                console.log(query, params, result);
                resolve(result);
            }
        });
    })));
}

app.get('/login', debuglog, db, function (req, res) {
    // The `query_users` variable holds a query which returns a list of all of the site's users.
    req.connection.query(query_users, (error, results, fields) => {
        if (error) {
            console.error('Error executing `query_users`.', error);
            res.render('error', { error });
        } else {
            // We pass the list of users to the `login` template to populate the drop down.
            res.render('login', { results });
        }
    });
});


app.post('/login', debuglog, db, function (req, res) {
    req.connection.query(query_user_id_from_name, [req.body.user], (error, result) => {
        if (error) {
            console.error('Error logging in.', error);
            res.render('error', { error });
        } else {
            if (result.length && result[0].id) {
                req.session.user_id = result[0].id;
                req.session.user_name = req.body.user;
                res.redirect(`/user/${req.session.user_name}`);

            } else {
                console.error('Error logging in, unexpected result set.');
            }
        }
    });
});

// for top songs

app.get('/songs', debuglog, db, function (req, res) {
    // The `query_users` variable holds a query which returns a list of all of the site's users.
    req.connection.query(query_topsingles, (error, singlenames, fields) => {
        if (error) {
            console.error('Error executing `query_users`.', error);
            res.render('error', { error });
        } else {
            console.log(singlenames);
            res.render('songs', {singlenames});
        }
    });
});

app.post('/songs', debuglog, db, function (req, res) {

    res.redirect('/songs');

});

app.get('/stream', debuglog, db, function (req, res) {
    res.render('stream');

});

app.post('/stream', debuglog, db, function (req, res) {

    res.redirect('/stream');

});

app.get('/profile', debuglog, db, function (req, res) {

    res.render('profile');

});

app.post('/profile', debuglog, db, function (req, res) {
    console.degbug(result[0])
    res.redirect('/profile');

});

app.post('/logout', debuglog, function (req, res) {
    delete req.session.user_id;
    res.redirect('/login');
});

app.get('/', debuglog, db, checkAuth, function(req, res) {
    res.redirect(`/user/${req.session.user_name}`);
});

app.get('/user/:name', debuglog, db, function(req, res) { //** 
    console.log(req.params.name, req.session.user_name, req.params.name === req.session.user_name);
    query_chain(req.connection, [
        [query_stream, [req.params.name]],
    
    ]).then(([reviewAlbum]) => {
        let result = {
            reviewAlbum,  
            stream_name: req.params.name,
            user_name: req.session.user_name
        };
        res.render('stream', result);
    }).catch((error) => {
        console.log(error);
        res.render('error', { error });
    });
});

app.get('/search', debuglog, db, function (req, res) {
    query_chain(req.connection, [
        [query_artist, [req.params.name]],
        [query_albums, [req.params.name]],
        [query_song, [req.params.name]],
        [query_emails, [req.params.name]]

    ]).then(([artist,album,song,email]) => {
        let result = {
            artist,
            album,
            song,
            email
        };
        res.render('search', result);
    }).catch((error) => {
        console.log(error);
        res.render('error', { error });
    });
});

 app.post('/search', debuglog, db, function (req, res) {
    res.redirect('/search');
});

app.post('/search/artist', debuglog, db, function(req, res) {
    if (!req.body) {
        res.redirect(500, '/search?error=unknown');
    }
    console.log(req.body.artist_name);
    query_chain(req.connection, [
        [query_artist, [req.body.artist_name]],
        [query_artist_name, [req.body.artist_name]],
        [query_albums, [req.body.artist_name]],
        [query_song, [req.body.artist_name]],
        [query_emails, [req.body.artist_name]]
    ]).then(([artist,artists,album,song,email]) => {
        let result = {
            artist,
            artists,
            album,
            song,
            email
        };
        res.render('search', result);
    }).catch((error) => {
        console.log(error);
        res.render('error', { error });
    });
    });

app.post('/api/user', debuglog, db, function(req, res) {
    if (!req.body) {
        res.redirect(500, '/login?error=unknown');
    }

    req.connection.query(query_create_user, [req.body.user_name, req.body.display_name], (error, result, fields) => { // works
        if (error) {
            res.redirect(500, '/login?error=unknown');
            return;
        }
        res.redirect(302, '/');
    });
});

app.post('/post', debuglog, db, checkAuth, function(req, res) { // use this for review page
    req.connection.query(query_post_revA, [req.session.user_name, req.body.twizzle], (error, stream, fields) => {
        if (error) {
            res.render('error', { error });
        } else {
            res.redirect(302, '/');
        }
    });
}); //

app.get('/error', debuglog, db, function(req, res) {
    res.render('error', { error: req.query.type === 'preview' ? 'Cannot preview.' : 'Unknown error.' });
});

app.listen(3000);