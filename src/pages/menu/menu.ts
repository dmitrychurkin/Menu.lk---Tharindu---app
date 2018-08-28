import { Component, ViewChild } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AngularFirestore } from 'angularfire2/firestore';
import { Header, IonicPage, NavController, NavParams, Platform, Tabs } from 'ionic-angular';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IMenuItem, IMenuType, IOrder, IRestaurants } from '../../interfaces';
import { ShoppingCartService } from '../../services';
import { APP_SHOP_ITEM_PAGE, Currency, IMG_DATA_FIELD_TOKEN, FIREBASE_DB_TOKENS } from '../pages.constants';


const { MENUS } = FIREBASE_DB_TOKENS;

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html'
})
export class MenuPage  {

  @ViewChild(Header) private _header: Header;

  currency = Currency;
  RestaurantData: IRestaurants;
  ShopMenu: IMenuType[] | null;
  
  backgroundImage: string;

  listContainerHeight: number;
  listWrapperHeight: number;

  private _isShopClosed: boolean;
  private _shopMenuSub: Subscription;
  private _screenOrientationSub: Subscription;
  private _pageTransitionLock: boolean;

  constructor(private readonly _platform: Platform,
              private readonly _navCtrl: NavController,
              private readonly _shoppingCartService: ShoppingCartService,
              private readonly _tabs: Tabs,
                              screenOrientation: ScreenOrientation,
                              navParams: NavParams, 
                              afDb: AngularFirestore) {
 
    this.RestaurantData = navParams.data;
    this.backgroundImage = `url(${this.RestaurantData[IMG_DATA_FIELD_TOKEN]})`;                          
    
    const menuDoc = afDb.doc<TShnopMenus>(`${MENUS}/${this.RestaurantData.id}`);
    this._shopMenuSub = menuDoc.valueChanges()
                                .subscribe((shopMenus: TShnopMenus) => 
                                  this.ShopMenu = shopMenus ? shopMenus.shop_menus : null
                                );
    this._screenOrientationSub = screenOrientation.onChange()
                                            .pipe(delay(300))
                                            .subscribe(() => 
                                              this._setHeight()
                                            );
  }

  ionViewWillEnter() {
    delete this._pageTransitionLock;
  }

  ionViewWillUnload() {
    this._shopMenuSub.unsubscribe();
    this._screenOrientationSub.unsubscribe();
    this._shopMenuSub = this._screenOrientationSub = undefined;
  }

  ionViewDidEnter() {
    this._setHeight();
  }

  get workingTime() {

    const { workingTime } = this.RestaurantData;

    if (Array.isArray(workingTime)) {

      if (!workingTime[1]) {

        return `Open ${workingTime[0]} hours`;

      } 
      
      const nowUserTime = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).split(' ');

      const closedShopTime = workingTime[1].split(' ');
      const [ hoursUserTime, minutesUserTime ] = nowUserTime[0].split(':');
      const [ closedHoursShopTime, closedMinutesShopTime ] = closedShopTime[0].split(':');
      
      if ( parseInt(hoursUserTime) < parseInt(closedHoursShopTime)) {

        return `Closes ${workingTime[1]}`;

      }else if ( parseInt(hoursUserTime) == parseInt(closedHoursShopTime) ) {

        if ( closedMinutesShopTime ) {

          if ( parseInt(minutesUserTime) < parseInt(closedMinutesShopTime) ) {

            return `Closes ${workingTime[1]}`;

          }
        }
      }

      this._isShopClosed = true;

      return `Closed opens ${workingTime[0]}`;
    }

  }

  get isCanOrder() {

    return this.RestaurantData.takeaway && !this._isShopClosed;

  }

  onTapItem({ target }: any, menuItem: IMenuItem, menuType:IMenuType) {

    if (this._pageTransitionLock) return;
    
    const order: IOrder = this._compileDataIntoFutureOrder(menuItem, menuType);
    
    if (target.closest('.btn-addToCart')) {

      this._shoppingCartService.addToCart(order);

    }else {

      this._pageTransitionLock = true;
      this._navCtrl.push(APP_SHOP_ITEM_PAGE, order);

    }
                        

  }

  private _compileDataIntoFutureOrder(menuItem: IMenuItem, { type, subhead }:IMenuType): IOrder {

    const { id, name: entityName, collection } = this.RestaurantData;

    return {
      id, entityName, collection,
      menu: {
        type, subhead, userNotes: '', quantity: 1, item: menuItem
      }
    };
  }

  private _setHeight() {

    this.listContainerHeight = this._listContainerHeight();
    this.listWrapperHeight = this._listWrapperHeight();

  }

  private _listContainerHeight() {
    
    const width = this._platform.width();
    const height = this._platform.height();
    
    return (this._platform.isPortrait() ? Math.max(height, width) : Math.min(height, width)) - (this._headerHeight + this._tabbarHeight);

  }

  private _listWrapperHeight() {
  
    return this.listContainerHeight - (this._headerHeight + this._tabbarHeight);
  
  }

  private get _tabbarHeight() {

    const tabbarEl: HTMLElement | void = this._tabs._tabbar.nativeElement;
    return tabbarEl ? tabbarEl.offsetHeight : 1;

  }

  private get _headerHeight() {

    const headerEl: HTMLElement | void = this._header.getNativeElement();

    return headerEl ? headerEl.offsetHeight : 56;

  }

}

type TShnopMenus = { shop_menus: IMenuType[] };