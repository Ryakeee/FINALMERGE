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

var fallbackSchema = new Schema({
	studentId: {type: Int32, ref:'user', required: true},
	question: {type: String, required: true},
	answer: {type: String, required: true}
});

module.exports = mongoose.model('fallback', fallbackSchema);