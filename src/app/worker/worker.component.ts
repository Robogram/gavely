import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
	selector: 'app-worker',
	templateUrl: './worker.component.html',
	styleUrls: ['./worker.component.sass']
})
export class WorkerComponent implements OnInit {
	url = 'http://localhost:3000'
	planid = this.actroute.snapshot.params.planid
	type = this.actroute.snapshot.params.type
	workeremail = this.actroute.snapshot.params.workeremail
	profile = { photo: "", width: 0, height: 0 }
	username = "testinguser"
	knowledges = [
		'writing', 'designing', 'baking', 'reading', 'building', 'organizing', 
		'speaking','driving', 'delivering', 'talking', 'researching', 'calling', 'inviting'
	]
	selected_knowledges = ['writing', 'designing', 'baking', 'reading']
	newpassword = "password"
	confirmpassword = "password"
	errormsg = ""

	// methods
	browsePhoto(event) {
		var data = event.target
		var url = data.files[0].name
		var reader = new FileReader()
		var image = new Image()
		var m_width = 150, m_height = 150
		var width, height, p_width, p_height
		var self = this

		if (data.files && data.files[0]) {
			reader.onload = (e) => {
				image.onload = () => {
					width = image.width
					height = image.height

					if (width == height) {
						p_width = m_width
						p_height = m_height
					} else {
						if (width > height) {
	                        p_width = m_width
	                        p_height = (height * p_width) / width
	                    } else {
	                        p_height = m_height
	                        p_width = (width * p_height) / height
	                    }
					}

					self.profile.width = p_width
					self.profile.height = p_height
				}

				image.src = e.target.result.toString()
				self.profile.photo = e.target.result.toString()
			}

			reader.readAsDataURL(data.files[0])
		}
	}
	toggleKnowledge(knowledge) {
		var selected_knowledges = this.selected_knowledges
		var index = selected_knowledges.indexOf(knowledge)

		if (index == -1) {
			selected_knowledges.push(knowledge)
		} else {
			selected_knowledges.splice(index, 1)
		}

		this.selected_knowledges = selected_knowledges
	}
	done() {
		var { planid, type, workeremail, profile, username, selected_knowledges, newpassword, confirmpassword } = this

		this.http.post<any[]>(this.url + '/workspaces/register_worker', {
			planid: planid,
			type: type,
			workeremail: workeremail,
			profile: profile,
			username: username,
			knowledges: selected_knowledges,
			newpassword: newpassword,
			confirmpassword: confirmpassword
		})
		.subscribe(data => {
			var error = data['error']
			var id, workspaceid

			if (!error) {
				id = data['id']
				workspaceid = data['workspaceid']

				localStorage.setItem("id", id)
				localStorage.setItem("workspaceid", workspaceid)

				this.router.navigate(['/main'])
			} else {
				this.errormsg = data['errormsg']
			}
		})
	}

	constructor(private http: HttpClient, private actroute: ActivatedRoute, private router: Router) { }

	ngOnInit(): void {

	}
}
