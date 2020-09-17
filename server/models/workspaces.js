const mongoose = require('mongoose')

const WorkspaceSchema = mongoose.Schema({
	creator: { type: String, required: true },
	plans: { type: String, default: '[]' },
	genknowledges: { type: String, default: '[]' }
})

module.exports = mongoose.model('Workspaces', WorkspaceSchema)
