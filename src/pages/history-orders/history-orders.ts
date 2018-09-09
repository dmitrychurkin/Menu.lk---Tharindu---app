
import { Component, Inject, Injector } from "@angular/core";
import { CollectionReference, DocumentSnapshot, Timestamp } from "@firebase/firestore-types";
import { AngularFirestore } from "angularfire2/firestore";
import { ActionSheetController, IonicPage, ModalController } from "ionic-angular";
import { Cart, IHistoryModalTransferState, IQuickOrder } from "../../interfaces";
import { AuthService, IFetcherArgs, OrdersManagerService, RootDataReceiverService, MessangingService } from "../../services";
import { StateDataStoreEntity } from "../data-state-store.class";
import { PageBaseClass } from "../page-base.class";
import { APP_CART_PAGE, FIREBASE_DB_TOKENS, OrderStatus, OrderManagmentActionFlag, DATA_STORE_CURRENT_ORDERS_TOKEN } from '../pages.constants';


const { ORDERS, ORDER_CONTENT } = FIREBASE_DB_TOKENS;

const BG_COLOR_PROCESS_FRONT = 'linear-gradient(to bottom, #3a9cd5 0%, #4fd5d0 50%, #2c91e6 51%, #0a9ebc 100%)';
const BG_COLOR_PROCESS_BACK = 'linear-gradient(to bottom, #55c6d2 0%, #2a8ab9 50%, #0093aa 51%, #2db0cb 100%)';
const BG_COLOR_DONE_FRONT = 'linear-gradient(to bottom, #9dd53a 0%, #a1d54f 50%, #80c217 51%, #7cbc0a 100%)';
const BG_COLOR_DONE_BACK = 'linear-gradient(to bottom, #bfd255 0%, #8eb92a 50%, #72aa00 51%, #9ecb2d 100%)';
const BG_COLOR_CANCEL_FRONT = 'linear-gradient(to bottom, #f5893d 0%, #d5754f 50%, #e65f2c 51%, #bc410a 100%)';
const BG_COLOR_CANCEL_BACK = 'linear-gradient(to bottom, #d28955 0%, #b9532a 50%, #b9592d 51%, #cb582d 100%)';

const ARR_PROCESS = [BG_COLOR_PROCESS_FRONT, BG_COLOR_PROCESS_BACK];
const metaStatusColorsMap = {
  cartColors: ARR_PROCESS,
  buttonName: 'cancel',
  orderActionFlag: OrderManagmentActionFlag.CANCEL
};

@IonicPage()
@Component({
  selector: 'page-history-orders',
  templateUrl: 'history-orders.html'
})
export class HistoryOrdersPage extends PageBaseClass<SegmentOptions, IQuickOrder> {


  sortingFn = () => ({ timestamp: timestampA }: IQuickOrder, { timestamp: timestampB }: IQuickOrder) => (<Timestamp>timestampB).toMillis() - (<Timestamp>timestampA).toMillis();

  currentSegmentValue: SegmentOptions = 'current_orders';
  
  OrderStatus = OrderStatus;
  OrderManagmentActionFlag = OrderManagmentActionFlag;

  statusColorsMap = {
    [OrderStatus.PLACED]: metaStatusColorsMap,
    [OrderStatus.PROCESSED]: metaStatusColorsMap,
    [OrderStatus.DELIVERY]: {
      cartColors: ARR_PROCESS
    },
    [OrderStatus.DONE]: {
      cartColors: [BG_COLOR_DONE_FRONT, BG_COLOR_DONE_BACK],
      orderActionFlag: OrderManagmentActionFlag.DELETE
    },
    [OrderStatus.CANCELLED]: {
      cartColors: [BG_COLOR_CANCEL_FRONT, BG_COLOR_CANCEL_BACK],
      buttonName: 'restore',
      orderActionFlag: OrderManagmentActionFlag.RESTORE
    }
  };

  private _isActionBtnClicked: boolean;

  constructor(
    private readonly _actionSheetCtrl: ActionSheetController,
    private readonly _modalCtrl: ModalController,
    private readonly _authService: AuthService,
    private readonly _afDb: AngularFirestore,
    private readonly _rootDataReceiverService: RootDataReceiverService<Cart>,
    private readonly _ordersManagerService: OrdersManagerService,
    readonly messService: MessangingService,
    @Inject(DATA_STORE_CURRENT_ORDERS_TOKEN) private readonly _currentOrdersStore: StateDataStoreEntity<IQuickOrder>,
    injector: Injector) {

    super(injector);
    
    this._currentOrdersStore.defaultAction = this.actionFetchDone();
    this.DataStore.set(this.currentSegmentValue, this._currentOrdersStore);
  }

  get CONFIG(): IFetcherArgs<IQuickOrder> {

    return {
      mode: 'list',
      collection: ORDERS,
      queryFn: (ref: CollectionReference) => ref.where('uid', '==', this._authService.userInstance.uid).where('orderStatus', '>=', OrderStatus.DONE)
    };

  };


  dateFormatter(timestamp: Timestamp) {

    const arrayOfDate = timestamp.toDate().toString().split(' ').slice(1, 5);

    return `${arrayOfDate.slice(0, 3).join(' / ')} - ${arrayOfDate.slice(-1)}`

  }

  async onBtnAction({ target }: any, order: IQuickOrder) {
    
    if (this._isActionBtnClicked) return;

    this._isActionBtnClicked = true;


    const el: HTMLElement = target.closest('button') || target.closest('.order-card');
    const actionFlag: OrderManagmentActionFlag = +el.dataset.action;
    
    switch (actionFlag) {

      case OrderManagmentActionFlag.VIEW: {

        const modalTransferState: IHistoryModalTransferState = {
          mode: 'modal',
          orderInfo: order,
          orderContent: await this._afDb
                                  .doc(`${ORDERS}/${order.id}/${ORDER_CONTENT}/${order.id}`)
                                  .ref
                                  .get()
                                  .then((documentSnapshot: DocumentSnapshot) => this._rootDataReceiverService.decodeDataSnapshot(documentSnapshot as any))
        };
  
        await this._modalCtrl.create(APP_CART_PAGE, modalTransferState).present();

        break;

      }

      default:
        await this._ordersManagerService.dispatchOrderAction(actionFlag, order);

    }

    delete this._isActionBtnClicked;

  }

  private _presentLegend() {

    this._actionSheetCtrl.create({
      title: 'COLOR HINTS',
      enableBackdropDismiss: true,
      buttons: [
        {
          text: 'Order placement / Processing / Deivery',
          cssClass: 'legend-process',
          icon: 'bookmark'
        },
        {
          text: 'Done',
          cssClass: 'legend-done',
          icon: 'bookmark'
        },
        {
          text: 'Cancel',
          cssClass: 'legend-cancel',
          icon: 'bookmark'
        },
        {
          text: 'PRO TIP! Tap on order card to view an order content',
          icon: 'bulb'
        }
      ]
    }).present();

  }


  ionViewCanEnter(): boolean {

    const user = this._authService.userInstance;

    return !!(user && user.uid && !user.isAnonymous);

  }

  ionViewDidLoad() {

    new Promise((resolve: () => void) =>
      this.dataStore.subject$.next({

        onQueryComplete: this.actionFetchDone(resolve, null, false),

      })).then(() => this._presentLegend());

  }



  ionViewWillUnload() {

    this.clearDataStates((value: SegmentOptions) => value === 'history_orders');

  }

}



type SegmentOptions = 'current_orders' | 'history_orders';

