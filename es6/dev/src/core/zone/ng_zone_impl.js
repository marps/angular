/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export class NgZoneError {
    constructor(error, stackTrace) {
        this.error = error;
        this.stackTrace = stackTrace;
    }
}
export class NgZoneImpl {
    constructor({ trace, onEnter, onLeave, setMicrotask, setMacrotask, onError }) {
        this.onEnter = onEnter;
        this.onLeave = onLeave;
        this.setMicrotask = setMicrotask;
        this.setMacrotask = setMacrotask;
        this.onError = onError;
        if (Zone) {
            this.outer = this.inner = Zone.current;
            if (Zone['wtfZoneSpec']) {
                this.inner = this.inner.fork(Zone['wtfZoneSpec']);
            }
            if (trace && Zone['longStackTraceZoneSpec']) {
                this.inner = this.inner.fork(Zone['longStackTraceZoneSpec']);
            }
            this.inner = this.inner.fork({
                name: 'angular',
                properties: { 'isAngularZone': true },
                onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
                    try {
                        this.onEnter();
                        return delegate.invokeTask(target, task, applyThis, applyArgs);
                    }
                    finally {
                        this.onLeave();
                    }
                },
                onInvoke: (delegate, current, target, callback, applyThis, applyArgs, source) => {
                    try {
                        this.onEnter();
                        return delegate.invoke(target, callback, applyThis, applyArgs, source);
                    }
                    finally {
                        this.onLeave();
                    }
                },
                onHasTask: (delegate, current, target, hasTaskState) => {
                    delegate.hasTask(target, hasTaskState);
                    if (current == target) {
                        // We are only interested in hasTask events which originate from our zone
                        // (A child hasTask event is not interesting to us)
                        if (hasTaskState.change == 'microTask') {
                            this.setMicrotask(hasTaskState.microTask);
                        }
                        else if (hasTaskState.change == 'macroTask') {
                            this.setMacrotask(hasTaskState.macroTask);
                        }
                    }
                },
                onHandleError: (delegate, current, target, error) => {
                    delegate.handleError(target, error);
                    this.onError(new NgZoneError(error, error.stack));
                    return false;
                }
            });
        }
        else {
            throw new Error('Angular2 needs to be run with Zone.js polyfill.');
        }
    }
    static isInAngularZone() { return Zone.current.get('isAngularZone') === true; }
    runInner(fn) { return this.inner.run(fn); }
    ;
    runInnerGuarded(fn) { return this.inner.runGuarded(fn); }
    ;
    runOuter(fn) { return this.outer.run(fn); }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfem9uZV9pbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1YNWhldlBwNC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvem9uZS9uZ196b25lX2ltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7O0dBRUc7QUFDSDtJQUNFLFlBQW1CLEtBQVUsRUFBUyxVQUFlO1FBQWxDLFVBQUssR0FBTCxLQUFLLENBQUs7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFLO0lBQUcsQ0FBQztBQUMzRCxDQUFDO0FBR0Q7SUFjRSxZQUFZLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxPQUFPLEVBT3hFO1FBQ0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7UUFDakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3ZDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFDcEQsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxLQUFL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QUFDLEVBQWEsSUFBUyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUN6RSxRQUFRLENBQUMsRUFBYSxJQUFTLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBQzdELENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Z2xvYmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFN0b3JlcyBlcnJvciBpbmZvcm1hdGlvbjsgZGVsaXZlcmVkIHZpYSBbTmdab25lLm9uRXJyb3JdIHN0cmVhbS5cbiAqL1xuZXhwb3J0IGNsYXNzIE5nWm9uZUVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVycm9yOiBhbnksIHB1YmxpYyBzdGFja1RyYWNlOiBhbnkpIHt9XG59XG5cblxuZXhwb3J0IGNsYXNzIE5nWm9uZUltcGwge1xuICBzdGF0aWMgaXNJbkFuZ3VsYXJab25lKCk6IGJvb2xlYW4geyByZXR1cm4gWm9uZS5jdXJyZW50LmdldCgnaXNBbmd1bGFyWm9uZScpID09PSB0cnVlOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIG91dGVyOiBab25lO1xuICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgaW5uZXI6IFpvbmU7XG5cbiAgcHJpdmF0ZSBvbkVudGVyOiAoKSA9PiB2b2lkO1xuICBwcml2YXRlIG9uTGVhdmU6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgc2V0TWljcm90YXNrOiAoaGFzTWljcm90YXNrczogYm9vbGVhbikgPT4gdm9pZDtcbiAgcHJpdmF0ZSBzZXRNYWNyb3Rhc2s6IChoYXNNYWNyb3Rhc2tzOiBib29sZWFuKSA9PiB2b2lkO1xuICBwcml2YXRlIG9uRXJyb3I6IChlcnJvcjogTmdab25lRXJyb3IpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3Ioe3RyYWNlLCBvbkVudGVyLCBvbkxlYXZlLCBzZXRNaWNyb3Rhc2ssIHNldE1hY3JvdGFzaywgb25FcnJvcn06IHtcbiAgICB0cmFjZTogYm9vbGVhbixcbiAgICBvbkVudGVyOiAoKSA9PiB2b2lkLFxuICAgIG9uTGVhdmU6ICgpID0+IHZvaWQsXG4gICAgc2V0TWljcm90YXNrOiAoaGFzTWljcm90YXNrczogYm9vbGVhbikgPT4gdm9pZCxcbiAgICBzZXRNYWNyb3Rhc2s6IChoYXNNYWNyb3Rhc2tzOiBib29sZWFuKSA9PiB2b2lkLFxuICAgIG9uRXJyb3I6IChlcnJvcjogTmdab25lRXJyb3IpID0+IHZvaWRcbiAgfSkge1xuICAgIHRoaXMub25FbnRlciA9IG9uRW50ZXI7XG4gICAgdGhpcy5vbkxlYXZlID0gb25MZWF2ZTtcbiAgICB0aGlzLnNldE1pY3JvdGFzayA9IHNldE1pY3JvdGFzaztcbiAgICB0aGlzLnNldE1hY3JvdGFzayA9IHNldE1hY3JvdGFzaztcbiAgICB0aGlzLm9uRXJyb3IgPSBvbkVycm9yO1xuXG4gICAgaWYgKFpvbmUpIHtcbiAgICAgIHRoaXMub3V0ZXIgPSB0aGlzLmlubmVyID0gWm9uZS5jdXJyZW50O1xuICAgICAgaWYgKFpvbmVbJ3d0ZlpvbmVTcGVjJ10pIHtcbiAgICAgICAgdGhpcy5pbm5lciA9IHRoaXMuaW5uZXIuZm9yayhab25lWyd3dGZab25lU3BlYyddKTtcbiAgICAgIH1cbiAgICAgIGlmICh0cmFjZSAmJiBab25lWydsb25nU3RhY2tUcmFjZVpvbmVTcGVjJ10pIHtcbiAgICAgICAgdGhpcy5pbm5lciA9IHRoaXMuaW5uZXIuZm9yayhab25lWydsb25nU3RhY2tUcmFjZVpvbmVTcGVjJ10pO1xuICAgICAgfVxuICAgICAgdGhpcy5pbm5lciA9IHRoaXMuaW5uZXIuZm9yayh7XG4gICAgICAgIG5hbWU6ICdhbmd1bGFyJyxcbiAgICAgICAgcHJvcGVydGllczo8YW55PnsnaXNBbmd1bGFyWm9uZSc6IHRydWV9LFxuICAgICAgICBvbkludm9rZVRhc2s6IChkZWxlZ2F0ZTogWm9uZURlbGVnYXRlLCBjdXJyZW50OiBab25lLCB0YXJnZXQ6IFpvbmUsIHRhc2s6IFRhc2ssXG4gICAgICAgICAgICAgICAgICAgICAgIGFwcGx5VGhpczogYW55LCBhcHBseUFyZ3M6IGFueSk6IGFueSA9PiB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMub25FbnRlcigpO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlLmludm9rZVRhc2sodGFyZ2V0LCB0YXNrLCBhcHBseVRoaXMsIGFwcGx5QXJncyk7XG4gICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRoaXMub25MZWF2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXG4gICAgICAgIG9uSW52b2tlOiAoZGVsZWdhdGU6IFpvbmVEZWxlZ2F0ZSwgY3VycmVudDogWm9uZSwgdGFyZ2V0OiBab25lLCBjYWxsYmFjazogRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgYXBwbHlUaGlzOiBhbnksIGFwcGx5QXJnczogYW55W10sIHNvdXJjZTogc3RyaW5nKTogYW55ID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5vbkVudGVyKCk7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGUuaW52b2tlKHRhcmdldCwgY2FsbGJhY2ssIGFwcGx5VGhpcywgYXBwbHlBcmdzLCBzb3VyY2UpO1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLm9uTGVhdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25IYXNUYXNrOlxuICAgICAgICAgICAgKGRlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnQ6IFpvbmUsIHRhcmdldDogWm9uZSwgaGFzVGFza1N0YXRlOiBIYXNUYXNrU3RhdGUpID0+IHtcbiAgICAgICAgICAgICAgZGVsZWdhdGUuaGFzVGFzayh0YXJnZXQsIGhhc1Rhc2tTdGF0ZSk7XG4gICAgICAgICAgICAgIGlmIChjdXJyZW50ID09IHRhcmdldCkge1xuICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW4gaGFzVGFzayBldmVudHMgd2hpY2ggb3JpZ2luYXRlIGZyb20gb3VyIHpvbmVcbiAgICAgICAgICAgICAgICAvLyAoQSBjaGlsZCBoYXNUYXNrIGV2ZW50IGlzIG5vdCBpbnRlcmVzdGluZyB0byB1cylcbiAgICAgICAgICAgICAgICBpZiAoaGFzVGFza1N0YXRlLmNoYW5nZSA9PSAnbWljcm9UYXNrJykge1xuICAgICAgICAgICAgICAgICAgdGhpcy5zZXRNaWNyb3Rhc2soaGFzVGFza1N0YXRlLm1pY3JvVGFzayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNUYXNrU3RhdGUuY2hhbmdlID09ICdtYWNyb1Rhc2snKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnNldE1hY3JvdGFzayhoYXNUYXNrU3RhdGUubWFjcm9UYXNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgb25IYW5kbGVFcnJvcjogKGRlbGVnYXRlOiBab25lRGVsZWdhdGUsIGN1cnJlbnQ6IFpvbmUsIHRhcmdldDogWm9uZSwgZXJyb3I6IGFueSk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBib29sZWFuID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZWdhdGUuaGFuZGxlRXJyb3IodGFyZ2V0LCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25FcnJvcihuZXcgTmdab25lRXJyb3IoZXJyb3IsIGVycm9yLnN0YWNrKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuZ3VsYXIyIG5lZWRzIHRvIGJlIHJ1biB3aXRoIFpvbmUuanMgcG9seWZpbGwuJyk7XG4gICAgfVxuICB9XG5cbiAgcnVuSW5uZXIoZm46ICgpID0+IGFueSk6IGFueSB7IHJldHVybiB0aGlzLmlubmVyLnJ1bihmbik7IH07XG4gIHJ1bklubmVyR3VhcmRlZChmbjogKCkgPT4gYW55KTogYW55IHsgcmV0dXJuIHRoaXMuaW5uZXIucnVuR3VhcmRlZChmbik7IH07XG4gIHJ1bk91dGVyKGZuOiAoKSA9PiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5vdXRlci5ydW4oZm4pOyB9O1xufVxuIl19