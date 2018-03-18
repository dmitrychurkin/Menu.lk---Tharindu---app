import { Component, Injector, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { APP_SHOP_PAGE } from '../pages.constants';

import Base from '../page.base.class';


/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage extends Base /*implements AfterViewInit, AfterViewChecked*/ {
  protected readonly _pageName = APP_SHOP_PAGE;
  // shops = [];
  // 
  // private _isImagesReady: (value?: true | PromiseLike<true>) => void;
  constructor(
    //public app: App, 
    //public preloader: PreloaderProvider,
    //public imagesLoader: ImageLoaderProvider
    injector: Injector
  ) { 
    super(injector, { url: 'mainMenu' }, /*(mainMenu: any) => this.shops.push(...mainMenu)*/undefined, true); 
    
}
  /*ngAfterViewInit() {
    new Promise((resolve: any) => this._isImagesReady = resolve)
      .then(() => this._content.imgsUpdate());
  }
  ngAfterViewChecked() {
    let { _content, shops, _isImagesReady } = this;
    if (shops && _content._imgs.length == shops.length) {
        _isImagesReady(true);
    }
  }*/
  //scrollHandler(e: any) {
    //this._content.imgsUpdate();
  //}

  /*ngOnInit() {
    this.resourceResult = 
            this.getShops()
                .then((mainMenu: any) => this.shops = mainMenu);
  }
  ngAfterViewInit() {
    this.resourceResult
        .then((shops: any) => {
          this.imagesLoader.loadImages( this._extractImagesHelper(shops), this.imgsContainers ) 
        })
        // .catch();
  }*/
  //ionViewDidLoad() {
    //console.log('ionViewDidLoad HomePage');
  //}
  //onSelect(e, shopProps) {
    //this.app.getRootNav().push(APP_SHOP_PAGE, shopProps);
 // }
  /*getShops() {
    return this.preloader.startLoad(() => 
        mockBackendCall( () => {
          console.log('Fake api call has made!');
          return Promise.resolve(mainMenu);
        } ) 
    );
  }*/
  /*_extractImagesHelper(shops: Array<any>) {
    return shops.map(({ imageUrl }) => imageUrl);
  }*/
}
