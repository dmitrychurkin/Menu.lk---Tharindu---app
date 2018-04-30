import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: 'app-login-widget',
  template: `<ion-content class="login-component" padding>
              <div class="bg-img-cont">
                  <div class="bg-img"></div>
              </div>
              <h1 text-center class="main-title">Menu.lk</h1>
              <ng-container *ngFor="let btn of buttons; index as i">
                  <button (click)="signIn(i)" margin-top [style.color]="btn.txtColor" ion-button [style.background-color]="btn.btnColor"
                      block>
                      <ion-icon *ngIf="btn.ico" class="btn-ico" [name]="btn.ico"></ion-icon>
                      <span text-uppercase>{{!btn.custom ? 'sign in with ' : ''}}{{btn.name}}</span>
                  </button>
              </ng-container>
            </ion-content>`
})
export class LoginWidgetComponent {

  @Output('signInTypeSelected') signInStrategy = new EventEmitter<ISignInMeta>(true);

  buttons = [
    {
      txtColor: '#736868',
      btnColor: '#f4f4f4',
      name: 'google',
      ico: 'logo-google',
      //upcase: true
    },
    {
      txtColor: '#f4f4f4',
      btnColor: '#f53d3d',
      name: 'email',
      ico: 'mail',
      //upcase: false
    },
    {
      txtColor: '#222',
      btnColor: '#fec900',
      name: 'try the app without login',
      custom: true,
     //upcase: true
    }
  ];


  signIn(flag: number) {
    // authProvider.signIn(i);
    this.signInStrategy.emit({ flag });
  }
}

export interface ISignInMeta {
  flag: number;
}