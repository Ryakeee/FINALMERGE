const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Int32 = require('mongoose-int32');
const ObjectId = Schema.Types.ObjectId;

const databaseURL = 'mongodb+srv://admin:admin@commforumdb-df0ls.mongodb.net/commforumdb';

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
};

mongoose.connect(databaseURL, options);

var commentSchema = new Schema({
	reviewRef: {type: ObjectId, ref: 'review', required: true},
	studentRef: {type: ObjectId, ref: 'user', required: true},
	commentContent: {type: String, required: true},
});

module.exports = mongoose.model('comment', commentSchema);