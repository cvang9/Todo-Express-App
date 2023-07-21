const express = require("express");
const fs = require("fs")

// What and Why?
const app = express();

app.use( function(req,res, next ) {
    console.log(req.url, req.method );
    next()
})

app.use(express.json());

app.post('/todo', function( req, res){

    writeToFile( req.body, function( err ){
        if( err ){
            res.status(500).send('error')
            return;
        }

        res.status(200).send('success')
    });

    
//     fs.readFile( './db/logs.json', 'utf-8', function( err, data ) {
//         if( err ){

//             // Check
//             res.status(500).json({
//                 message: "some error ocuured while reading the file"
//             });
//             return;
//         }

//         if( data.length === 0 )
//         {
//             data = "[]";
//         }

//         try{
//             data = JSON.parse(data);
//             data.push(req.body);

//             fs.writeFile( './db/logs.json', JSON.stringify(data), function( err ){
                
//                 if(err){
//                     res.status(500).json({
//                         message: "Internal Server Error"
//                     });
//                     return;
//                 }

//                 res.status(200).json({
//                     message: "Data sent successfully to the server"
//                 });
//             });
//         }
//         catch(err){
//             res.status(500).json({
//                 message:"Internal Server Error"
//             })
//         }

//     })
});

app.get( '/tododata', function( req, res ) {

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
            })

            fs.writeFile( './db/logs.json', JSON.stringify(data), function(err) {
                if(err){
                    res.status(500).json({ update :'failed'});
                    return;
                }

                res.status(200).json({update:'success'})
            });
    });
})

app.post( '/deletetodo', function( req, res ) {

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

app.get('/', function( req, res ){
    
    res.sendFile(__dirname + '/public/home.html')
})

app.get('/about', function( req, res ){
    
    res.sendFile(__dirname + '/public/about.html')
})

app.get('/contact', function( req, res ){
    
    res.sendFile(__dirname + '/public/contact.html')
})

app.get('/todo', function( req, res ){
    
    res.sendFile(__dirname + '/public/todo.html')
})

app.get('/scripts/todoScript.js', function( req, res){
    res.sendFile(__dirname + '/scripts/todoScript.js')
} )

app.listen( 3000, function() {
    console.log("Server is running on localhost:3000");
})

function readAllDataFromFile( callback )
{
    fs.readFile( './db/logs.json', 'utf-8', function(err,data) {
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

