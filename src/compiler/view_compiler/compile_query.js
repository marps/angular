'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var o = require('../output/output_ast');
var identifiers_1 = require('../identifiers');
var util_1 = require('./util');
var ViewQueryValues = (function () {
    function ViewQueryValues(view, values) {
        this.view = view;
        this.values = values;
    }
    return ViewQueryValues;
}());
var CompileQuery = (function () {
    function CompileQuery(meta, queryList, ownerDirectiveExpression, view) {
        this.meta = meta;
        this.queryList = queryList;
        this.ownerDirectiveExpression = ownerDirectiveExpression;
        this.view = view;
        this._values = new ViewQueryValues(view, []);
    }
    CompileQuery.prototype.addValue = function (value, view) {
        var currentView = view;
        var elPath = [];
        while (lang_1.isPresent(currentView) && currentView !== this.view) {
            var parentEl = currentView.declarationElement;
            elPath.unshift(parentEl);
            currentView = parentEl.view;
        }
        var queryListForDirtyExpr = util_1.getPropertyInView(this.queryList, view, this.view);
        var viewValues = this._values;
        elPath.forEach(function (el) {
            var last = viewValues.values.length > 0 ? viewValues.values[viewValues.values.length - 1] : null;
            if (last instanceof ViewQueryValues && last.view === el.embeddedView) {
                viewValues = last;
            }
            else {
                var newViewValues = new ViewQueryValues(el.embeddedView, []);
                viewValues.values.push(newViewValues);
                viewValues = newViewValues;
            }
        });
        viewValues.values.push(value);
        if (elPath.length > 0) {
            view.dirtyParentQueriesMethod.addStmt(queryListForDirtyExpr.callMethod('setDirty', []).toStmt());
        }
    };
    CompileQuery.prototype._isStatic = function () {
        var isStatic = true;
        this._values.values.forEach(function (value) {
            if (value instanceof ViewQueryValues) {
                // querying a nested view makes the query content dynamic
                isStatic = false;
            }
        });
        return isStatic;
    };
    CompileQuery.prototype.afterChildren = function (targetStaticMethod, targetDynamicMethod) {
        var values = createQueryValues(this._values);
        var updateStmts = [this.queryList.callMethod('reset', [o.literalArr(values)]).toStmt()];
        if (lang_1.isPresent(this.ownerDirectiveExpression)) {
            var valueExpr = this.meta.first ? this.queryList.prop('first') : this.queryList;
            updateStmts.push(this.ownerDirectiveExpression.prop(this.meta.propertyName).set(valueExpr).toStmt());
        }
        if (!this.meta.first) {
            updateStmts.push(this.queryList.callMethod('notifyOnChanges', []).toStmt());
        }
        if (this.meta.first && this._isStatic()) {
            // for queries that don't change and the user asked for a single element,
            // set it immediately. That is e.g. needed for querying for ViewContainerRefs, ...
            // we don't do this for QueryLists for now as this would break the timing when
            // we call QueryList listeners...
            targetStaticMethod.addStmts(updateStmts);
        }
        else {
            targetDynamicMethod.addStmt(new o.IfStmt(this.queryList.prop('dirty'), updateStmts));
        }
    };
    return CompileQuery;
}());
exports.CompileQuery = CompileQuery;
function createQueryValues(viewValues) {
    return collection_1.ListWrapper.flatten(viewValues.values.map(function (entry) {
        if (entry instanceof ViewQueryValues) {
            return mapNestedViews(entry.view.declarationElement.appElement, entry.view, createQueryValues(entry));
        }
        else {
            return entry;
        }
    }));
}
function mapNestedViews(declarationAppElement, view, expressions) {
    var adjustedExpressions = expressions.map(function (expr) {
        return o.replaceVarInExpression(o.THIS_EXPR.name, o.variable('nestedView'), expr);
    });
    return declarationAppElement.callMethod('mapNestedViews', [
        o.variable(view.className),
        o.fn([new o.FnParam('nestedView', view.classType)], [new o.ReturnStatement(o.literalArr(adjustedExpressions))])
    ]);
}
function createQueryList(query, directiveInstance, propertyName, compileView) {
    compileView.fields.push(new o.ClassField(propertyName, o.importType(identifiers_1.Identifiers.QueryList), [o.StmtModifier.Private]));
    var expr = o.THIS_EXPR.prop(propertyName);
    compileView.createMethod.addStmt(o.THIS_EXPR.prop(propertyName)
        .set(o.importExpr(identifiers_1.Identifiers.QueryList).instantiate([]))
        .toStmt());
    return expr;
}
exports.createQueryList = createQueryList;
function addQueryToTokenMap(map, query) {
    query.meta.selectors.forEach(function (selector) {
        var entry = map.get(selector);
        if (lang_1.isBlank(entry)) {
            entry = [];
            map.add(selector, entry);
        }
        entry.push(query);
    });
}
exports.addQueryToTokenMap = addQueryToTokenMap;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZV9xdWVyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtbExiZnoyOTMudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci92aWV3X2NvbXBpbGVyL2NvbXBpbGVfcXVlcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQUFpQywwQkFBMEIsQ0FBQyxDQUFBO0FBQzVELDJCQUEwQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRTNELElBQVksQ0FBQyxXQUFNLHNCQUFzQixDQUFDLENBQUE7QUFDMUMsNEJBQTBCLGdCQUFnQixDQUFDLENBQUE7QUFXM0MscUJBQWdDLFFBQVEsQ0FBQyxDQUFBO0FBRXpDO0lBQ0UseUJBQW1CLElBQWlCLEVBQVMsTUFBNkM7UUFBdkUsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUFTLFdBQU0sR0FBTixNQUFNLENBQXVDO0lBQUcsQ0FBQztJQUNoRyxzQkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRUQ7SUFHRSxzQkFBbUIsSUFBMEIsRUFBUyxTQUF1QixFQUMxRCx3QkFBc0MsRUFBUyxJQUFpQjtRQURoRSxTQUFJLEdBQUosSUFBSSxDQUFzQjtRQUFTLGNBQVMsR0FBVCxTQUFTLENBQWM7UUFDMUQsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUFjO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUNqRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsK0JBQVEsR0FBUixVQUFTLEtBQW1CLEVBQUUsSUFBaUI7UUFDN0MsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLElBQUksTUFBTSxHQUFxQixFQUFFLENBQUM7UUFDbEMsT0FBTyxnQkFBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0Qs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QyxXQUFXLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDekIsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMseUJBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDeEQsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQVRlLHVCQUFlLGtCQVM5QixDQUFBO0FBRUQsNEJBQW1DLEdBQW9DLEVBQUUsS0FBbUI7SUFDMUYsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUTtRQUNwQyxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlCLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNYLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNCLENBQUM7UUFDRCxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BCLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQVRlLDBCQUFrQixxQkFTakMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzfSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5cbmltcG9ydCB7XG4gIENvbXBpbGVRdWVyeU1ldGFkYXRhLFxuICBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NYXBcbn0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5cbmltcG9ydCB7Q29tcGlsZVZpZXd9IGZyb20gJy4vY29tcGlsZV92aWV3JztcbmltcG9ydCB7Q29tcGlsZUVsZW1lbnR9IGZyb20gJy4vY29tcGlsZV9lbGVtZW50JztcbmltcG9ydCB7Q29tcGlsZU1ldGhvZH0gZnJvbSAnLi9jb21waWxlX21ldGhvZCc7XG5pbXBvcnQge2dldFByb3BlcnR5SW5WaWV3fSBmcm9tICcuL3V0aWwnO1xuXG5jbGFzcyBWaWV3UXVlcnlWYWx1ZXMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmlldzogQ29tcGlsZVZpZXcsIHB1YmxpYyB2YWx1ZXM6IEFycmF5PG8uRXhwcmVzc2lvbiB8IFZpZXdRdWVyeVZhbHVlcz4pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21waWxlUXVlcnkge1xuICBwcml2YXRlIF92YWx1ZXM6IFZpZXdRdWVyeVZhbHVlcztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWV0YTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsIHB1YmxpYyBxdWVyeUxpc3Q6IG8uRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgcHVibGljIG93bmVyRGlyZWN0aXZlRXhwcmVzc2lvbjogby5FeHByZXNzaW9uLCBwdWJsaWMgdmlldzogQ29tcGlsZVZpZXcpIHtcbiAgICB0aGlzLl92YWx1ZXMgPSBuZXcgVmlld1F1ZXJ5VmFsdWVzKHZpZXcsIFtdKTtcbiAgfVxuXG4gIGFkZFZhbHVlKHZhbHVlOiBvLkV4cHJlc3Npb24sIHZpZXc6IENvbXBpbGVWaWV3KSB7XG4gICAgdmFyIGN1cnJlbnRWaWV3ID0gdmlldztcbiAgICB2YXIgZWxQYXRoOiBDb21waWxlRWxlbWVudFtdID0gW107XG4gICAgd2hpbGUgKGlzUHJlc2VudChjdXJyZW50VmlldykgJiYgY3VycmVudFZpZXcgIT09IHRoaXMudmlldykge1xuICAgICAgdmFyIHBhcmVudEVsID0gY3VycmVudFZpZXcuZGVjbGFyYXRpb25FbGVtZW50O1xuICAgICAgZWxQYXRoLnVuc2hpZnQocGFyZW50RWwpO1xuICAgICAgY3VycmVudFZpZXcgPSBwYXJlbnRFbC52aWV3O1xuICAgIH1cbiAgICB2YXIgcXVlcnlMaXN0Rm9yRGlydHlFeHByID0gZ2V0UHJvcGVydHlJblZpZXcodGhpcy5xdWVyeUxpc3QsIHZpZXcsIHRoaXMudmlldyk7XG5cbiAgICB2YXIgdmlld1ZhbHVlcyA9IHRoaXMuX3ZhbHVlcztcbiAgICBlbFBhdGguZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgIHZhciBsYXN0ID1cbiAgICAgICAgICB2aWV3VmFsdWVzLnZhbHVlcy5sZW5ndGggPiAwID8gdmlld1ZhbHVlcy52YWx1ZXNbdmlld1ZhbHVlcy52YWx1ZXMubGVuZ3RoIC0gMV0gOiBudWxsO1xuICAgICAgaWYgKGxhc3QgaW5zdGFuY2VvZiBWaWV3UXVlcnlWYWx1ZXMgJiYgbGFzdC52aWV3ID09PSBlbC5lbWJlZGRlZFZpZXcpIHtcbiAgICAgICAgdmlld1ZhbHVlcyA9IGxhc3Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmV3Vmlld1ZhbHVlcyA9IG5ldyBWaWV3UXVlcnlWYWx1ZXMoZWwuZW1iZWRkZWRWaWV3LCBbXSk7XG4gICAgICAgIHZpZXdWYWx1ZXMudmFsdWVzLnB1c2gobmV3Vmlld1ZhbHVlcyk7XG4gICAgICAgIHZpZXdWYWx1ZXMgPSBuZXdWaWV3VmFsdWVzO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHZpZXdWYWx1ZXMudmFsdWVzLnB1c2godmFsdWUpO1xuXG4gICAgaWYgKGVsUGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICB2aWV3LmRpcnR5UGFyZW50UXVlcmllc01ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIHF1ZXJ5TGlzdEZvckRpcnR5RXhwci5jYWxsTWV0aG9kKCdzZXREaXJ0eScsIFtdKS50b1N0bXQoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfaXNTdGF0aWMoKTogYm9vbGVhbiB7XG4gICAgdmFyIGlzU3RhdGljID0gdHJ1ZTtcbiAgICB0aGlzLl92YWx1ZXMudmFsdWVzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBWaWV3UXVlcnlWYWx1ZXMpIHtcbiAgICAgICAgLy8gcXVlcnlpbmcgYSBuZXN0ZWQgdmlldyBtYWtlcyB0aGUgcXVlcnkgY29udGVudCBkeW5hbWljXG4gICAgICAgIGlzU3RhdGljID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGlzU3RhdGljO1xuICB9XG5cbiAgYWZ0ZXJDaGlsZHJlbih0YXJnZXRTdGF0aWNNZXRob2Q6IENvbXBpbGVNZXRob2QsIHRhcmdldER5bmFtaWNNZXRob2Q6IENvbXBpbGVNZXRob2QpIHtcbiAgICB2YXIgdmFsdWVzID0gY3JlYXRlUXVlcnlWYWx1ZXModGhpcy5fdmFsdWVzKTtcbiAgICB2YXIgdXBkYXRlU3RtdHMgPSBbdGhpcy5xdWVyeUxpc3QuY2FsbE1ldGhvZCgncmVzZXQnLCBbby5saXRlcmFsQXJyKHZhbHVlcyldKS50b1N0bXQoKV07XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm93bmVyRGlyZWN0aXZlRXhwcmVzc2lvbikpIHtcbiAgICAgIHZhciB2YWx1ZUV4cHIgPSB0aGlzLm1ldGEuZmlyc3QgPyB0aGlzLnF1ZXJ5TGlzdC5wcm9wKCdmaXJzdCcpIDogdGhpcy5xdWVyeUxpc3Q7XG4gICAgICB1cGRhdGVTdG10cy5wdXNoKFxuICAgICAgICAgIHRoaXMub3duZXJEaXJlY3RpdmVFeHByZXNzaW9uLnByb3AodGhpcy5tZXRhLnByb3BlcnR5TmFtZSkuc2V0KHZhbHVlRXhwcikudG9TdG10KCkpO1xuICAgIH1cbiAgICBpZiAoIXRoaXMubWV0YS5maXJzdCkge1xuICAgICAgdXBkYXRlU3RtdHMucHVzaCh0aGlzLnF1ZXJ5TGlzdC5jYWxsTWV0aG9kKCdub3RpZnlPbkNoYW5nZXMnLCBbXSkudG9TdG10KCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5tZXRhLmZpcnN0ICYmIHRoaXMuX2lzU3RhdGljKCkpIHtcbiAgICAgIC8vIGZvciBxdWVyaWVzIHRoYXQgZG9uJ3QgY2hhbmdlIGFuZCB0aGUgdXNlciBhc2tlZCBmb3IgYSBzaW5nbGUgZWxlbWVudCxcbiAgICAgIC8vIHNldCBpdCBpbW1lZGlhdGVseS4gVGhhdCBpcyBlLmcuIG5lZWRlZCBmb3IgcXVlcnlpbmcgZm9yIFZpZXdDb250YWluZXJSZWZzLCAuLi5cbiAgICAgIC8vIHdlIGRvbid0IGRvIHRoaXMgZm9yIFF1ZXJ5TGlzdHMgZm9yIG5vdyBhcyB0aGlzIHdvdWxkIGJyZWFrIHRoZSB0aW1pbmcgd2hlblxuICAgICAgLy8gd2UgY2FsbCBRdWVyeUxpc3QgbGlzdGVuZXJzLi4uXG4gICAgICB0YXJnZXRTdGF0aWNNZXRob2QuYWRkU3RtdHModXBkYXRlU3RtdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXREeW5hbWljTWV0aG9kLmFkZFN0bXQobmV3IG8uSWZTdG10KHRoaXMucXVlcnlMaXN0LnByb3AoJ2RpcnR5JyksIHVwZGF0ZVN0bXRzKSk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVF1ZXJ5VmFsdWVzKHZpZXdWYWx1ZXM6IFZpZXdRdWVyeVZhbHVlcyk6IG8uRXhwcmVzc2lvbltdIHtcbiAgcmV0dXJuIExpc3RXcmFwcGVyLmZsYXR0ZW4odmlld1ZhbHVlcy52YWx1ZXMubWFwKChlbnRyeSkgPT4ge1xuICAgIGlmIChlbnRyeSBpbnN0YW5jZW9mIFZpZXdRdWVyeVZhbHVlcykge1xuICAgICAgcmV0dXJuIG1hcE5lc3RlZFZpZXdzKGVudHJ5LnZpZXcuZGVjbGFyYXRpb25FbGVtZW50LmFwcEVsZW1lbnQsIGVudHJ5LnZpZXcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlUXVlcnlWYWx1ZXMoZW50cnkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDxvLkV4cHJlc3Npb24+ZW50cnk7XG4gICAgfVxuICB9KSk7XG59XG5cbmZ1bmN0aW9uIG1hcE5lc3RlZFZpZXdzKGRlY2xhcmF0aW9uQXBwRWxlbWVudDogby5FeHByZXNzaW9uLCB2aWV3OiBDb21waWxlVmlldyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSk6IG8uRXhwcmVzc2lvbiB7XG4gIHZhciBhZGp1c3RlZEV4cHJlc3Npb25zOiBvLkV4cHJlc3Npb25bXSA9IGV4cHJlc3Npb25zLm1hcCgoZXhwcikgPT4ge1xuICAgIHJldHVybiBvLnJlcGxhY2VWYXJJbkV4cHJlc3Npb24oby5USElTX0VYUFIubmFtZSwgby52YXJpYWJsZSgnbmVzdGVkVmlldycpLCBleHByKTtcbiAgfSk7XG4gIHJldHVybiBkZWNsYXJhdGlvbkFwcEVsZW1lbnQuY2FsbE1ldGhvZCgnbWFwTmVzdGVkVmlld3MnLCBbXG4gICAgby52YXJpYWJsZSh2aWV3LmNsYXNzTmFtZSksXG4gICAgby5mbihbbmV3IG8uRm5QYXJhbSgnbmVzdGVkVmlldycsIHZpZXcuY2xhc3NUeXBlKV0sXG4gICAgICAgICBbbmV3IG8uUmV0dXJuU3RhdGVtZW50KG8ubGl0ZXJhbEFycihhZGp1c3RlZEV4cHJlc3Npb25zKSldKVxuICBdKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVF1ZXJ5TGlzdChxdWVyeTogQ29tcGlsZVF1ZXJ5TWV0YWRhdGEsIGRpcmVjdGl2ZUluc3RhbmNlOiBvLkV4cHJlc3Npb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogc3RyaW5nLCBjb21waWxlVmlldzogQ29tcGlsZVZpZXcpOiBvLkV4cHJlc3Npb24ge1xuICBjb21waWxlVmlldy5maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKHByb3BlcnR5TmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlF1ZXJ5TGlzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uU3RtdE1vZGlmaWVyLlByaXZhdGVdKSk7XG4gIHZhciBleHByID0gby5USElTX0VYUFIucHJvcChwcm9wZXJ0eU5hbWUpO1xuICBjb21waWxlVmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChvLlRISVNfRVhQUi5wcm9wKHByb3BlcnR5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLlF1ZXJ5TGlzdCkuaW5zdGFudGlhdGUoW10pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgcmV0dXJuIGV4cHI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRRdWVyeVRvVG9rZW5NYXAobWFwOiBDb21waWxlVG9rZW5NYXA8Q29tcGlsZVF1ZXJ5W10+LCBxdWVyeTogQ29tcGlsZVF1ZXJ5KSB7XG4gIHF1ZXJ5Lm1ldGEuc2VsZWN0b3JzLmZvckVhY2goKHNlbGVjdG9yKSA9PiB7XG4gICAgdmFyIGVudHJ5ID0gbWFwLmdldChzZWxlY3Rvcik7XG4gICAgaWYgKGlzQmxhbmsoZW50cnkpKSB7XG4gICAgICBlbnRyeSA9IFtdO1xuICAgICAgbWFwLmFkZChzZWxlY3RvciwgZW50cnkpO1xuICAgIH1cbiAgICBlbnRyeS5wdXNoKHF1ZXJ5KTtcbiAgfSk7XG59XG4iXX0=