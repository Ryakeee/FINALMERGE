const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Int32 = require('mongoose-int32');

const databaseURL = 'mongodb+srv://admin:admin@commforumdb-df0ls.mongodb.net/commforumdb';

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
};

mongoose.connect(databaseURL, options);

var userSchema = new Schema({
	studentName: {type: String},
	studentId: {type: Int32},
	password: {type: String},
	isAdmin: {type: Boolean}
});

module.exports = mongoose.model('user', userSchema, 'user');