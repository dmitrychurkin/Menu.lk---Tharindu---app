import { Injector, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { Content, InfiniteScroll, Loading, LoadingController, Segment, SegmentButton } from "ionic-angular";
import { asap } from "rxjs/Scheduler/asap";
import { IFetcherArgs, RootDataReceiverService } from "../services";
import { StateDataStoreEntity } from "./data-state-store.class";

export class PageBaseClass<S extends SegmentOptions<string>, T> {

  @ViewChild(Content) readonly content: Content;
  @ViewChildren(SegmentButton) readonly segmentButtons: QueryList<SegmentButton>;

  readonly CONFIG: IFetcherArgs<T>;
  currentSegmentValue: S;
  readonly DataStore: Map<S, StateDataStoreEntity<T>> = new Map();
  readonly sortingFn: (reverseOrderFlag?: boolean) => (a: T, b: T) => number;

  isSegmentDisabled = false;
  protected readonly _loadingCtrl = this._injector.get(LoadingController);
  protected readonly _dataReceiverService = this._injector.get(RootDataReceiverService);
  private readonly _pageConfig: IFetcherArgs<T>;

  constructor(private readonly _injector: Injector, config?: IFetcherArgs<T>) {
    
    this._pageConfig = config || this.CONFIG;

  }

  get dataStore() {

    let res = this.DataStore.get(this.currentSegmentValue);
    
    if (!res) {

      res = this.DataStore
        .set(this.currentSegmentValue , new StateDataStoreEntity<T>({ identificator: this.currentSegmentValue, batchSize: this._pageConfig.batchSize, defaultAction: this.actionFetchDone(this._pageConfig.onQueryComplete) }))
        .get(this.currentSegmentValue);

    }

    return res;

  }


  actionFetchDone(fn?: () => void, infinityScroll?: InfiniteScroll | void, sortingFn?: (reverseFlag?: boolean) => (a: T, b: T) => number) {

    let loader: Loading;
    
    const data = this.DataStore.get(this.currentSegmentValue);
    
    if (data) {

      data.dataRequestSent = true;

      if (!data.isEntityBeenInialized) {

        loader = this._loadingCtrl.create({ content: 'Please wait' })
        loader.onDidDismiss(() => loader = undefined);
        loader.present();

        data.initialize();

      }

    }
    
    return (...args: Array<any>) => {
   
      this.dataStore.dataRequestSent = false;
      
      if (this._pageConfig.mode === 'list' && !this.dataStore.isInfinityScrollSuspended) {
        
        this.dataStore.isInfinityScrollSuspended = this.dataStore.itemCollection.length == this.dataStore._queryDocumentSnapshot.length;

      }


      if (loader) {

        loader.dismiss().catch(_ => {});

      }

      if (infinityScroll) {

        infinityScroll.complete();

        if (this._isInfinityScrollCanDisable) {

          infinityScroll.enable(false);

        }

        infinityScroll = undefined;

      }

      if (typeof fn === 'function') {
        
        fn();

      }



      if (typeof sortingFn !== 'function') {
        
        sortingFn = this.sortingFn || this.dataStore.sortingFn;

      }
      
      (this._pageConfig.mode === 'list' && args.length == 1 ? args[0] : this.dataStore).itemCollection.sort( sortingFn(!this.dataStore.isCollectionReversed) );
      
      this.dataStore.isDataBeenRequested = true; // only for history orders page to show No Orders template
      
    };

  }

  onSegmentChange(segment: Segment, collection?: S) {
    
    if (!this.content) return;

    this.dataStore.scrollPosition = this.content.scrollTop;
    this.currentSegmentValue = segment.value as S;

    const scrollerFn = () => {

      if (!this.dataStore.scrollPosition) {

        this.isSegmentDisabled = false;

      }

      this.content.scrollTo(0, this.dataStore.scrollPosition, 300).then(() => asap.schedule(() => this.isSegmentDisabled = false, 100));

    };

    this.isSegmentDisabled = true;
    
    if (!this.dataStore.itemCollection.length && !this.dataStore.isInfinityScrollSuspended) {
      
      const actionsCb = this.actionFetchDone(scrollerFn);
      const collectionObj = { collection: collection || this.currentSegmentValue };
      this._dataReceiverService.emitFetch({
        ...this._pageConfig, ...collectionObj, ...{
          
          resourceObject: this.dataStore,
          onQueryComplete: (...args: Array<any>) =>
            this.dataStore.itemCollection.length
              ? actionsCb(...args)
              : this.dataStore.subject$.next({ onQueryComplete: actionsCb })
        }
      });

    } else {

      scrollerFn();

    }

  }

  onInfinityScroll(infinityScroll: InfiniteScroll) {

    if (this._isInfinityScrollCanDisable) {

      return infinityScroll.enable(false);

    }

    if (this.dataStore.isInfinityScrollSuspended) {

      return infinityScroll.complete();

    }

    this.isSegmentDisabled = true;

    asap.schedule(() => this.dataStore.subject$.next({
      onQueryComplete: this.actionFetchDone(() => this.isSegmentDisabled = false, infinityScroll)
    }), this._pageConfig.mode === 'list' ? 1000 : 0);

  }

  clearDataStates(condition: (val: S) => boolean) {

    this.segmentButtons.forEach(({ value }: SegmentButton) => {
      const v = value as S;
      const dataStore = this.DataStore.get(v);
      dataStore && dataStore.uninitialize(condition(v));
                    
    });

  }

  ionViewDidLoad() {

    this._dataReceiverService.emitFetch({ ...this._pageConfig, ...{ resourceObject: this.dataStore, onQueryComplete: this.actionFetchDone() } });
  
  }

  private get _isInfinityScrollCanDisable() {

    return !this.segmentButtons.some(({ value }: SegmentButton) => {
      const entity = this.DataStore.get(value as S);
      if (!entity) {

        return false;

      }
      return !entity.isInfinityScrollSuspended;
    });

  }

}


type SegmentOptions<T extends string> = T;
