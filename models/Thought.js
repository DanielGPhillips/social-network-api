const { Schema, model } = require('mongoose');

const reactionSchema = new Schema({
    reactionBody: {
        type: String, 
        required: [true, 'You have to react with some writing.'],
        maxlength: 280,
    },
    username: {
        type: String,
        required: [true, 'Please enter a username.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})
 
const thoughtSchema =  new Schema(
    {
        thoughtText: {
            type: String,
            required: [true, 'You have to enter some text for your thought.'],
            maxlength: 280
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        username: {
            type: String,
            required: [true, 'Please enter a username.']
        },
        reactions: [{ reactionSchema }]
    }, {
        toJSON: {
            virtuals: true,
        }, 
        id: false
    }
);

thoughtSchema.virtual('reactionCount').get(function() {
    return this.reactions.length
});

const Thought = model ('thought', thoughtSchema);
module.exports = Thought;