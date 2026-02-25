const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please provide question text'],
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    options: {
        type: [String],
        required: [true, 'Please provide at least 2 options'],
        validate: {
            validator: function(options) {
                return options.length >= 2;
            },
            message: 'At least 2 options are required'
        }
    },
    keywords: {
        type: [String],
        default: []
    },
    correctAnswerIndex: {
        type: Number,
        required: [true, 'Please provide correct answer index'],
        min: [0, 'Correct answer index must be at least 0'],
        // validate: {
        //     validator: function(value) {
        //         return value < this._update.$set?.options.length;
        //     },
        //     message: 'Correct answer index must be within options range'
        // }
    }
}, {
    timestamps: true
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
