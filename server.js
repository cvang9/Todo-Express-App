const express = require("express");
const session = require('express-session');
const multer = require('multer');
const mongodb = require('./db/connectdb.js');
const UserModel = require('./db/users/users.js');
const TaskModel = require('./db/tasks/tasks.js');
const bcrypt = require('bcrypt')


mongodb.init()
.then( function() {
    console.log('Mongo is running')
    app.listen( 3000, function() {
        console.log("Server is running on http://localhost:3000");
    });    
})
.catch( function(err){
    console.log(err);
});

const multerStorage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,__dirname+'/uploads');
    },
    filename: function( req, file, callback ){
        callback( null, file.originalname );
    },
})

function filter( req, file, cb )
{
    if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' )
    {
        cb( null, true );
    }
    else{
        cb( null, false );
    }
}

const upload = multer({storage: multerStorage, fileFilter: filter });



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
app.use(upload.single('todoImg'));
app.use(express.static('uploads'));

app.post('/addtodoImg', async function(req, res){

    const task = req.body.task
    const priority = req.body.priority;

    if( !task || ! priority || !req.file || task.replace(/\s+/g, '').length === 0 )
    {
        res.render('todo',{username:req.session.username, error:'Enter todo details properly'});
        return;
    }

    const id = Math.floor(Math.random() * 10000000000000001);


    const filename = req.file.originalname;

    const data = {
        task,
        priority,
        filename,
        saved: 'no'
    }
    

     try {
        const result = await TaskModel.create(data);
        console.log(result._id.toString()  );
     } catch (error) {
        console.log(error)
     }

        res.redirect('/todo');
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

app.get( '/tododata', async function( req, res ) {

    console.log( 'Data todo =>'+req.session.isLoggedIn);

    if( !req.session.isLoggedIn )
    {
        res.status(401).send('Log In first');
        return;
    }

    const data = await TaskModel.find();
    res.status(200).json(data);

});

app.post('/editdata', async function( req ,res) {

    console.log( ' edit Data =>'+req.session.isLoggedIn);

    if( !req.session.isLoggedIn )
    {
        res.status(401).json({result:'Please log In'});
        return;
    }

      const obj = req.body;
      const task = await TaskModel.findById(obj.id);

      const data = {
        task: obj.data,
        priority: task.priority,
        filename: task.filename,
        saved: task.saved
      }

      const result = await TaskModel.findByIdAndUpdate( obj.id, data )
      console.log(result);
      res.status(200).json({result:'success'});
           
    });

app.post('/taskDone', async function( req, res){

    const id = req.body.id;
    
    const task = await TaskModel.findById(id);

    const data = {
        task: task.data,
        priority: task.priority,
        filename: task.filename,
        saved: 'yes'
      }

      const result = await TaskModel.findByIdAndUpdate( id, data )
      res.status(200).json({result:'success'});

});

app.post( '/deletetodo', async function( req, res ) {

    if( !req.session.isLoggedIn )
    {
        res.status(401).json({result:'Please log In'});
        return;
    }

    const selectedId = req.body.id;

    const result = await TaskModel.findByIdAndDelete(selectedId);

    res.status(200).json({deletion:'success'})
});



app.get( '/signup', function( req, res){
    res.render('signup', {error: null })
});

app.post('/signup', async function( req, res) {
    
    try {
        
        const data = await UserModel.findOne({username:req.body.username});
        
          
        if( data != undefined ){
           return res.render('signup',{error: 'Username already taken'});
        }


        const hash = await bcrypt.hash(req.body.password, 10)
        const doc = {
            username: req.body.username,
            password: hash
        }

        const result = await UserModel.create(doc);
        console.log(result)
        res.redirect('/')

    } catch (error) {
        console.log(error)
        res.status(500).send({result:error});
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
        const result = await UserModel.findOne({username:req.body.username});

        if( result == undefined )
           return res.render('login',{error: "Invalid user credentials"})
           
        const isMatch = await bcrypt.compare(req.body.password, result.password);
       
        if( result.email === req.body.email && isMatch )
        {
            req.session.isLoggedIn = true;
            req.session.username = req.body.username;
            return res.redirect('/')
        }
            
        else 
            return res.render('login',{error: "Invalid user credentials"})

    } catch (error) {
        console.log(error);
        res.json({success:false}); 
    }

    // try {

    //     let flag = false;
    //     // const data = await readAllDataFromFilePr('./db/users.json');
    //     const data = await UserModel.find();
    //     const hash = await bcrypt.hash(req.body.password, 10)
    //     console.log(hash)

    //     data.forEach( function( user ){
            
    //         if( user.username === req.body.username && user.password == hash )
    //         {
    //             req.session.isLoggedIn = true;
    //             req.session.username = user.username;
    //             res.redirect('/');
    //             flag = true;
    //         }
    //     });

    //     if (!flag) {
    //         res.render('login', {error:'Invalid User credentials'});
    //     }
    // } catch (error) {
    //     // res.status(500).json({result:" Error in  reading a file"})
    //     throw error;
    // }
});

// function catchPassword( cred ){
//     return new Promise( async function(resolve,reject){
//         try {
            
//             const data = await UserModel.find();
    
//             data.forEach( async function( user ){
                
//                 if( user.username === cred.username  )
//                 {
//                      const result = await bcrypt.compare(cred.password, user.password)
//                     if (result) {

//                         resolve(null,true)
//                     }
//                 }
//             });
//             resolve(null, false );
//         } catch (error) {
//             reject(error)
//         }
//     });
// }


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
        res.render('todo',{username:req.session.username, error:null})
    }
     
});

app.get('/scripts/todoScript.js', function( req, res){

    res.sendFile(__dirname + '/scripts/todoScript.js')
} )



