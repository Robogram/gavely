const mongoose = require('mongoose')

const UserSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, unique: true },
	profile: { type: String, required: true, default: '{"photo": "", "width": 0, "height": 0}' },
	knowledges: { type: String, required: true, default: '[]' }
})

module.exports = mongoose.model('Users', UserSchema)
