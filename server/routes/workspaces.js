const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const fs = require('fs')
const saltRounds = 10

// models
const User = require('../models/users')
const Plan = require('../models/plans')
const Workspace = require('../models/workspaces')

const nodemailer = require('nodemailer')

router.get("/", (req, res) => {
	res.send("this is the workspaces routes")
})

router.post("/send_invites", async(req, res) => {
	function displayDate(time) {
		var { day, month, date, year, hour, minute, period } = time
		var time_header

		time_header = day + ", " + month + " " + date + ", " + year
		time_header += " at "
		time_header += hour == 0 ? 12 : hour > 12 ? hour - 12 : hour
		time_header += ":"
		time_header += minute < 10 ? "0" + minute : minute
		time_header += " " + period

		return time_header
	}

	var { type, planid, workers } = req.body
	var transporter = nodemailer.createTransport({
	    host: '', 
	    port: 465, 
	    secure: true, 
	    auth: {
	        user: '', 
	        pass: ''
	    }
	}), mail, html
	var plan = await Plan.findOne({ _id: planid })

	workers = ['']

	workers.forEach(function (worker) {
		html = "<html>"
		html += "\t<head>"
		html += "\t</head>"
		html += "\t<body>"
		html += "\t<div style='border-radius: 5px; border-style: solid; display: flex; flex-direction: column; height: 300px; justify-content: space-between; margin: 0 auto; width: 400px;'>"
		html += "\t\t<div style='font-size: 40px; padding: 20px 0; text-align: center; width: 400px;'>gavely</div>"
		html += "\t\n"
		html += "\t\t<div style='text-align: center;'>"
		html += "\t\t\t<div>Plan: <strong>" + plan.header + "</strong></div>"
		html += "\t\t\t<div>Start Date: <strong>"
		html += plan.end_date.type == 'date' ? displayDate(plan.start_date.current_date) : 'Not Set Yet'
		html += "</strong></div>"
		html += "\t\t\t<div>End Date: <strong>"
		html += plan.end_date.type == 'date' ? displayDate(plan.end_date.current_date) : 'Not Set Yet'
		html += "\t\t\t</strong></div>"	
		html += "\t\t</div>"
		html += "\t\t<div style='padding: 20px 0; text-align: center;'>Click <a style='color: blue; text-decoration: none;' href='http://localhost:4200/worker/" + planid + "/" + type + "/" + worker + "'>here</a> to join</div>"
		html += "\t</div>"
		html += "\t</body>"
		html += "</html>"
		
		mail = {
			from: '"Gavely" <>', 
		    to: worker, 
		    subject: 'Plan Invitation', 
		    html: html
		}

		transporter.sendMail(mail, function (err, info) {});
	})

	res.json({ 'error': false })
})

router.post("/add_genknowledges", async(req, res) => {
	var { workspaceid, knowledges } = req.body

	workspace = await Workspace.findOne({ _id: workspaceid })
	workspace.genknowledges = JSON.stringify(knowledges)

	await workspace.save({ _id: workspaceid })

	res.json({ 'error': false })
})

router.post("/register_worker", async(req, res) => {
	var { planid, type, workeremail, profile, username, knowledges, newpassword, confirmpassword } = req.body
	var salt, hash, msg, workers, imagetype, binarydata
	var profile_name = "", rannum, char, k

	if (username && newpassword && confirmpassword && knowledges.length > 0) {
		if (newpassword == confirmpassword) {
			salt = await bcrypt.genSalt(saltRounds)
			hash = await bcrypt.hash(newpassword, salt)

			if (profile.photo) {
				if (profile.photo.includes("png")) {
					imagetype = "png"
				} else if (profile.photo.includes("jpeg")) {
					imagetype = "jpeg"
				}

				profile.photo = profile.photo.replace("data:image/" + imagetype + ";base64,", "")
				binarydata = new Buffer(profile.photo, 'base64').toString('binary')

				for (k = 1; k <= 24; k++) {
					rannum = Math.floor(Math.random() * 10)

					if (rannum % 2 == 0) {
				        char = Math.floor(Math.random() * 10)
				    } else {
				        char = String.fromCharCode(Math.floor(Math.random() * (90 - 65)) + 65)
				    }

				    profile_name += char
				}

				await fs.writeFileSync("src/assets/profiles/" + profile_name + "." + imagetype, binarydata, "binary")

				profile.photo = profile_name + "." + imagetype
			}

			const user = new User({
				username: username,
				email: workeremail,
				password: hash,
				profile: JSON.stringify(profile)
			})

			const plan = await Plan.findOne({ _id: planid })
			const result = await user.save()

			if (type == 'worker') {
				workers = JSON.parse(plan.workers)
				workers.push(user.id)
				plan.workers = JSON.stringify(workers)
			} else {
				managers = JSON.parse(plan.managers)
				managers.push(user.id)
				plan.managers = JSON.stringify(managers)
			}

			await plan.save()

			const workspace = await Workspace.findOne({ plans: {$regex: planid }})

			res.json({ 'error': false, 'id': result.id, 'workspaceid': workspace.id })
		} else {
			msg = "Password mismatch"
		}
	} else {
		if (!username) {
			msg = "Username is empty"
		} else if (!newpassword) {
			msg = "Password is empty"
		} else if (!confirmpassword) {
			msg = "Please confirm your password"
		} else {
			msg = "Please select at least one knowledge you have"
		}
	}

	res.json({ 'error': true, 'errormsg': msg })
})

module.exports = router
