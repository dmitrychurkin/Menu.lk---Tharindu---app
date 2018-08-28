import { Component } from "@angular/core";
import { Events, IonicPage, ViewController } from "ionic-angular";
import { APP_EV, PopoverCartMenuEventFlags } from "../pages.constants";

@IonicPage()
@Component({
  selector: 'page-popover-cart-menu',
  template: `<ion-list no-margin>
              <ng-container [ngSwitch]="popoverState">
                <button *ngSwitchCase="s.DELETE" (tap)="onAction(s.DELETE)" ion-item detail-none>
                  <ion-icon name="trash" item-start color="danger"></ion-icon>
                  <ion-label>Delete</ion-label>
                </button>
                <button *ngSwitchCase="s.CANCEL" (tap)="onAction(s.CANCEL)" ion-item detail-none>
                  <ion-icon name="close-circle" item-start color="secondary"></ion-icon>
                  <ion-label>Cancel</ion-label>
                </button>
              </ng-container>
            </ion-list>`
})
export class PopoverCartMenu {

  static state: PopoverCartMenuEventFlags = PopoverCartMenuEventFlags.DELETE;
  s = PopoverCartMenuEventFlags;
  constructor(
    private _viewCtrl: ViewController,
    private _events: Events) {}

  get popoverState() {
    return PopoverCartMenu.state;
  }
  onAction(action: PopoverCartMenuEventFlags): void {

    this._viewCtrl.dismiss()
                  .then(() => {
                    switch (action) {
                      case this.s.DELETE: {
                        PopoverCartMenu.state = this.s.CANCEL;
                        this._events.publish(APP_EV.DELETE_CART_MODE, this.s.DELETE);
                        break;
                      }
                      case this.s.CANCEL: {
                        PopoverCartMenu.state = this.s.DELETE;
                        this._events.publish(APP_EV.DELETE_CART_MODE, this.s.CANCEL);
                        break;
                      }
                    }
                  });
  }
  

}