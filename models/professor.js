const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Int32 = require('mongoose-int32');
const autoIncrement = require('mongoose-auto-increment');

const databaseURL = 'mongodb+srv://admin:admin@commforumdb-df0ls.mongodb.net/commforumdb';

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
	useCreateIndex: true
};

mongoose.connect(databaseURL, options);

var connection = mongoose.createConnection(databaseURL, options);
autoIncrement.initialize(connection);

var professorSchema = new Schema({
	profNumber: {type: Int32},
	college: {type: String},
	gender: {type: String},
	profName: {type: String},
	profCourse: {type: String}
});

professorSchema.plugin(autoIncrement.plugin, {
    model: 'professor',
    field: 'profNumber',
    startAt: 36,
    incrementBy: 1
});

module.exports = mongoose.model('professor', professorSchema, 'professor');