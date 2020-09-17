import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.sass']
})
export class MainComponent implements OnInit {
	month_arr = [
		"January", "February", "March", "April", "May", "June", 
		"July", "August", "September", "October", "November", "December"
	]
	day_arr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	times = [31540000000, 2628000000, 604800000, 86400000, 3600000, 60000]
	time_headers = ['year', 'month', 'week', 'day', 'hour', 'minute']
	curr_date = new Date()
	year = this.curr_date.getFullYear()
	month = this.month_arr[this.curr_date.getMonth()]
	day = this.day_arr[this.curr_date.getDay()]
	date = this.curr_date.getDate()
	hour = this.curr_date.getHours()
	minute = this.curr_date.getMinutes()
	period = this.hour < 12 ? 'AM' : 'PM'

	// variables && objects
	url = 'http://localhost:3000'
	id = localStorage.getItem("id")
	workspaceid = localStorage.getItem("workspaceid")
	spacecreator = localStorage.getItem("spacecreator")
	username = ""
	plans = []
	hidden = {
		show: false,

		// add workers
		addworkers: false,
		collabtype: '',
		note: '', 
		email: "",
		emails: [],
		sent: false,

		// remove workers
		removeworkers: false,

		item_hold: {},
		plan: -1, task: -1,
		planid: '', taskid: '',

		// worker picker
		pickworker: false,
		workers: [
			{'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name':'jake'}, {'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name':'george'}, 
			{'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name':'megan'}, {'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name':'fox'}, 
			{'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name':'hero'}, {'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name':'amil'}, 
			{'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name': 'kelvin'}, {'profile': {'photo': 'profile', 'height': 364, 'width': 364}, 'name': 'tyty'}
		],
		selected_worker: "", 

		// date selection
		date_type: "", enable_save: false, 

		// knowledge requirements selection
		knowledgereq: false,
		newknowledge: "",
		generic_knowledges: [],
		selected_knowledges: [],
		errormsg: ""
	}
	curr_time = {day: this.day, month: this.month, date: this.date, year: this.year, hour: this.hour == 0 ? 12 : this.hour > 12 ? this.hour - 12 : this.hour, minute: this.minute, period: this.period }
	days = []

	constructor(private http: HttpClient, private router: Router) { }

	ngOnInit(): void {
		this.http.post<any[]>('http://localhost:3000/users/get_info', {
			id: this.id
		})
		.subscribe(data => {
			var error = data['error']
			var user, genknowledges

			if (!error) {
				user = data['user']
				genknowledges = data['genknowledges']

				this.username = user.username
				this.hidden.generic_knowledges = genknowledges
			}
		})

		this.getPlans()
	}

	// methods
	goToPage(page) {
		if (page == 'login') {
			localStorage.clear()
		}

		this.router.navigate(['/' + page])
	}
	
	// plan
	getPlans() {
		this.http.post<any[]>(this.url + '/plans/get_plans', {
			workspaceid: this.workspaceid
		})
		.subscribe(data => {
			var error = data['error']

			if (!error) {
				this.plans = data['plans']
			}
		})

		//setInterval(this.displayTimelapse, 1000)
		//setInterval(this.displayBetweenDates, 1000)
		//setInterval(this.displayTimeleft, 1000)
	}
	startPlan() {
		this.http.post<any[]>(this.url + '/plans/create_plan', {
			id: this.id,
			workspaceid: this.workspaceid
		})
		.subscribe(data => {
			var error = data['error']
			var planid

			if (!error) {
				planid = data['planid']

				this.plans.unshift({
					"id": planid,
					"header": {"title": "", "edit": false, "newinfo": ""},
					"start_date": {"type": "none", "current_date": "", "selected_date": "", "edit": false},
					"end_date": {"type": "none", "current_date": "", "selected_date": "", "edit": false},
					"tasks": []
				})
			}
		})
	}
	deletePlan(planid) {
		var planindex

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index
			}
		})

		this.http.post<any[]>(this.url + '/plans/delete_plan', {
			planid: planid,
			workspaceid: this.workspaceid
		})
		.subscribe(data => {
			var error = data['error']

			if (!error) {
				this.plans.splice(planindex, 1)
			}
		})
	}
	searchPlan(plan_name) {
		// access server to find the plan
	}
	saveHeader(planid, taskid) {
		var value, planindex = -1, taskindex = -1

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index

				value = plan.header.newinfo

				if (taskid != "") {
					plan.tasks.forEach(function (task, index) {
						if (task.id == taskid) {
							taskindex = index

							value = task.job.newinfo
						}
					})
				}
			}
		})

		this.http.post<any[]>(this.url + '/plans/save_header', {
			id: this.id,
			planid: planid,
			taskid: taskid,
			value: value
		})
		.subscribe(data => {
			var error = data['error']

			if (!error) {
				if (taskindex > -1) {
					this.plans[planindex].tasks[taskindex].job.title = value
					this.plans[planindex].tasks[taskindex].job.newinfo = ""
					this.plans[planindex].tasks[taskindex].job.edit = false
				} else {
					this.plans[planindex].header.title = value
					this.plans[planindex].header.newinfo = ""
					this.plans[planindex].header.edit = false
				}
			}
		})
	}
	// end plan

	// hidden box
	// add workers
	openAddWorkers(planid, type) {
		var hidden = this.hidden, planindex = -1, taskindex = -1

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index
			}
		})

		hidden.show = true
		hidden.addworkers = true
		hidden.collabtype = type

		if (type == 'worker') {
			hidden.note = 'Worker(s) can only view and keep up to date with this plan'
		} else {
			hidden.note = 'Manager(s) can view, edit and keep up to date with this plan'
		}

		hidden.plan = planindex
		hidden.task = taskindex
		hidden.planid = planid

		this.hidden = hidden
	}
	closeAddWorkers() {
		var hidden = this.hidden

		hidden.show = false
		hidden.addworkers = false
		hidden.collabtype = ''
		hidden.emails = []
		hidden.sent = false

		this.hidden = hidden
	}
	sendInvites() {
		var { emails, planid } = this.hidden
		var invites = []

		emails.forEach(function (email) {
			invites.push(email.newinfo)
		})

		this.http.post<any[]>(this.url + '/workspaces/send_invites', {
			planid: planid,
			workers: invites
		})
		.subscribe(data => {
			var error = data['error']
			var self = this

			if (!error) {
				self.hidden.sent = true

				setTimeout(function () {
					self.closeAddWorkers()
				}, 1000)
			}
		})
	}
	// end add workers

	// remove workers
	openRemoveWorkers() {
		var hidden = this.hidden

		hidden.show = true
		hidden.removeworkers = true

		this.hidden = hidden
	}
	removeWorker(worker) {
		var { workers } = this.hidden

		workers.splice(worker, 1)

		this.hidden.workers = workers
	}
	closeRemoveWorkers() {
		var hidden = this.hidden

		hidden.show = false
		hidden.removeworkers = false

		this.hidden = hidden
	}
	saveRemoveWorkers() {
		var hidden = this.hidden

		hidden.show = false
		hidden.removeworkers = false

		// access server to save workers
	}
	// end remove workers

	// calendar
	prevYear() {
		var { year } = this.curr_time

		this.curr_time.year = year - 1
		this.displayCalendar()
	}
	nextYear() {
		var { year } = this.curr_time

		this.curr_time.year = year + 1
		this.displayCalendar()
	}
	prevMonth() {
		var { month } = this.curr_time
		var month_index = this.month_arr.indexOf(month)

		month_index = month_index == 0 ? 11 : month_index - 1

		this.curr_time.month = this.month_arr[month_index]
		this.displayCalendar()
	}
	nextMonth() {
		var { month } = this.curr_time
		var month_index = this.month_arr.indexOf(month)

		month_index = month_index == 11 ? 0 : month_index + 1

		this.curr_time.month = this.month_arr[month_index]
		this.displayCalendar()
	}
	pickDate(day, date) {
		var { plan, task, date_type } = this.hidden
		var { month, year, hour, minute, period } = this.curr_time
		var item = task > -1 ? 
			this.plans[plan].tasks[task][date_type + '_date']
			: 
			this.plans[plan][date_type + '_date']

		this.curr_time.day = this.day_arr[day - 1]
		this.curr_time.date = date

		item.selected_date = { 
			day: this.day_arr[day], month: month, date: date, year: year, 
			hour: hour, minute: minute, period: period
		}

		if (task > -1) {
			this.plans[plan].tasks[task][date_type + '_date'] = item
		} else {
			this.plans[plan][date_type + '_date'] = item
		}

		this.hidden.enable_save = true
		this.displayCalendar()
	}
	changeTime(type, dir) {
		var { plan, task, date_type } = this.hidden
		var { hour, minute, period } = this.curr_time
		var item = task > -1 ? 
			this.plans[plan].tasks[task][date_type + '_date']
			: 
			this.plans[plan][date_type + '_date']

		switch (type) {
			case 'hour':
				hour = dir == 'up' ? hour + 1 : hour - 1

				if (hour < 1) {
					hour = 12
				} else if (hour > 24) {
					hour = 1
				}

				if (hour > 12) {
					hour -= 12
				}

				break
			case 'minute':
				minute = dir == 'up' ? minute + 1 : minute - 1

				if (minute < 0) {
					minute = 59
				} else if (minute > 59) {
					minute = 0
				}

				break
			default:
				period = period == 'AM' ? 'PM' : 'AM'

				break
		}

		this.curr_time.hour = hour
		this.curr_time.minute = minute
		this.curr_time.period = period

		if (task > -1) {
			this.plans[plan].tasks[task][date_type + '_date'] = item
		} else {
			this.plans[plan][date_type + '_date'] = item
		}

		item.selected_date = this.curr_time

		this.hidden.enable_save = true

		this.displayCalendar()
	}
	openCalendar(planid, taskid, date_type) {
		var item, date, current_date, planindex = -1, taskindex = -1

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index

				if (taskid != "") {
					plan.tasks.forEach(function (task, index) {
						if (task.id == taskid) {
							taskindex = index
						}
					})
				}
			}
		})

		this.hidden.show = true
		this.hidden.plan = planindex
		this.hidden.task = taskindex
		this.hidden.planid = planid
		this.hidden.taskid = taskid
		this.hidden.date_type = date_type

		if (taskindex > -1) {
			this.hidden.item_hold = this.plans[planindex].tasks[taskindex]
		} else {
			this.hidden.item_hold = this.plans[planindex]
		}

		item = taskindex > -1 ? 
			this.plans[planindex].tasks[taskindex][date_type + '_date']
			: 
			this.plans[planindex][date_type + '_date']
		date = item.current_date

		if (date) {
			date.hour = date.hour == 0 ? 12 : date.hour > 12 ? date.hour - 12 : date.hour

			current_date = { day: date.day, month: date.month, date: date.date, year: date.year, hour: date.hour, minute: date.minute, period: date.period }

			this.curr_time = current_date
		}

		this.displayCalendar()
	}
	displayDate(time) {
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
	displayBetweenDates(item) {
		var values = [0, 0, 0, 0, 0, 0], now_millis, date_now
		var month, start_millis, end_millis, start_date = null, end_date = null
		var between_millis, header = "", value_count = 0
		var year, month, date, day, hour, minute
		var self = this

		if (
			item.start_date && item.end_date &&
			item.start_date.current_date && item.end_date.current_date
		) {
			start_date = item.start_date.current_date
			end_date = item.end_date.current_date

			month = this.month_arr.indexOf(end_date.month)
			end_millis = new Date(end_date.year, month, end_date.date, end_date.hour, end_date.minute).getTime()

			// milliseconds to start
			month = this.month_arr.indexOf(start_date.month)
			start_millis = new Date(start_date.year, month, start_date.date, start_date.hour, start_date.minute).getTime()
			between_millis = end_millis - start_millis

			date_now = new Date()
			year = date_now.getFullYear()
			month = date_now.getMonth()
			date = date_now.getDate()
			hour = date_now.getHours()
			minute = date_now.getMinutes()
			now_millis = new Date(year, month, date, hour, minute).getTime()

			if (now_millis >= start_millis && now_millis <= end_millis) {
				this.times.forEach(function (time, index) {
					if (between_millis > time) {
						while (between_millis > time) {
							values[index]++
							between_millis -= time
						}

						if (values[index] > 0) {
							value_count++
						}
					}
				})

				values.forEach(function (value, index) {
					if (value > 0) {
						value_count--

						header += value + " " + self.time_headers[index]
						header += value > 1 ? 's' : ''

						if (value_count > 0) {
							if (value_count > 1) {
								header += ", "
							} else {
								header += " and "
							}
						}
					}
				})

				return header
			} else {
				if (now_millis < start_millis) {
					return null
				} else {
					return "ended"
				}
			}
		}

		return null
	}
	displayTimelapse(item) {
		var date_now, leftover, year, month, day, hour, minute
		var values = [0, 0, 0, 0, 0, 0]
		var header = "", value_count = 0
		var start_date, start_millis
		var self = this

		if (
			item.start_date && item.end_date && 
			item.start_date.type == 'date' && item.end_date.type == 'lapse'
		) {
			start_date = item.start_date.current_date

			month = this.month_arr.indexOf(start_date.month)
			start_millis = new Date(start_date.year, month, start_date.date, start_date.hour, start_date.minute).getTime()

			date_now = Date.now()
			leftover = date_now - start_millis

			this.times.forEach(function (time, index) {
				if (leftover > time) {
					while (leftover > time) {
						values[index]++
						leftover -= time
					}

					if (values[index] > 0) {
						value_count++
					}
				}
			})

			values.forEach(function (value, index) {
				if (value > 0) {
					value_count--

					header += value + " " + self.time_headers[index]
					header += value > 1 ? 's' : ''

					if (value_count > 0) {
						if (value_count > 1) {
							header += ", "
						} else {
							header += " and "
						}
					}
				}
			})

			return header
		}

		return null
	}
	displayTimeleft(item) {
		var values = [0, 0, 0, 0, 0, 0], now_millis, date_now
		var month, start_millis, end_millis, start_date = null, end_date = null
		var leftover_millis, header = "", value_count = 0
		var year, month, date, day, hour, minute
		var self = this

		if (
			item.start_date && item.end_date &&
			item.start_date.current_date && item.end_date.current_date
		) {
			start_date = item.start_date.current_date
			end_date = item.end_date.current_date

			month = this.month_arr.indexOf(end_date.month)
			end_millis = new Date(end_date.year, month, end_date.date, end_date.hour, end_date.minute).getTime()

			// milliseconds to start
			month = this.month_arr.indexOf(start_date.month)
			start_millis = new Date(start_date.year, month, start_date.date, start_date.hour, start_date.minute).getTime()

			date_now = new Date()
			year = date_now.getFullYear()
			month = date_now.getMonth()
			date = date_now.getDate()
			hour = date_now.getHours()
			minute = date_now.getMinutes()
			now_millis = new Date(year, month, date, hour, minute).getTime()

			if (now_millis >= start_millis && now_millis <= end_millis) {
				leftover_millis = end_millis - now_millis

				this.times.forEach(function (time, index) {
					if (leftover_millis > time) {
						while (leftover_millis > time) {
							values[index]++
							leftover_millis -= time
						}

						if (values[index] > 0) {
							value_count++
						}
					}
				})

				values.forEach(function (value, index) {
					if (value > 0) {
						value_count--

						header += value + " " + self.time_headers[index]
						header += value > 1 ? 's' : ''

						if (value_count > 0) {
							if (value_count > 1) {
								header += ", "
							} else {
								header += " and "
							}
						}
					}
				})

				return header
			} else {
				if (now_millis < start_millis) {
					return null
				} else {
					return "ended"
				}
			}
		}

		return null
	}
	displayDateHeader(date) {
		var date = date && date.current_date ? 
			date.current_date
			:
			null
		var month, date_now, millis

		if (date != null) {
			month = this.month_arr.indexOf(date.month)
			millis = new Date(date.year, month, date.date, date.hour, date.minute).getTime()

			date_now = new Date().getTime()

			return date_now > millis ? "Started" : "Will Start"
		} else {
			return "Start"
		}
	}
	cancelCalendar() {
		var { plan, task, date_type } = this.hidden
		var curr_date = new Date(), year = curr_date.getFullYear(), month = this.month_arr[curr_date.getMonth()]
		var day = this.day_arr[curr_date.getDay()], date = curr_date.getDate(), hour = curr_date.getHours()
		var minute = curr_date.getMinutes(), period = hour < 12 ? 'AM' : 'PM'
		var item = task > -1 ? 
						this.plans[plan].tasks[task][date_type + "_date"]
						: 
						this.plans[plan][date_type + "_date"]

		item.selected_date = ""
		item.edit = false

		if (task > -1) {
			this.plans[plan].tasks[task][date_type + '_date'] = item
		} else {
			this.plans[plan][date_type + '_date'] = item
		}

		this.hidden.show = false
		this.hidden.plan = -1
		this.hidden.task = -1
		this.hidden.planid = ""
		this.hidden.taskid = ""
		this.hidden.item_hold = {}
		this.hidden.date_type = ""
		this.hidden.enable_save = false
		this.days = []

		this.curr_time = {day: day, month: month, date: date, year: year, hour: hour == 0 ? 12 : hour > 12 ? hour - 12 : hour, minute: minute, period: period }
	}
	saveCalendar(info) {
		var { item_hold, plan, task, planid, taskid, date_type } = this.hidden
		var item = item_hold[date_type + "_date"]
		var { day, month, date, year, hour, minute, period } = item.selected_date ? item.selected_date : this.curr_time
		var selected_date = { day: day, month: month, date: date, year: year, hour: hour, minute: minute, period: period }

		if (period == 'PM') {
			selected_date.hour += 12
		}

		if (info) {
			if (info == 'lapse') {
				item.type = "lapse"
				item.current_date = ""
			} else {
				item.type = "date"
				item.current_date = selected_date
			}

			item.selected_date = ""

			if (task > -1) {
				this.plans[plan].tasks[task][date_type + "_date"] = item
			} else {
				this.plans[plan][date_type + "_date"] = item
			}
		}

		this.http.post<any[]>(this.url + '/plans/save_date', {
			planid: planid,
			taskid: taskid,
			info: info,
			date_type: date_type,
			current_date: item.current_date
		})
		.subscribe(data => {
			var error = data['error']

			if (!error) {
				this.hidden.show = false
				this.hidden.plan = -1
				this.hidden.task = -1
				this.hidden.planid = ""
				this.hidden.taskid = ""
				this.hidden.item_hold = {}
				this.hidden.date_type = ""
				this.days = []
			}
		})
	}
	displayCalendar() {
		var { item_hold, plan, task, date_type } = this.hidden, { year, month } = this.curr_time
		var day = {"Sun": 1, "Mon": 2, "Tue": 3, "Wed": 4, "Thu": 5, "Fri": 6, "Sat": 7}
		var month_index = this.month_arr.indexOf(month), firstday = day[new Date(year, month_index, 1).toString().substr(0, 3)]
		var numdays = new Date(year, month_index + 1, 0).getDate()
		var k, m, display = false, c_day = 0
		var item = item_hold[date_type + "_date"]
		var hold, hold_date = null
		var current_time, plan_start_date, plan_end_date
		var task_start_date, task_end_date, plan_time = [0, 0, 0], available

		this.days = []

		if (item['selected_date']) {
			if (year == item['selected_date'].year && month == item['selected_date'].month) {
				hold_date = item['selected_date'].date
			}
		} else if (item['current_date']) {
			if (year == item['current_date'].year && month == item['current_date'].month) {
				hold_date = item['current_date'].date
			}
		} else {
			hold_date = new Date().getDate()
		}

		// set boundaries on calendar
		plan_start_date = this.plans[plan].start_date.current_date
		plan_end_date = this.plans[plan].end_date.current_date

		if (plan_start_date != "") {
			plan_time[0] = new Date(
				plan_start_date.year, 
				this.month_arr.indexOf(plan_start_date.month),
				plan_start_date.date,
				plan_start_date.hour,
				plan_start_date.minute,
			).getTime()
		}

		if (plan_end_date != "") {
			plan_time[2] = new Date(
				plan_end_date.year,
				this.month_arr.indexOf(plan_end_date.month),
				plan_end_date.date,
				plan_end_date.hour,
				plan_end_date.minute
			).getTime()
		}

		if (task > -1) { 
			if (date_type == 'start') {
				if (item_hold['end_date'].current_date != "") {
					task_end_date = item_hold['end_date'].current_date

					plan_time[1] = new Date(
						task_end_date.year,
						this.month_arr.indexOf(task_end_date.month),
						task_end_date.date,
						task_end_date.hour,
						task_end_date.minute
					).getTime()
				}
			} else {
				if (item_hold['start_date'].current_date != "") {
					task_start_date = item_hold['start_date'].current_date

					plan_time[1] = new Date(
						task_start_date.year,
						this.month_arr.indexOf(task_start_date.month),
						task_start_date.date,
						task_start_date.hour,
						task_start_date.minute
					).getTime()
				}
			}
		}

		for (k = 1; k <= 6; k++) {
			this.days.push([])

			for (m = 1; m <= 7; m++) {
				if (k == 1 && m == firstday) {
					display = true
				}

				this.days[k - 1].push({"day": m - 1, "date": '', "selected": false, "available": true})
				hold = this.days[k - 1][m - 1]

				if (display) {
					c_day++

					// make out of bound date unavailable if task is editing
					current_time = new Date(year, month_index, c_day)

					if (plan_time[0] > 0) {
						if (current_time < plan_time[0] && plan_time[2] > 0) {
							hold['available'] = false
						}
					}

					if (plan_time[2] > 0) {
						if (current_time > plan_time[2] && plan_time[0] > 0) {
							hold['available'] = false
						}
					}

					if (plan_time[1] > 0) {
						if (date_type == 'start') {
							if (current_time > plan_time[1]) { // plan time is end date
								hold['available'] = false
							}
						} else {
							if (current_time < plan_time[1]) { // plan time is start date
								hold['available'] = false
							}
						}
					}

					hold['date'] = c_day

					if (hold_date == c_day) {
						hold['selected'] = true
					} 
				} else {
					hold['day'] = ''
					hold['date'] = ''
				}

				this.days[k - 1][m - 1] = hold

				if (c_day == numdays) {
					display = false
				}
			}
		}
	}
	// end calendar

	// worker picker
	openWorkerPicker(planid, taskid) {
		var hidden = this.hidden, planindex = -1, taskindex = -1
		var selected_worker

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index

				if (taskid != "") {
					plan.tasks.forEach(function (task, index) {
						if (task.id == taskid) {
							taskindex = index
						}
					})
				}
			}
		})

		selected_worker = this.plans[planindex].tasks[taskindex].worker.title

		hidden.show = true
		hidden.plan = planindex
		hidden.task = taskindex
		hidden.planid = planid
		hidden.taskid = taskid

		if (taskindex > -1) {
			hidden.item_hold = this.plans[planindex].tasks[taskindex]
		} else {
			hidden.item_hold = this.plans[planindex]
		}

		hidden.pickworker = true
		hidden.selected_worker = selected_worker

		this.hidden = hidden
	}
	pickWorker(name) {
		var { selected_worker } = this.hidden

		if (selected_worker == name) {
			selected_worker = ""
		} else {
			selected_worker = name
		}

		this.hidden.selected_worker = selected_worker
	}
	closeWorker() {
		this.hidden.show = false
		this.hidden.pickworker = false
	}
	saveWorker() {
		var hidden = this.hidden
		var { plan, task, selected_worker } = this.hidden

		this.plans[plan].tasks[task].worker.title = selected_worker

		hidden.show = false
		hidden.plan = -1
		hidden.task = -1
		hidden.planid = ""
		hidden.taskid = ""
		hidden.item_hold = {}
		hidden.pickworker = false
		hidden.selected_worker = ""

		this.hidden = hidden
	}
	// end worker picker

	// task
	autoPickWorker(planid, taskid) {
		var req_knowledges, planindex = -1, taskindex = -1

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index

				if (taskid != "") {
					plan.tasks.forEach(function (task, index) {
						if (task.id == taskid) {
							taskindex = index
						}
					})
				}
			}
		})

		req_knowledges = this.plans[planindex].tasks[taskindex].req_knowledges

		if (req_knowledges.length > 0) {
			this.http.post<any[]>(this.url + '/plans/autopick_worker', {
				planid: planid,
				taskid: taskid
			})
			.subscribe(data => {
				var error = data['error']
				var knowledges

				if (!error) {
					knowledges = data['knowledges']

					alert(JSON.stringify(knowledges))
				}
			})
		} else {
			this.plans[planindex].tasks[taskindex].errormsg = "You have not set any require knowledge(s)"
		}
	}
	editKnowledge(planid, taskid) {
		var planindex = -1, taskindex = -1, knowledges
		var self = this

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index

				if (taskid != "") {
					plan.tasks.forEach(function (task, index) {
						if (task.id == taskid) {
							taskindex = index
						}
					})
				}
			}
		})

		knowledges = this.plans[planindex].tasks[taskindex].req_knowledges
		knowledges.forEach(function (knowledge) {
			self.hidden.selected_knowledges.push(knowledge)
		})

		this.hidden.show = true
		this.hidden.knowledgereq = true
		this.hidden.plan = planindex
		this.hidden.task = taskindex
		this.hidden.planid = planid
		this.hidden.taskid = taskid

		if (taskindex > -1) {
			this.hidden.item_hold = this.plans[planindex].tasks[taskindex]

			this.plans[planindex].tasks[taskindex].errormsg = ""
		} else {
			this.hidden.item_hold = this.plans[planindex]
		}
	}
	selectKnowledge(knowledge) {
		var { selected_knowledges } = this.hidden
		var index = selected_knowledges.indexOf(knowledge)

		if (selected_knowledges.indexOf(knowledge) == -1) {
			selected_knowledges.push(knowledge)
		} else {
			selected_knowledges.splice(index, 1)
		}
	
		this.hidden.selected_knowledges = selected_knowledges
	}
	deleteKnowledge(knowledge) {
		var { generic_knowledges } = this.hidden
		var index = generic_knowledges.indexOf(knowledge)

		generic_knowledges.splice(index, 1)

		this.hidden.generic_knowledges = generic_knowledges
	}
	addKnowledge() {
		var { generic_knowledges, newknowledge } = this.hidden

		if (newknowledge) {
			generic_knowledges.push(newknowledge)

			this.http.post<any[]>(this.url + '/workspaces/add_genknowledges', {
				workspaceid: this.workspaceid,
				knowledges: generic_knowledges
			})
			.subscribe(data => {
				var error = data['error']

				if (!error) {
					this.hidden.generic_knowledges = generic_knowledges
				}
			})
		} else {
			this.hidden.errormsg = "not entered"
		}
	}
	cancelKnowledge() {
		this.hidden.show = false
		this.hidden.knowledgereq = false
		this.hidden.plan = -1
		this.hidden.task = -1
		this.hidden.planid = ""
		this.hidden.taskid = ""
		this.hidden.item_hold = {}
		this.hidden.selected_knowledges = []
	}
	saveKnowledges() {
		var { plan, task, planid, taskid, selected_knowledges } = this.hidden

		this.http.post<any[]>(this.url + '/plans/save_knowledges', {
			planid: planid,
			taskid: taskid,
			knowledges: selected_knowledges
		})
		.subscribe(data => {
			var error = data['error']

			if (!error) {
				this.plans[plan].tasks[task].req_knowledges = selected_knowledges

				this.hidden.show = false
				this.hidden.knowledgereq = false
				this.hidden.plan = -1
				this.hidden.task = -1
				this.hidden.planid = ""
				this.hidden.taskid = ""
				this.hidden.item_hold = {}
				this.hidden.selected_knowledges = []
			}
		})
	}
	addTask(planid) {
		var planindex

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index
			}
		})

		this.http.post<any[]>(this.url + '/plans/add_task', {
			planid: planid
		})
		.subscribe(data => {
			var error = data['error']
			var taskid

			if (!error) {
				taskid = data['taskid']

				this.plans[planindex].tasks.unshift({
					"id": taskid,
					"worker": {"title": ""},
					"job": {"title": "", "edit": false, "newinfo": ""},
					"start_date": {"type": "none", "current_date": "", "selected_date": "", "edit": false},
					"end_date": {"type": "none", "current_date": "", "selected_date": "", "edit": false},
					"req_knowledges": []
				})
			}
		})	
	}
	removeTask(planid, taskid) {
		var planindex = -1, taskindex = -1

		this.plans.forEach(function (plan, index) {
			if (plan.id == planid) {
				planindex = index

				plan.tasks.forEach(function (task, index) {
					if (task.id == taskid) {
						taskindex = index
					}
				})
			}
		})

		this.http.post<any[]>(this.url + '/plans/remove_task', {
			planid: planid,
			taskid: taskid
		})
		.subscribe(data => {
			var error = data['error']

			if (!error) {
				this.plans[planindex].tasks.splice(taskindex, 1)
			}
		})
	}
	// end task
	// end hidden box
}
