import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-price',
	templateUrl: './price.component.html',
	styleUrls: ['./price.component.sass']
})
export class PriceComponent implements OnInit {
	goToPage(page) {
		this.router.navigate(['/' + page])
	}
	
	constructor(private router: Router) { }

	ngOnInit(): void {
		
	}
}
