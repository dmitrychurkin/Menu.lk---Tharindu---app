import { Component, Injector } from '@angular/core';
import { InfiniteScroll, IonicPage } from 'ionic-angular';
import { asap } from 'rxjs/scheduler/asap';
import { IPageConfig, IRestaurants } from '../../interfaces';
import Base from '../page.base.class';
import { /*APP_EV,*/ APP_SHOP_PAGE } from '../pages.constants';



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
export class HomePage extends Base {
  
  pageConfig: IPageConfig = {
      fireConfig: {
        scope: 'restaurants',
        batchSize: 5,
        childRef: 'rating'
      },
      withPreloader: true,
      job: this._pageJob
  }
  // foodType = 'restaurants';
  //Restaurants = new ListEntity;
  //Caterings = new ListEntity;
  
  ionSegmentActivated = false;
  PageDataStore = new Map<string, ListEntity>();
  private readonly _pageName = APP_SHOP_PAGE;

  // protected _toggleHanOdlerRef$: Function = this._reverseListHandler$();

  constructor(injector: Injector) { 
    super(injector);
    this.initRequest(this.pageConfig); 
  }
  onSelect(Entity: IRestaurants) {
    //this._navigateFromRoot(this._pageName, Entity);
    this.app.getRootNav().push(this._pageName, Entity);
  }
  /*private _reverseListHandler$() {
    
    return (event: boolean) => {
      
      const Entity = this.PageDataStore.get(this.pageConfig.fireConfig.scope);
      
      Entity.isReversed = event;
      this.sortList(event, Entity.items);
    }
  }*/
  toggleSort($event: boolean) {
    const Entity = this.PageDataStore.get(this.pageConfig.fireConfig.scope);
    Entity.isReversed = $event;
    this._sortList($event, Entity.items);
  }
  private _sortList(isReversed: boolean, entityCollection: Array<IRestaurants>) {
    asap.schedule(() => this.imagesLoader.updateImgs());
    const sortingFn = (reversed= false) => (a: IRestaurants, b: IRestaurants) => reversed ? b.rating - a.rating : a.rating - b.rating;

    return entityCollection.sort(sortingFn(isReversed));
  }
  onIonSegmentSelect(e: string) {

    if (this._content.isScrolling || this.ionSegmentActivated) {
      return;
    }
    const lambda = (scope: string) => {
      const delay = 300;
      const Entity = this.PageDataStore.get(scope);
      this._content.scrollTo(0, Entity.scrollPos).then(() => asap.schedule( () => this.ionSegmentActivated = !this.ionSegmentActivated, delay));

      this.imagesLoader.updateImgs();
    };

    this.ionSegmentActivated = true;
    // remember previous position;
    const previousScope = this.pageConfig.fireConfig.scope;
    this.PageDataStore.get(previousScope).scrollPos = this._content.scrollTop;

    this.pageConfig.fireConfig.scope = e;

    // scrolling to position
    if (!this.PageDataStore.get(e)) {
      return this.getResource(this.pageConfig).then(() => lambda(e));
    }
    return lambda(e);
  }
  private _pageJob(resultSet: IRestaurants[]) {
    try {
      console.log("DEBUG FROM _pageJob resultSet => ",resultSet );
      // const sortItemsFn = (a: any, b: any) => a[sortingProp] - b[sortingProp];

      const scope = this.pageConfig.fireConfig.scope;
      
      let Entity = this.PageDataStore.get(scope);
      if ( !(Entity instanceof ListEntity) ) {
        Entity = this.PageDataStore.set(scope, new ListEntity(scope)).get(scope);
      }
 

      if (resultSet.length == 0) {
        Entity.isFinished = true;
        return;
      }

      Entity.lastKey  = resultSet.slice(-1)[0]._id;

      const newSet =  (resultSet.length < this.pageConfig.fireConfig.batchSize) ? resultSet.slice(0) : resultSet.slice(0, resultSet.length - 1);
      
      Entity.items.push(...newSet);

        console.log("DEBUG FROM _defaultJob LASTKEY => ", Entity.lastKey);
        
        
        console.log("DEBUG FROM this.resultSet => ", Entity.items);

      if (Entity.lastKey === Entity.items.slice(-1)[0]._id) {
        Entity.isFinished = true;
      }
      console.log("PageDataStore.get(pageConfig.fireConfig.scope)?.items => ", this.PageDataStore.get(this.pageConfig.fireConfig.scope).items);
      return this._sortList(Entity.isReversed, Entity.items);

    } catch(err) {
      console.log("FUCKING ERROR => err", err)
    }
  }
  
  /*private _setLastKey(lastKey: string) {
    // const ctr: any = this.constructor;
    //this.PageDataStore.get(this.foodType).lastKey = lastKey;
    if (typeof this.pageConfig.fireConfig === 'object') {
      this.pageConfig.fireConfig.lastKey = lastKey;//this.lastKey;
    }else {
    //if (typeof this.pageConfig.httpConfig === 'object') {
      this.pageConfig.httpConfig.lastKey = lastKey;//this.lastKey;
    }
  }
  private _getLastKey() {
    if (typeof this.pageConfig.fireConfig === 'object') {
      return this.pageConfig.fireConfig.lastKey;
    }
    return this.pageConfig.httpConfig.lastKey;
  }*/
  loadFromInfinityScroll(infiniteScroll: InfiniteScroll) {
    
    const Entity = this.PageDataStore.get(this.pageConfig.fireConfig.scope);

    if (Entity.isFinished) {
      infiniteScroll.complete();
      return;
    }
    
    const { fireConfig: { scope, batchSize, childRef }, job } = this.pageConfig;
    const pageConfig: IPageConfig = {
      fireConfig: { scope, batchSize, childRef, lastKey: Entity.lastKey },
      withPreloader: false,
      job
    };
    this.getResource( pageConfig )
        .then( () => infiniteScroll.complete());
  }

  
}

class ListEntity {
  items: Array<IRestaurants> = [];
  isReversed = false;
  isFinished = false;
  scrollPos = 0;
  lastKey: string;

  constructor(public scopeValue: string) {}
}