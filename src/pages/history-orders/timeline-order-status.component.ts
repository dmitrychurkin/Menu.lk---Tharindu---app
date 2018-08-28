import { Component, Input } from "@angular/core";
import { OrderStatus } from "../pages.constants";

@Component({
  selector: 'timeline-order-status',
  template: `
    <div class="landmark" *ngFor="let stage of stages; index as i">
      <div class="landmark-icon-wrapper">
        <ion-icon color="light" [name]="stage.icon[ orderStatus == enumStatus.CANCELLED && i == stages.length - 1  ? 1 : 0 ]"></ion-icon>
        <ion-icon *ngIf="i < stages.length - 1" class="landmark-icon-arrow" color="light" name="arrow-forward"></ion-icon>
      </div>
      <ion-item class="landmark-checkbox">
        <ion-checkbox color="light" [checked]="orderStatus == enumStatus.CANCELLED ? (i == stages.length - 1) : (i <= orderStatus)"></ion-checkbox>
      </ion-item>
      <p class="landmark-caption" text-capitalize>{{stage.caption[ orderStatus == enumStatus.CANCELLED && i == stages.length - 1 ? 1 : 0 ]}}</p>
      <p class="landmark-caption" *ngIf="!i">{{stage.caption[1]}}</p> 
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      justify-content: space-around;
      margin-top: 15px;
      position: relative;
    }
    :host::after {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      background: transparent;
      z-index: 2;
    }
    .landmark {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 25%;
    }
    .landmark-icon-wrapper {
      position: relative;
    }
    .landmark-icon-arrow {
      position: absolute;
      left: 31px;
    }
    .landmark::before, .landmark:last-child::after {
      content: '';
      display: block;
      width: 50%;
      border-bottom: 2px solid #000;
      transform: translate(-25px, 43px);
    }
    .landmark:last-child::after {
      transform: translate(26px, -38px);
    }
    .landmark-checkbox {
      background-color: transparent;
    }
    .landmark-caption {
      font-size: 1rem;
    }
  `]
})
export class TimelineOrderStatusComponent {

  enumStatus = OrderStatus;

  @Input() orderStatus: OrderStatus;

  stages = [
    {
      icon: ['cart'],
      caption: ['order', 'placement']
    },
    {
      icon: ['home'],
      caption: ['processing']
    },
    {
      icon: ['basket'],
      caption: ['delivery']
    },
    {
      icon: ['thumbs-up', 'close'],
      caption: ['done', 'cancelled']
    }
  ]

}