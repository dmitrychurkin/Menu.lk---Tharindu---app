import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { HistoryOrdersPage } from './history-orders';
import { TimelineOrderStatusComponent } from "./timeline-order-status.component";

@NgModule({
  imports: [ IonicPageModule.forChild(HistoryOrdersPage) ],
  declarations: [ HistoryOrdersPage, TimelineOrderStatusComponent ]
})
export class HistoryOrdersModule {}

