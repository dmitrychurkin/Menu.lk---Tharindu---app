# Ionic V.3.20.0 Menu.lk Application

This is the Ionic shopping app, created by the request of my friend Tharindu de Soysa from Sri Lanka.

## Important!
**App primarily been developed for Android** 
Due to lack of time I decided to build app on top of Firebase backend.

**ionic-angular npm module has 2 following bugs. In order to fix them please amend as this files**
Module "PLATFORM" -> File "platform.js"
line 607 -> Body of function onTransitionEnd must to be wrapped in try-catch block to avoid exeption, see exaple below:
```javascript
function onTransitionEnd(ev) {

  try {

    if (el === ev.target) {

      unregister();
      callback(ev);

    }

  }catch(e) {}

}
```
Module "COMPONENTS/INFINITE-SCROLL" -> File "infinite-scroll.js"
line 224 -> Body of function InfiniteScroll.prototype._onScroll must to be wrapped in try-catch block to avoid exeption, see exaple below:
```javascript
InfiniteScroll.prototype._onScroll = function (ev) {

  try {

    var _this = this;
    if (this.state === STATE_LOADING || this.state === STATE_DISABLED) {
      return 1;
    }
    if (this._lastCheck + 32 > ev.timeStamp) {
      // no need to check less than every XXms
      return 2;
    }
    this._lastCheck = ev.timeStamp;
    // ******** DOM READ ****************
    var infiniteHeight = this._elementRef.nativeElement.scrollHeight;
    if (!infiniteHeight) {
      // if there is no height of this element then do nothing
      return 3;
    }
    // ******** DOM READ ****************
    var d = this._content.getContentDimensions();
    var height = d.contentHeight;
    var threshold = this._thrPc ? (height * this._thrPc) : this._thrPx;
    // ******** DOM READS ABOVE / DOM WRITES BELOW ****************
    var distanceFromInfinite;
    if (this._position === POSITION_BOTTOM) {
      distanceFromInfinite = d.scrollHeight - infiniteHeight - d.scrollTop - height - threshold;
    }
    else {
      (void 0) /* assert */;
      distanceFromInfinite = d.scrollTop - infiniteHeight - threshold;
    }
    if (distanceFromInfinite < 0) {
    // ******** DOM WRITE ****************
    this._dom.write(function () {
      _this._zone.run(function () {
          if (_this.state !== STATE_LOADING && _this.state !== STATE_DISABLED) {
            _this.state = STATE_LOADING;
            _this.ionInfinite.emit(_this);
          }
      });
    });
      return 5;
    }
      return 6;
  }catch(e) {}
};
```
**plugins/cordova-universal-links-plugin in order to work properly with android ~7.0.0 requires to make following changes**
File "hooks/lib/android/manifestWriter.js"
line 21 -> Need substitute 
```javascript
  var pathToManifest = path.join(cordovaContext.opts.projectRoot, 'platforms', 'android', 'AndroidManifest.xml');
```
with 
```javascript
  var pathToManifest = path.join(cordovaContext.opts.projectRoot, 'platforms', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
```

