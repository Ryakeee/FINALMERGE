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

var collegeSchema = new Schema({
	shortName: {type: String},
	longName: {type: String},
	logo: {type: String},
	contactUs:{
		telNum: {type: String},
		faxNum: {type: String},
		email: {type: String}
	},
	aboutUs: {type: Array},
	visionMission: {type: String},
	coreValues: {type: String},
	goals: {type: String},
	founderBio: {type: String},
	philosophy: {type: String},
	icon: {type: String}
});

module.exports = mongoose.model('college', collegeSchema);