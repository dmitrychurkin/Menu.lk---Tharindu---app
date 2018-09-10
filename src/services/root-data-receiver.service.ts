import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference, DocumentChangeAction, DocumentChangeType, DocumentSnapshot, Query, QueryDocumentSnapshot, QuerySnapshot } from 'angularfire2/firestore';
import { pipe } from 'rxjs';
import { from } from 'rxjs/observable/from';
import { of } from 'rxjs/observable/of';
import { map, reduce, share, skip, switchMap, take, tap } from 'rxjs/operators';
import { DataWithId, IStateDataStoreEntity } from '../pages/data-state-store.class';
import { ToastMessangerService } from './toast-messanger.service';
import { MessangingService } from './messaging-registry.service';
import { Platform } from 'ionic-angular';


@Injectable()
export class RootDataReceiverService<T> {

  private _isServiceUsed = false;

  private readonly _defaultErrorHandler = (err: Error) => this._toastMessService.showToast({ message: this._platform.is('cordova') ? this._messService.getMessage('appError') : (err && err.message) });
  private readonly _observer: any = {
    error: this._defaultErrorHandler
  };

  constructor(
    private readonly _afDb: AngularFirestore,
    private readonly _messService: MessangingService,
    private readonly _platform: Platform,
    private readonly _toastMessService: ToastMessangerService) {}

  decodeDataSnapshot(doc: QueryDocumentSnapshot<T>): DataWithId<T> {

    const id = doc.id;
    const data = doc.data() as T;

    return Object.assign(data, { id }) as DataWithId<T>;

  }

  emitFetch(fetcherArgs: IFetcherArgs<T>) {

    const executorFn$: any = ({
      type = 'added',
      actionsData,
      resourceObject = fetcherArgs.resourceObject,
      batchSize = resourceObject.batchSize,
      onQueryComplete = resourceObject.defaultAction }: ISubjectArgs<T>) => {

      switch (type) {

        case 'added':
          return pipe(
            skip(Array.isArray(actionsData) ? 0 : resourceObject.itemCollection.length),
            take(batchSize),
            map(this.decodeDataSnapshot),
            reduce((acc: Array<DataWithId<T>>, value: DataWithId<T>) => (acc.push(value), acc), resourceObject.itemCollection),
            tap(() => typeof onQueryComplete === 'function' && onQueryComplete(resourceObject as any))
          );

        case 'removed':
          return pipe(
            tap(({ id }: QueryDocumentSnapshot<T>) => {

              let isWasSuspended = resourceObject.isInfinityScrollSuspended;

              resourceObject.isInfinityScrollSuspended = true;

              for (let i = 0; i < resourceObject.itemCollection.length; i++) {

                if (resourceObject.itemCollection[i].id === id) {

                  resourceObject.itemCollection.splice(i, 1);

                  if (resourceObject.itemCollection.length < batchSize) {

                    resourceObject.subject$.next({ type: 'added', batchSize: 1, onQueryComplete: _ => { resourceObject.isInfinityScrollSuspended = isWasSuspended; typeof onQueryComplete === 'function' && onQueryComplete(resourceObject as any) } });
                 
                  }
                  
                  break;

                }

              }

            })
          );

        case 'modified':
          return pipe(
            tap((d: QueryDocumentSnapshot<T>) => {

              const order = resourceObject.itemCollection.find(({ id }: DataWithId<T>) => id === d.id);
              
              if (order) {

                Object.assign(order, this.decodeDataSnapshot(d));
              
              }

            })
          );

      }

    };

    const { resourceObject, mode, batchSize: mainBatchSize= resourceObject.batchSize, collection, queryFn= (ref: CollectionReference) => ref, onQueryComplete= resourceObject.defaultAction } = fetcherArgs;
    
    resourceObject.subscriptionStorage.subject.push(
      resourceObject.subject$
        .pipe(
          switchMap((subjectArgs: ISubjectArgs<T>) => {
            
            const {
              actionsData = resourceObject._queryDocumentSnapshot,
              onQueryComplete= resourceObject.defaultAction,
              batchSize = resourceObject.batchSize } = subjectArgs;
              
            if (mode === 'list') {

              return from(actionsData)
                .pipe(
                  executorFn$(subjectArgs)
                );
            }
            
            const result$ = this._afDb.collection<T>(collection, (ref: CollectionReference) => resourceObject.itemCollection.length ? queryFn(ref).startAfter(resourceObject.lastViewedDocumentKey).limit(batchSize) : queryFn(ref).limit(batchSize))
                          .stateChanges(['added', 'modified'])
                          .pipe(
                            
                            switchMap((actions: DocumentChangeAction<T>[]) => {
                              
                              if (actions.every(({ type }: DocumentChangeAction<T>) => type === 'added')) {
                                
                                if (!resourceObject.dataRequestSent || 
                                  (actions.length == 1 && 
                                  resourceObject.itemCollection.find(({ id }: DataWithId<T>) => id === actions[0].payload.doc.id))) return of(null);

                                const lastViewedDocument = actions.slice(-1)[0].payload.doc as DocumentSnapshot<T>;
                                resourceObject.lastViewedDocumentKey = lastViewedDocument;
                                const nextDocumentSnapshotPromise = this._afDb.firestore.collection(collection).startAfter(lastViewedDocument).limit(1).get();
                                return from(nextDocumentSnapshotPromise)
                                        .pipe(
                                          map((documentSnapshot: QuerySnapshot<T>) => {
                                            
                                            resourceObject.isInfinityScrollSuspended = documentSnapshot.empty;

                                            for (const { payload: { doc } } of actions) {

                                              resourceObject.itemCollection.push( this.decodeDataSnapshot(doc) );
              
                                            }
                                            
                                            return actions;

                                          }),
                                          tap(onQueryComplete)
                                        );
                                  

                              } else if (actions.every(({ type }: DocumentChangeAction<T>) => type === 'modified')) {

                                for (const { payload: { doc } } of actions) {

                                  Object.assign(resourceObject.itemCollection.find(({ id }: DataWithId<T>) => id === doc.id), doc.data(), { id: doc.id });

                                  return of(actions);

                                }

                              }

                              return of(null);

                            }),
                            share()
                          );

            resourceObject.subscriptionStorage.databaseSnapshots.push(result$.subscribe(this._observer));
            return result$;

          })
        ).subscribe(this._observer)
    );

    if (mode === 'slice') {

      return resourceObject.subject$.next(fetcherArgs);

    }

    resourceObject.subscriptionStorage.databaseSnapshots.push(
      this._afDb.collection<T>(collection, queryFn)
        .stateChanges()
        .pipe(
          tap((actions: DocumentChangeAction<T>[]) => {

            actions.map((action: DocumentChangeAction<T>) => {

              const { type, payload: { doc } } = action;
              const id = doc.id;
              
              switch (type) {

                case 'added': 
                  resourceObject._queryDocumentSnapshot.unshift(doc);
                
                  break;
                
                case 'removed': 
                  for (let i = 0; i < resourceObject._queryDocumentSnapshot.length; i++) {
                    
                    if (resourceObject._queryDocumentSnapshot[i].id === id) {

                      resourceObject._queryDocumentSnapshot.splice(i, 1);
                      
                      break;

                    }

                  }
                  break;

                case 'modified': {

                  const index = resourceObject._queryDocumentSnapshot.findIndex(({ id }: QueryDocumentSnapshot<T>) => id === doc.id);
                  
                  resourceObject._queryDocumentSnapshot[index] = doc;

                  break;
                }

              }

            });
             

            if (resourceObject.isEntityBeenInialized && actions.length) {

              resourceObject.subject$.next({ type: actions[0].type, actionsData: actions.length > mainBatchSize ? undefined : actions.map(({ payload: { doc } }: DocumentChangeAction<T>) => doc) });

            }

          })
        )
        .subscribe({
          next: (data: DocumentChangeAction<T>[]) => {

            onQueryComplete(data, resourceObject, this._isServiceUsed);
            this._isServiceUsed = true;
          },
          error: this._defaultErrorHandler
        })
    );

  }

}

export interface ISubjectArgs<T> extends IFetcherArgs<T> {
  readonly actionsData?: QueryDocumentSnapshot<T>[];
  readonly type?: DocumentChangeType;
}

export interface IFetcherArgs<T> {
  readonly collection?: string;
  readonly queryFn?: (ref: CollectionReference) => Query;
  readonly mode?: Mode;
  readonly resourceObject?: IStateDataStoreEntity<T>;
  readonly batchSize?: number;
  readonly onQueryComplete?: (data?: DocumentChangeAction<T>[], resourceObject?: IStateDataStoreEntity<T>, isInit?: boolean) => void;
}

type Mode = 'list' | 'slice';