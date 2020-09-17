import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-intro',
	templateUrl: './intro.component.html',
	styleUrls: ['./intro.component.sass']
})
export class IntroComponent implements OnInit {
	goToPage(page) {
		this.router.navigate(['/' + page])
	}
	
	constructor(private router: Router) { }

	ngOnInit(): void {

	}
}
