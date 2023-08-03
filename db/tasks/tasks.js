const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task:{ type: String },
    priority: {type: String },
    filename: { type: String },
    saved: {type: String }
});

const TaskModel = mongoose.model( 'todo', taskSchema );

module.exports = TaskModel;