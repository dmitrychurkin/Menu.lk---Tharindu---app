import { DocumentSnapshot, QueryDocumentSnapshot } from "angularfire2/firestore";
import { Subject, Subscription } from "rxjs";
import { ISubjectArgs } from "../services";
import { BATCH_SIZE } from "./pages.constants";

export class StateDataStoreEntity<T> implements IStateDataStoreEntity<T> {

  readonly identificator: string;
  readonly batchSize: number;
  defaultAction?: (...a: Array<any>) => void;
  sortingFn?: (reverseOrderFlag?: boolean) => (a: T, b: T) => number;
  subject$ = new Subject<ISubjectArgs<T>>();
  itemCollection: Array<T> = [];
  dataRequestSent = false;
  isCollectionReversed = false;
  isInfinityScrollSuspended = false;
  isDataBeenRequested = false; // -> only for template to show that there no orders
  scrollPosition = 0;
  lastViewedDocumentKey: any;
  subscriptionStorage = {
    subject: [],
    databaseSnapshots: []
  };
  _queryDocumentSnapshot: Array<QueryDocumentSnapshot<T>> = [];
  private _isEntityBeenInialized = false;

  constructor({ identificator, batchSize = BATCH_SIZE, defaultAction, sortingFn }: IStateDataStoreEntitySettingsArgs<T>) {
    
    this.identificator = identificator;
    this.batchSize = batchSize;

    if (typeof defaultAction === 'function') {

      this.defaultAction = defaultAction;

    }

    if (typeof sortingFn === 'function') {

      this.sortingFn = sortingFn;

    }

  }

  get isEntityBeenInialized() {
    return this._isEntityBeenInialized;
  }
  initialize() {
    if (this.isEntityBeenInialized) return;
    this._isEntityBeenInialized = !this._isEntityBeenInialized;
  }

  //implementation pending

  uninitialize(clearSubscriptions= false) {
  
    this.lastViewedDocumentKey = undefined;
    this.isCollectionReversed =
    this.dataRequestSent =
    this.isInfinityScrollSuspended = 
    this.isDataBeenRequested = 
    this._isEntityBeenInialized = false;
    this.scrollPosition = this.itemCollection.length = 0;

    if (clearSubscriptions) {

      for (const field in this.subscriptionStorage) {

        const objectWithSub = this.subscriptionStorage[field];
        objectWithSub.forEach((sub: Subscription) => sub.unsubscribe());
        objectWithSub.length = 0;

      }
      this._queryDocumentSnapshot.length = 0;
      // this.subject$.unsubscribe();

    }
  }
}

export interface IStateDataStoreEntity<T> {
  readonly subject$: Subject<ISubjectArgs<T>>
  readonly itemCollection: Array<DataWithId<T>>
  isEntityBeenInialized: boolean
  isCollectionReversed: boolean
  isInfinityScrollSuspended: boolean
  scrollPosition: number
  lastViewedDocumentKey: DocumentSnapshot<T>
  dataRequestSent: boolean
  readonly subscriptionStorage: {
    readonly subject: Array<Subscription>
    readonly databaseSnapshots: Array<Subscription>
  }
  readonly _queryDocumentSnapshot: Array<QueryDocumentSnapshot<T>>
  readonly identificator: string
  defaultAction?: (...a: Array<any>) => void
  readonly batchSize: number;
}

export type DataWithId<T> = T & { id?: string };

interface IStateDataStoreEntitySettingsArgs<T> {
  readonly identificator: string;
  readonly batchSize?: number;
  readonly defaultAction?: (...a: Array<any>) => void;
  readonly sortingFn?: (reverseOrderFlag?: boolean) => (a: T, b: T) => number;
}