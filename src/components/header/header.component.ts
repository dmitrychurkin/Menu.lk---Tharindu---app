import { Component } from "@angular/core";

@Component({
  selector: 'app-header',
  template: `
          <ion-navbar>
            <ion-grid>
                <ion-row>
                    <ion-title>Menu.lk</ion-title>
                    <app-cart></app-cart>
                </ion-row>
            </ion-grid>
          </ion-navbar>
          `
}) 
export class HeaderComponent {}