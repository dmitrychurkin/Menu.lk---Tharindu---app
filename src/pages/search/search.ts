import { Component } from '@angular/core';
import { AngularFirestore, CollectionReference } from 'angularfire2/firestore';
import { IonicPage } from 'ionic-angular';
import { combineLatest, Subscription, Subject } from 'rxjs';
import { distinctUntilChanged, map, switchMap, filter } from 'rxjs/operators';
import { IRestaurants } from '../../interfaces';
import { FIREBASE_DB_TOKENS } from '../pages.constants';

const { RESTAURANTS, CATERING } = FIREBASE_DB_TOKENS;

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  currentItems = [];
  searchQuery$ = new Subject<string>();
  model = '';
  private _sub: Subscription;


  constructor(private readonly _angularFirebase: AngularFirestore) {}


  onInput(ev) {

    let val = ev.target.value;

    if (!val || !val.trim()) return;
    
    this.searchQuery$.next(val);

  }

  ionViewWillEnter() {

    this.currentItems = [];

  }

  ionViewWillLeave() {

    this.searchQuery$.next(Date.now().toString());
    this.currentItems = [];
    this.model = '';

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
    ).subscribe((result: Array<IRestaurants>) => !result.length ? this.currentItems = null : this.currentItems = result);

  }

  ionViewDidUnload() {

    this._sub.unsubscribe();

  }

}
