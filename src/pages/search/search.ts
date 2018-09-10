import { Component } from '@angular/core';
import { AngularFirestore, CollectionReference } from 'angularfire2/firestore';
import { IonicPage } from 'ionic-angular';
import { combineLatest, Subscription, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, filter } from 'rxjs/operators';
import { IRestaurants } from '../../interfaces';
import { FIREBASE_DB_TOKENS, TemplateViewStates } from '../pages.constants';
import { NetworkService, MessangingService } from '../../services';

const { RESTAURANTS, CATERING } = FIREBASE_DB_TOKENS;


@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  States = TemplateViewStates;
  currentState: TemplateViewStates;
  cursorCleaner: string;
  currentItems = [];
  searchQuery$ = new Subject<string>();
  model = '';
  private _sub: Subscription;


  constructor(
    private readonly _angularFirebase: AngularFirestore,
            readonly messService: MessangingService, 
            readonly networkService: NetworkService) {}


  onInput(ev) {

    let val = ev.target.value;

    if (!val || !val.trim() || !this.networkService.isOnline) return;
    
    this.currentItems.length = 0;
    this.currentState = TemplateViewStates.RequestSent;
    this.searchQuery$.next(val);

  }

  ionViewWillEnter() {
    
    this.currentState = TemplateViewStates.None;
    this.currentItems.length = 0;
    this.model = '';

  }

  ionViewWillLeave() {

    this.cursorCleaner = Date.now().toString();
    this.searchQuery$.next(this.cursorCleaner);
    
    this.ionViewWillEnter();

  }

  ionViewDidLoad() {

    const queryFn = (text: string) => (ref: CollectionReference) => ref.orderBy('name').startAt(text).endAt(text + '\uf8ff');

    this._sub = this.searchQuery$.pipe(
      map((text: string) => text.trim().toLowerCase()),
      filter((text: string) => !!text),
      distinctUntilChanged(),
      switchMap((text: string) => combineLatest(
        this._angularFirebase.collection(RESTAURANTS, queryFn(text)).valueChanges(),
        this._angularFirebase.collection(CATERING, queryFn(text)).valueChanges()
      )),
      map(([res, cat]) => res.concat(cat).sort((itemA: IRestaurants, itemB: IRestaurants) => itemA.name > itemB.name ? 1 : itemA.name < itemB.name ? -1 : 0))
    ).subscribe((result: Array<IRestaurants>) => {
      
      this.currentItems = result;

      if (!result.length) {

        this.currentState = this.cursorCleaner ? TemplateViewStates.None : TemplateViewStates.ResponseEmpty;

      }else {

        this.currentState = TemplateViewStates.None;

      }

      delete this.cursorCleaner;

    });

  }

  ionViewDidUnload() {

    this._sub.unsubscribe();

  }

}
