const express = require("express");
const fs = require("fs")
var session = require('express-session')

var app = express()

app.set('view engine', 'ejs' );

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}))

app.use( function(req,res, next ) {
    console.log(req.url, req.method );
    next()
})

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.post('/todo', function( req, res){

    console.log( 'Post todo =>'+req.session.isLoggedIn)

    if( !req.session.isLoggedIn )
    {
        res.status(401).json({result:'LogIn first'});
    }

    writeToFile( req.body, function( err ){
        if( err ){
            res.status(500).send('error')
            return;
        }

        res.status(200).send('success')
    });

    
});

app.get( '/signout', function( req, res ){

    if( !req.session.isLoggedIn )
    {
        res.redirect('/login');
        return;
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
    return;
} )

app.get( '/tododata', function( req, res ) {

    console.log( 'Data todo =>'+req.session.isLoggedIn);

    if( !req.session.isLoggedIn )
    {
        res.status(401).send('Log In first');
        return;
    }

    readAllDataFromFile( function(err, data){

        if( err ){
            res.status(500).json({message: "An Error has Ocurred"});
        }
        else{
            res.status(200).json(data);
        }
    });
});



app.post('/editdata', function( req ,res) {

    console.log( ' edit Data =>'+req.session.isLoggedIn);

    if( !req.session.isLoggedIn )
    {
        res.status(401).json({result:'Please log In'});
        return;
    }

    readAllDataFromFile( function( err, data ) {
        if( err )
        {
            res.status(500).json({ update :'failed'});
            return;
        }

            const obj = req.body;
            // data[obj.id-1].task = obj.data;

            data.forEach( function (todo, idx) {
                if( todo.id === obj.id )
                {
                    data[idx].task = obj.data;
                }
            });

            fs.writeFile( './db/logs.json', JSON.stringify(data), function(err) {
                if(err){
                    res.status(500).json({ update :'failed'});
                    return;
                }

                res.status(200).json(data)
            });
    });
})

app.post( '/deletetodo', function( req, res ) {

    if( !req.session.isLoggedIn )
    {
        res.status(401).json({result:'Please log In'});
        return;
    }

    const selectedId = req.body.id;

    readAllDataFromFile( function( err, data ){
        if( err ){
            res.status(500).json({delete:'failure'});
            return;
        }
        else{

            data.forEach( function(todo, idx){
                
                if( todo.id === selectedId )
                {
                    data.splice(idx,1);
                }
            });

            fs.writeFile( './db/logs.json', JSON.stringify(data), function( err ){
                if( err ){
                    res.status(500).send('failure');
                }
            });

            res.status(200).json({deletion:'success'})
        }
    })
})

app.get( '/signup', function( req, res){
    res.render('signup', {error: null })
});

app.post('/signup', async function( req, res) {
    
    try {
        const data = await readAllDataFromFilePr( './db/users.json');
        let flag = true;

        data.forEach( function(user){

            if( user.username === req.body.username && user.password === req.body.password )
            {
                res.render('signup', {error: 'User already exists'})
                flag = false;
            }
        });


    if (flag) {

            data.push(req.body);
            fs.writeFileSync('./db/users.json', JSON.stringify(data), function(err){
                if(err){
                    res.status(500).json({result:'error in  writing a file'});
                }
            });
            res.redirect('/login');
    }

    } catch (error) {
        res.status(500).json({result:'error in  reading a file'});
    }

})


app.get('/', function( req, res ){
    
    if( !req.session.isLoggedIn )
    {
        res.redirect('/login');
        return;
    }

    res.render('home', {username: req.session.username});
})

app.get('/login', function( req,res ){
    res.render('login', {error:null});
})


app.post('/login', async function( req,res ){

    
    try {

        let flag = false;
        const data = await readAllDataFromFilePr('./db/users.json');

        data.forEach( function( user ){
            
            if( user.username === req.body.username && user.password === req.body.password )
            {
                req.session.isLoggedIn = true;
                req.session.username = user.username;
                res.redirect('/');
                flag = true;
            }
        });

        if (!flag) {
            res.render('login', {error:'Invalid User credentials'});
        }
    } catch (error) {
        // res.status(500).json({result:" Error in  reading a file"})
        throw error;
    }
});


app.get('/about', function( req, res ){

    if( !req.session.isLoggedIn )
    {
        res.redirect('/login');
        return;
    }
    
    res.render('about', {username: req.session.username})
})

app.get('/contact', function( req, res ){

    if( !req.session.isLoggedIn )
    {
        res.redirect('/login');
        return;
    }
    
    res.render('contact', {username: req.session.username })
})

app.get('/todo', function( req, res ){

    console.log( 'Todo =>'+req.session.isLoggedIn)

    if( !req.session.isLoggedIn )
    {
        res.redirect('/login');
        return;
    }
    else{
        res.render('todo',{username:req.session.username})
    }
     
});

app.get('/scripts/todoScript.js', function( req, res){

    res.sendFile(__dirname + '/scripts/todoScript.js')
} )

app.listen( 3000, function() {
    console.log("Server is running on http://localhost:3000");
})


function readAllDataFromFilePr( path )
{
    return new Promise( function( resolve, reject ){

        fs.readFile( path, 'utf-8', function(err,data) {
            if( err )
            {
                reject( err );
            }
            else{
                if( data.length === 0 )
                {
                    data = "[]"
                }
                
                try{
                    data = JSON.parse(data);
                    resolve(data);
                }
                catch(err){
                    reject(err);
                }
                
            }
         });

    })
}

function readAllDataFromFile( callback, path='./db/logs.json' )
{
    fs.readFile( path, 'utf-8', function(err,data) {
        if( err )
        {
            callback( err );
            return;
        }
        else{
            if( data.length === 0 )
            {
                data = "[]"
            }
            
            try{
                data = JSON.parse(data);
                callback( null, data);
            }
            catch(err){
                callback(err);
            }
            
        }
    });
}

function writeToFile( todo, callback )
{
    readAllDataFromFile( function( err, data ){
        if( err )
        {
            callback(err);
            return;
        }
        else{


            data.push(todo);

            fs.writeFile( './db/logs.json', JSON.stringify(data), function(err) {
                if(err){
                    callback(err);
                    return;
                }
                
            })
        }
    })
    callback(null);
}

