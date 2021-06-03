const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const {Schema} = mongoose;
const app = express();
const port = process.env.PORT || 8000;


app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, './static')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'))

mongoose.connect('mongodb://localhost:27017/message_board', {useNewUrlParser : true})
mongoose.connection.on('connected', () => console.log('Finally Connected! Thank you Lord!'))

const MessageSchema = new mongoose.Schema({
    name: { type: String, required: [ true, 'Name is required']},
    message: {type: String, required: [ true, 'message is required']},
    _comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});
const Message = mongoose.model('Message', MessageSchema);
const CommentSchema = new mongoose.Schema({
    name: { type: String, required: true},
    comment: {type: String, required: true},
    _messages: [{type: Schema.Types.ObjectId, ref: 'Message'}]
})
const Comment = mongoose.model('Comment', CommentSchema);

app.get('/', function(req, res) {
    Message.find({}).populate('_comments').exec(function(error, messages){
        res.render('index', {messages: messages})
    })
})
app.post('/messages', function(req, res) {
    const newMessage = new Message({ name: req.body.name, message: req.body.message });
    newMessage.save(function(error) {
        if (error) { console.log(error) 
        } else {
            console.log("Created a new message");
            res.redirect('/');
        }
    })
})
app.post('/comments/:id', function(req,res) {
    const messageId = req.params.id; 
    Message.findOne({ _id : messageId}, function(error, message){
        const newComment = new Comment({ name: req.body.name, comment: req.body.comment})
        newComment._messages = message._id;
        Message.update({_id: message._id}, { $push: {_comments: newComment }}, function(error) {
        });
        newComment.save(function(error) {
            if (error) {
                console.log(error);
                res.render('index.ejs', {errors: newComment.errors});
            } else {
                console.log('comment added');
                res.redirect('/');
            }
        })
    })
})
app.listen(port, () => console.log(`Listening on PORTIFY ${ port }`));