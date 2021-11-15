import {Component} from '@angular/core';

@Component({
  selector: 'app-welcome',
  template: `
    <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; height: 100vh">
      <h1>Welcome to Sales Mock</h1>
      <a routerLink="/sale">Start Now</a>
    </div>
  `
})

export class WelcomePage{

}
