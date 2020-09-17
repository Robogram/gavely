import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {
	username = "username"
	email = "username@hotmail.com"
	password = "password"
	confirmpassword = "password"
	errormsg = ""

	constructor(private http: HttpClient, private router: Router) { }

	ngOnInit(): void {

	}

	// methods
	goToPage(page) {
		this.router.navigate(['/' + page])
	}
	register() {
		var { username, email, password, confirmpassword } = this

		this.http
			.post<any[]>('http://localhost:3000/users/register', {
				username: username,
				email: email,
				password: password,
				confirmpassword: confirmpassword
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
}
