import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroComponent } from './intro/intro.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { MainComponent } from './main/main.component';
import { PriceComponent } from './price/price.component';
import { RegisterComponent } from './register/register.component';
import { WorkerComponent } from './worker/worker.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: 'intro', component: IntroComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'main', component: MainComponent },
	{ path: 'price', component: PriceComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'worker/:planid/:type/:workeremail', component: WorkerComponent },
	{ path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponent = [
	IntroComponent, LoginComponent, AboutComponent, 
	MainComponent, PriceComponent, 
	RegisterComponent, WorkerComponent
]
