import { IonicPage } from "ionic-angular";
import { Component } from "@angular/core";

@IonicPage()
@Component({
  selector: 'page-quick-order',
  templateUrl: 'quick-order.html'
})
export class QuickOrder {
  templateData = [
    {
      icon: 'person',
      label: 'your name',
      type: 'text'
    },
    {
      icon: 'call',
      label: 'telephone no',
      type: 'tel'
    },
    {
      icon: 'pin',
      label: 'address',
      type: 'text'
    },
    {
      icon: 'alert',
      label: 'additional information',
      type: 'text'
    }
  ];
}