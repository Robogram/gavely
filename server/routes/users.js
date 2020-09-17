const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt');
const saltRounds = 10;
const genknowledges = [
	"writing", "designing", "baking", "reading", "building", 
	"organizing", "speaking","driving", "delivering", "talking", 
	"researching", "calling", "inviting"
]

// models
const User = require('../models/users')
const Plan = require('../models/plans')
const Workspace = require('../models/workspaces')

router.get("/", (req, res) => {
	res.send("this is the users routes")
})

router.post("/login", async(req, res) => {
	var username = req.body.username
	var password = req.body.password
	var creator, worker, planid, user, workspace, msg

	if (username && password) {
		user = await User.findOne({ username: username })

		creator = await Plan.findOne({ creator: user ? user.id : '' })
		worker = await Plan.findOne({ workers: {$regex: user ? user.id : '' }})

		if (creator || worker) {
			planid = creator ? creator.id : worker.id

			if (user) {
				workspace = await Workspace.findOne({ plans: {$regex: planid }})
				password = await bcrypt.compare(password, user.password)

				if (password) {
					res.json({ 'error': false, 'id': user.id, 'workspaceid': workspace.id, 'spacecreator': workspace.creator })
				} else {
					msg = "Password is incorrect"
				}
			} else {
				msg = "User doesn't exist"
			}
		} else {
			res.json({ 'error': true })
		}
	} else {
		if (!username) {
			msg = "Username is empty"
		} else {
			msg = "Password is empty"
		}
	}

	res.json({ 'error': true, 'errormsg': msg })
})

router.post("/register", async(req, res) => {
	var { username, email, password, confirmpassword } = req.body
	var salt, hash, old_user, msg

	if (username && email && password && confirmpassword) {
		if (password == confirmpassword) {
			salt = await bcrypt.genSalt(saltRounds)
			hash = await bcrypt.hash(password, salt)

			old_user = await User.findOne({ email: email })

			if (!old_user) {
				const user = new User({
					username: username,
					email: email,
					password: hash
				})

				const workspace = new Workspace({
					creator: req.body.username,
					genknowledges: JSON.stringify(genknowledges)
				})

				try {
					const user_result = await user.save()
					const workspace_result = await workspace.save()

					res.json({ 'error': false, 'id': user_result.id, 'workspaceid': workspace_result.id, 'spacecreator': workspace_result.creator })
				} catch (e) {
					var { keyValue } = e

					if (keyValue.username) {
						msg = "This username already existed"
					} else if (keyValue.email) {
						msg = "This e-mail already existed"
					}
				}
			} else {
				res.json({ 'error': true })
			}
		} else {
			msg = "Password mismatch"
		}
	} else {
		if (!username) {
			msg = "Username is empty"
		} else if (!email) {
			msg = "E-mail is empty"
		} else if (!password) {
			msg = "Password is empty"
		} else {
			msg = "Please confirm your password"
		}
	}

	res.json({ 'error': true, 'errormsg': msg })
})

router.post("/get_info", async(req, res) => {
	var { id } = req.body, user, plan, workspace, genknowledges, workers, datas

	user = await User.findOne({ _id: id })
	workspace = await Workspace.findOne({ creator: user.username })
	plan = await Plan.findOne({
		"$or": [{
			creator: user ? user.username : ''
		}, {
			workers: {$regex: id}
		}]
	})

	if (!workspace) {
		workspace = await Workspace.findOne({ plans: {$regex: plan.id }})
	}

	if (user && workspace) {
		genknowledges = JSON.parse(workspace.genknowledges)

		res.json({ 'error': false, 'user': user, 'genknowledges': genknowledges })
	} else {
		res.json({ 'error': true })
	}
})

router.get("/empty_everything", async(req, res) => {
	await User.deleteMany({})
	await Plan.deleteMany({})
	await Workspace.deleteMany({})

	res.json({ 'error': false })
})

module.exports = router
