const mongoose = require('mongoose');

module.exports.init = async function(){
    await mongoose.connect('mongodb+srv://cheems:huehuehue@shoeman.azopfnn.mongodb.net/todoDb?retryWrites=true&w=majority');
}

// mongodb+srv://<username>:<password>@shoeman.azopfnn.mongodb.net/?retryWrites=true&w=majority