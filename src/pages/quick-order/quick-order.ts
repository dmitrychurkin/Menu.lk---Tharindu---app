import { Component, Renderer2, Inject } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AngularFirestore } from "angularfire2/firestore";
import { IonicPage, TextInput, Platform, NavController, Events } from "ionic-angular";
import { IQuickOrder, FormUserTemplateData } from "../../interfaces";
import { AuthService, ShoppingCartService, ToastMessangerService, NetworkService, MessangingService } from "../../services";
import { ANGULAR_ANIMATION_OPACITY, CART_ACTION_FLAGS, OrderStatus, FIREBASE_DB_TOKENS, SOUND_MAPPER, FORM_USER_TEMPLATE_DATA, APP_EV } from "../pages.constants";

const { ORDERS, ORDER_CONTENT } = FIREBASE_DB_TOKENS;


@IonicPage()
@Component({
  selector: 'page-quick-order',
  templateUrl: 'quick-order.html',
  animations: [ ANGULAR_ANIMATION_OPACITY() ]
})
export class QuickOrder {

  static isQuickOrderSent = false;

  selfRef = QuickOrder;

  constructor(
    @Inject(FORM_USER_TEMPLATE_DATA) readonly formTemplateData: FormUserTemplateData,
    private readonly _renderer2: Renderer2, 
    private readonly _af: AngularFirestore,
    private readonly _authService: AuthService,
    private readonly _networkService: NetworkService,
    private readonly _toastMessService: ToastMessangerService,
    private readonly _messService: MessangingService,
    private readonly _platform: Platform,
    private readonly _events: Events,
    private readonly _navCtrl: NavController,
    private readonly _shoppingCartService: ShoppingCartService) {}


  uiCtrl(input: TextInput) {
    
    const getModeHelper = (SHADOW= '') =>  
        !value && valid ? 
        (_isFocus ? `${SHADOW}${VALID}` : '') 
        : (invalid ? `${SHADOW}${DANGER}` : `${SHADOW}${VALID}`);

    const { _isFocus, value, ngControl: { invalid, valid, touched } } = input;

    if (!_isFocus && touched && invalid) {

      return input.setFocus();

    }

    const DANGER = '#f53d3d';
    const VALID = '#32db64';
    const SHADOW = 'inset 0 -1px 0 0 ';

    const elem: HTMLElement = input.getNativeElement();
    const itemInner = elem.closest('.item-inner') as HTMLElement;
    const ionLabel = elem.previousElementSibling as HTMLElement;

    this._renderer2.setStyle(ionLabel, 'color', getModeHelper());
    this._renderer2.setStyle(itemInner, 'border-bottom-color', getModeHelper());
    this._renderer2.setStyle(itemInner, 'box-shadow', getModeHelper(SHADOW));

  }

  

  onQuickOrder({ invalid, value }: NgForm) {

    if (invalid || QuickOrder.isQuickOrderSent || !this._networkService.checkNetwork()) return;

    this._events.publish(APP_EV.QUICK_ORDER_SENT, QuickOrder.isQuickOrderSent = true);
    const { isAnonymous, uid } = this._authService.userInstance;
    const { CURRENCY, TOTAL_COST } = this._shoppingCartService.CART_OBJECT_DB;

    
    const quickOrderObj: IQuickOrder = {
      currency: CURRENCY,
      price: TOTAL_COST,
      userData: value,
      timestamp: new Date(),
      uid, isAnonymous,
      orderStatus: OrderStatus.PLACED
    };
    
    const batch = this._af.firestore.batch();
    
    const orderId = this._af.createId();
    const orderRef = this._af.collection(ORDERS).doc(orderId).ref;

    batch.set(orderRef, quickOrderObj);

    const orderContentRef = orderRef.collection(ORDER_CONTENT).doc(orderId);

    batch.set(orderContentRef, this._shoppingCartService.CART_OBJECT_DB);

    this._authService.retryStrategy(() => batch.commit())
                      .catch((err: Error) => err)
                      .then((err?: Error) => {
                        
                        const toastOptions = {
                          message: this._messService.getMessage(`${OrderStatus.PLACED}_${QuickOrder.name}`, orderId),
                          showCloseButton: true,
                          closeButtonText: 'Ok'
                        };

                        return (err ? 
                                this._toastMessService.showToast({ ...toastOptions, message: this._messService.getMessage( this._platform.is('cordova') ? 'appError' : (err && err.message) ) })
                              :
                                this._shoppingCartService.completer({ 
                                  actionFlag: CART_ACTION_FLAGS.DELETE,
                                  message: toastOptions,
                                  soundPath: SOUND_MAPPER.SEND_ORDER
                                }).then(() => {

                                  
                                  const cb = () => this._events.publish(APP_EV.QUICK_ORDER_SENT, false);

                                  if (this._navCtrl.canGoBack()) {
                                    
                                    return this._navCtrl.popToRoot().then(cb);
                                  
                                  }

                                  cb();
                              
                                }))
                                .then(() => { QuickOrder.isQuickOrderSent = false });

                      });
    
  }

  onAjustHeight(textInput: TextInput) {

    const elem: HTMLTextAreaElement = textInput.getNativeElement().firstElementChild;
    this._renderer2.setStyle(elem, 'height', 'auto');
    this._renderer2.setStyle(elem, 'overflow', 'hidden');
    this._renderer2.setStyle(elem, 'height', `${elem.scrollHeight}px`);

    this.uiCtrl(textInput);

  }

}
