import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { HistoryOrdersPage } from './history-orders';
import { TimelineOrderStatusComponent } from "./timeline-order-status.component";
import { ExtrasModule } from "../../components";

@NgModule({
  imports: [ IonicPageModule.forChild(HistoryOrdersPage), ExtrasModule ],
  declarations: [ HistoryOrdersPage, TimelineOrderStatusComponent ]
})
export class HistoryOrdersModule {}

