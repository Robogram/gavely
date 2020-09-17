const mongoose = require('mongoose')

const PlanSchema = mongoose.Schema({
	creator: { type: String, required: true },
	header: { type: String },
	start_date: { type: String, required: true },
	end_date: { type: String, required: true },
	tasks: { type: String, default: '[]' },
	workers: { type: String, default: '[]' },
	managers: { type: String, default: '[]' }
})

module.exports = mongoose.model('Plans', PlanSchema)
