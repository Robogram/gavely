const express = require('express')
const router = express.Router()

// models
const User = require('../models/users')
const Plan = require('../models/plans')
const Workspace = require('../models/workspaces')

router.get("/", (req, res) => {
	res.send("this is the plans routes")
})

router.post("/get_plans", async(req, res) => {
	var { workspaceid } = req.body
	var workspace = await Workspace.findOne({ _id: workspaceid })
	var plans = JSON.parse(workspace.plans)
	var datas = await Plan.find({ _id: {$in: plans}})
	var plans = [], header, start_date, end_date, tasks
	var start_type, start_current_time, end_type, end_current_time
	var task_start_type, task_start_current_time, task_end_type, task_end_current_tie
	var data_tasks, tasks

	if (datas.length > 0) {
		datas.forEach(function (data) {
			start_date = JSON.parse(data.start_date)
			end_date = JSON.parse(data.end_date)
			data_tasks = JSON.parse(data.tasks)
			tasks = []

			start_type = start_date['type']
			start_current_date = start_date['current_date']
			end_type = end_date['type']
			end_current_date = end_date['current_date']

			data_tasks.forEach(function (task) {
				task_start_date = task.start_date
				task_end_date = task.end_date

				task_start_type = task_start_date['type']
				task_start_current_date = task_start_date['current_date']
				task_end_type = task_end_date['type']
				task_end_current_date = task_end_date['current_date']

				tasks.push({
					"id": task.id,
					"worker": {"title": task.worker},
					"job": {"title": task.job, "edit": false, "newinfo": ""},
					"start_date": {"type": task_start_type, "current_date": task_start_current_date, "selected_date": "", "edit": false},
					"end_date": {"type": task_end_type, "current_date": task_end_current_date, "selected_date": "", "edit": false},
					"req_knowledges": task.req_knowledges,
					"errormsg": ""
				})
			})

			plans.push({
				"id": data._id,
				"header": {"title": data.header, "edit": false, "newinfo": ""},
				"start_date": {"type": start_type, "current_date": start_current_date, "selected_date": "", "edit": false},
				"end_date": {"type": end_type, "current_date": end_current_date, "selected_date": "", "edit": false},
				"tasks": tasks.reverse(),
				"workers": JSON.parse(data.workers),
				"managers": JSON.parse(data.managers)
			})
		})
	}

	res.json({ 'error': false, 'plans': plans.reverse() })
})

router.post("/create_plan", async(req, res) => {
	var { id, workspaceid } = req.body
	var plan = new Plan({
		creator: id,
		header: '',
		start_date: '{"type": "none", "current_date": ""}',
		end_date: '{"type": "none", "current_date": ""}',
		tasks: '[]'
	}), plans

	plan = await plan.save()

	if (plan._id) {
		const workspace = await Workspace.findOne({ _id: workspaceid })
		plans = JSON.parse(workspace.plans)
		plans.push(plan._id)
		workspace.plans = JSON.stringify(plans)

		await workspace.save({ _id: workspaceid })

		res.json({ 'error': false, 'planid': plan._id })
	} else {
		res.json({ 'error': true })
	}
})

router.post("/delete_plan", async(req, res) => {
	var { planid, workspaceid } = req.body
	var workspace = await Workspace.findOne({ _id: workspaceid })
	var plans = JSON.parse(workspace.plans)

	plans.splice(plans.indexOf(planid), 1)
	workspace.plans = JSON.stringify(plans)

	await workspace.save()
	await Plan.deleteOne({ _id: planid })

	res.json({ 'error': false })
})

router.post("/save_header", async(req, res) => {
	var { id, planid, taskid, value } = req.body
	var plan = await Plan.findOne({ _id: planid }), tasks

	if (taskid != '') {
		tasks = JSON.parse(plan.tasks)

		tasks.forEach(function (task_info) {
			if (task_info.id == taskid) {
				task_info.job = value
			}
		})

		plan.tasks = JSON.stringify(tasks)
	} else {
		plan.header = value
	}

	await plan.save({ _id: planid })

	res.json({ 'error': false })
})

router.post("/save_date", async(req, res) => {
	var { planid, taskid, info, date_type, current_date } = req.body
	var plan = await Plan.findOne({ _id: planid }), tasks
	var date

	if (taskid != '') {
		tasks = JSON.parse(plan.tasks)

		tasks.forEach(function (task_info) {
			if (task_info.id == taskid) {
				date = task_info[date_type + '_date']
				date['type'] = info
				date['current_date'] = current_date

				task_info[date_type + '_date'] = date
			}
		})

		plan.tasks = JSON.stringify(tasks)
	} else {
		date = JSON.parse(plan[date_type + '_date'])
		date['type'] = info
		date['current_date'] = current_date

		plan[date_type + '_date'] = JSON.stringify(date)
	}

	await plan.save({ _id: planid })

	res.json({ 'error': false })
})

router.post("/add_task", async(req, res) => {
	var { id, planid } = req.body
	var plan = await Plan.findOne({ _id: planid })
	var tasks = JSON.parse(plan.tasks)
	var taskid = "", rannum, char, k

	for (k = 1; k <= 24; k++) {
		rannum = Math.floor(Math.random() * 10)

		if (rannum % 2 == 0) {
	        char = Math.floor(Math.random() * 10)
	    } else {
	        char = String.fromCharCode(Math.floor(Math.random() * (90 - 65)) + 65)
	    }

	    taskid += char
	}

	tasks.unshift({
		id: taskid,
		creatorid: id,
		worker: "",
		job: "",
		start_date: {"type": "none", "current_date": ""},
		end_date: {"type": "none", "current_date": ""},
		req_knowledges: []
	})

	plan.tasks = JSON.stringify(tasks)

	await plan.save({ _id: planid })

	res.json({ 'error': false })
})

router.post("/remove_task", async(req, res) => {
	var { planid, taskid } = req.body
	var plan = await Plan.findOne({ _id: planid })
	var tasks = JSON.parse(plan.tasks)

	tasks.forEach(function (task, index) {
		if (task.id == taskid) {
			tasks.splice(index, 1)
		}
	})

	plan.tasks = JSON.stringify(tasks)

	await plan.save({ _id: planid })

	res.json({ 'error': false })
})

router.post("/autopick_worker", async(req, res) => {
	var { planid, taskid } = req.body
	var plan = await Plan.findOne({ _id: planid })
	var tasks = JSON.parse(plan.tasks)
	var knowledges

	tasks.forEach(function (task) {
		if (task.id == taskid) {
			knowledges = task.req_knowledges
		}
	})

	res.json({ 'knowledges': knowledges })
})

router.post("/save_knowledges", async(req, res) => {
	var { planid, taskid, knowledges } = req.body
	var plan = await Plan.findOne({ _id: planid })
	var tasks = JSON.parse(plan.tasks)

	tasks.forEach(function (task) {
		if (task.id == taskid) {
			task.req_knowledges = knowledges
		}
	})

	plan.tasks = JSON.stringify(tasks)

	await plan.save({ _id: planid })

	res.json({ 'error': false })
})

module.exports = router
