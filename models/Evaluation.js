const mongoose = require('mongoose')

const FormSchema = new mongoose.Schema({
    evalFormId: Number,
    name: String,
    bandRanges: [
        {
            band: Number,
            begin: Number,
            end: Number
        }
    ]
}, {_id: false})
const PersonSchema = new mongoose.Schema({
    _id: Number,
    firstName: String,
    lastName: String,
    displayId: String,
    username: String
})

const EvaluationSchema = new mongoose.Schema({
    _id: Number,
    stateId: Number,
    totalScore: Number,
    evaluated: Number,
    comments: [{author: String, text: String}],
    sections: [{
        name: String,
        totalScore: Number,
        additiveScore: Number,
        maxAdditiveScore: Number,
        questions: [
            {
                name: String,
                selectedOption: String,
                additiveScore: Number,
                maxAdditiveScore: Number,
                comments: [{author: String, text: String}]
            }
        ]
    }]
})

const ContactSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true
    },
    evalStateId: {
        type: Number,
        default: 0
    },
    evaluatedDateTime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    evalForm: FormSchema,
    evaluator: PersonSchema,
    agent: PersonSchema,
    evaluation: EvaluationSchema,
    evaluationFetched: {
        type: Boolean,
        default: false
    },
    evaluationFetchFailed: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})
ContactSchema.index({createdAt: 1},{expireAfterSeconds: 60*60*24*45});

module.exports = mongoose.model('evaluation', ContactSchema)