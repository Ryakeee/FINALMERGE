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

var reviewSchema = new Schema({
	profRef: {type: ObjectId, ref: 'professor', required: true},
	profNumber: {type: Int32, required: true},
	profCourse: {type: String, required: true},
	studentRef: {type: ObjectId, ref: 'user', required: true},
	studentId: {type: Int32, required: true},
	reviewContent: {type: String, required: true}
});

module.exports = mongoose.model('review', reviewSchema);