const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide quiz title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide quiz description'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
}, {
    timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;