import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {
	// variables && objects
	username = ""
	password = ""
	confirmpassword = ""
	errormsg = ""
	
	// methods
	goToPage(page) {
		this.router.navigate(['/' + page])
	}
	login() {
		var { username, password, confirmpassword } = this

		this.http
			.post<any[]>('http://localhost:3000/users/login', {
				username: username,
				password: password
			})
			.subscribe(data => {
				var error = data['error']
				var id, workspaceid, spacecreator, errormsg

				if (!error) {
					id = data['id']
					workspaceid = data['workspaceid']
					spacecreator = data['spacecreator']

					localStorage.setItem("id", id)
					localStorage.setItem("workspaceid", workspaceid)
					localStorage.setItem("spacecreator", spacecreator)

					this.router.navigate(['/main'])
				} else {
					this.errormsg = data['errormsg']
				}
			})
	}

	constructor(private http: HttpClient, private router: Router) { }

	ngOnInit(): void {

	}
}
