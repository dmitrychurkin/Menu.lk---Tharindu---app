import { Component, ViewChild, ElementRef, Injector, AfterViewInit } from "@angular/core";
import { IonicPage } from "ionic-angular";

import { Currency, APP_ITEM_PAGE } from "../../pages.constants";
import Base from "../../page.base.class";
import { ShoppingCart } from "../../../providers";


@IonicPage()
@Component({
  selector: 'page-shop',
  templateUrl: 'shop.html'
})
export class ShopPage extends Base implements AfterViewInit {
  //@ViewChild('listContainer') listContElem: ElementRef;
  protected readonly _pageName = APP_ITEM_PAGE;
  @ViewChild('header') headerElem: ElementRef;
  private _headerHeight: number;
  //@ViewChild('listHeader') listHeader: ElementRef;

  backgroundImage: string;

  // menus: Array<any>;

  currency = Currency;

  constructor(injector: Injector, public cart: ShoppingCart) { 
    super(injector,  { url: 'shopMenus' }, /*(shopMenus: any) => this.menus = shopMenus*/ undefined, true); 
  }
  ngAfterViewInit() {
    this._headerHeight = this.headerElem.nativeElement.offsetHeight;
    super.ngAfterViewInit();
  }
  get listContHeight() {
    const { innerHeight, innerWidth, matchMedia } = window;
    if ( matchMedia('(orientation: portrait)').matches ) {
      return Math.max(innerHeight, innerWidth) - this._headerHeight;
    }
    return Math.min(innerHeight, innerWidth) - this._headerHeight;
  }

  get listWrapHeight() {
    return this.listContHeight - this._headerHeight - 50;
  }
  /*ngOnInit() {
    this.resourceResult = 
            this.getMenus()
                .then((shopMenus: any) => this.menus = shopMenus);
  }
  ngAfterViewInit() {
    this.resourceResult
        .then((menus: any) => this.imagesLoader.loadImages( this._extractImagesHelper(menus), this.imgsContainers ))
        // .catch();
  }*/
  ionViewDidLoad() {
    this.backgroundImage = `url(${this.navParams.get('imageUrl')})`;
  }
  //onSelect(e, itemProps) {
    //this.app.getRootNav().push(APP_ITEM_PAGE, itemProps);
  //}
  /*getMenus() {
    let testFlag = false;
    return this.preloadProvider.startLoad(() => mockBackendCall(() => {
      console.log('Fake api call has made!');
      return Promise.resolve(testFlag ? (shopMenus[this.navParams.get('name')] || []) : []);
    }, testFlag));
  }*/
}