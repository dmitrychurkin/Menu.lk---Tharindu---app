import { Component, OnInit, OnDestroy } from "@angular/core";
import { Events, NavParams } from "ionic-angular";
import { APP_EV } from "../../pages/pages.constants";

@Component({
  selector: 'app-header',
  template: `
          <ion-navbar>
            <ion-grid>
                <ion-row>
                    <ion-title>Menu.lk</ion-title>
                
                    <ion-toggle *ngIf="!navParams.get('_id')" color="secondary" [ngModel]="sort" (ngModelChange)="toggle($event)"></ion-toggle>
                    
                    <app-cart></app-cart>
                </ion-row>
            </ion-grid>
          </ion-navbar>
          `
}) 
export class HeaderComponent implements OnInit, OnDestroy {
    sort = false;
    segmentHandler: Function;
    constructor(private _events: Events, public navParams: NavParams) {}
    ngOnInit() {
        this.segmentHandler = (isReversed: boolean) => this.sort = isReversed;
        this._events.subscribe(APP_EV.SEGMENT_CHANGED, this.segmentHandler);
    }
    ngOnDestroy() {
        this._events.unsubscribe(APP_EV.SEGMENT_CHANGED, this.segmentHandler);
    }
    toggle(event: boolean) {
        this.sort = event;
        this._events.publish(APP_EV.SORT_LIST, event);
    }
}