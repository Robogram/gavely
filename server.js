var express = require('express')
var bodyParser = require('body-parser')
var mongodb = require('mongodb').MongoClient
var mongoose = require('mongoose')
var app = express()
var port = process.env.PORT || 3000
var url = 'mongodb://localhost:27017/gavely'
var usersRoutes = require('./server/routes/users')
var plansRoutes = require('./server/routes/plans')
var workspacesRoutes = require('./server/routes/workspaces')

app.use(bodyParser.json())
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
	res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE')

	if (req.method == 'OPTIONS') {
		res.sendStatus(200)
	} else {
		next()
	}
})

mongoose.connect(url, { useNewUrlParser: true }, () => {
	console.log('connected to DB')

	app.use('/plans', plansRoutes)
	app.use('/users', usersRoutes)
	app.use('/workspaces', workspacesRoutes)
})

app.listen(port, (err) => {
	if (!err) {
		console.log("gavely backend is running on port: " + port)
	} else {
		console.log("gavely backend is unable to run")
	}
})

