'use strict';"use strict";
var compile_metadata_1 = require('./compile_metadata');
var view_1 = require('angular2/src/core/linker/view');
var debug_context_1 = require('angular2/src/core/linker/debug_context');
var view_utils_1 = require('angular2/src/core/linker/view_utils');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var element_1 = require('angular2/src/core/linker/element');
var element_ref_1 = require('angular2/src/core/linker/element_ref');
var view_container_ref_1 = require('angular2/src/core/linker/view_container_ref');
var api_1 = require('angular2/src/core/render/api');
var view_2 = require('angular2/src/core/metadata/view');
var view_type_1 = require('angular2/src/core/linker/view_type');
var linker_1 = require('angular2/src/core/linker');
var injector_1 = require('angular2/src/core/di/injector');
var template_ref_1 = require('angular2/src/core/linker/template_ref');
var util_1 = require('./util');
var injector_factory_1 = require('angular2/src/core/linker/injector_factory');
var APP_VIEW_MODULE_URL = 'asset:angular2/lib/src/core/linker/view' + util_1.MODULE_SUFFIX;
var VIEW_UTILS_MODULE_URL = 'asset:angular2/lib/src/core/linker/view_utils' + util_1.MODULE_SUFFIX;
var CD_MODULE_URL = 'asset:angular2/lib/src/core/change_detection/change_detection' + util_1.MODULE_SUFFIX;
// Reassign the imports to different variables so we can
// define static variables with the name of the import.
// (only needed for Dart).
var impViewUtils = view_utils_1.ViewUtils;
var impAppView = view_1.AppView;
var impDebugAppView = view_1.DebugAppView;
var impDebugContext = debug_context_1.DebugContext;
var impAppElement = element_1.AppElement;
var impElementRef = element_ref_1.ElementRef;
var impViewContainerRef = view_container_ref_1.ViewContainerRef;
var impChangeDetectorRef = change_detection_1.ChangeDetectorRef;
var impRenderComponentType = api_1.RenderComponentType;
var impQueryList = linker_1.QueryList;
var impTemplateRef = template_ref_1.TemplateRef;
var impTemplateRef_ = template_ref_1.TemplateRef_;
var impValueUnwrapper = change_detection_1.ValueUnwrapper;
var impInjector = injector_1.Injector;
var impCodegenInjector = injector_factory_1.CodegenInjector;
var impCodegenInjectorFactory = injector_factory_1.CodegenInjectorFactory;
var impViewEncapsulation = view_2.ViewEncapsulation;
var impViewType = view_type_1.ViewType;
var impChangeDetectionStrategy = change_detection_1.ChangeDetectionStrategy;
var impStaticNodeDebugInfo = debug_context_1.StaticNodeDebugInfo;
var impRenderer = api_1.Renderer;
var impSimpleChange = change_detection_1.SimpleChange;
var impUninitialized = change_detection_1.uninitialized;
var impChangeDetectorState = change_detection_1.ChangeDetectorState;
var impFlattenNestedViewRenderNodes = view_utils_1.flattenNestedViewRenderNodes;
var impDevModeEqual = change_detection_1.devModeEqual;
var impInterpolate = view_utils_1.interpolate;
var impCheckBinding = view_utils_1.checkBinding;
var impCastByValue = view_utils_1.castByValue;
var impEMPTY_ARRAY = view_utils_1.EMPTY_ARRAY;
var impEMPTY_MAP = view_utils_1.EMPTY_MAP;
var Identifiers = (function () {
    function Identifiers() {
    }
    Identifiers.ViewUtils = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'ViewUtils',
        moduleUrl: 'asset:angular2/lib/src/core/linker/view_utils' + util_1.MODULE_SUFFIX,
        runtime: impViewUtils
    });
    Identifiers.AppView = new compile_metadata_1.CompileIdentifierMetadata({ name: 'AppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: impAppView });
    Identifiers.DebugAppView = new compile_metadata_1.CompileIdentifierMetadata({ name: 'DebugAppView', moduleUrl: APP_VIEW_MODULE_URL, runtime: impDebugAppView });
    Identifiers.AppElement = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'AppElement',
        moduleUrl: 'asset:angular2/lib/src/core/linker/element' + util_1.MODULE_SUFFIX,
        runtime: impAppElement
    });
    Identifiers.ElementRef = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'ElementRef',
        moduleUrl: 'asset:angular2/lib/src/core/linker/element_ref' + util_1.MODULE_SUFFIX,
        runtime: impElementRef
    });
    Identifiers.ViewContainerRef = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'ViewContainerRef',
        moduleUrl: 'asset:angular2/lib/src/core/linker/view_container_ref' + util_1.MODULE_SUFFIX,
        runtime: impViewContainerRef
    });
    Identifiers.ChangeDetectorRef = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'ChangeDetectorRef',
        moduleUrl: 'asset:angular2/lib/src/core/change_detection/change_detector_ref' + util_1.MODULE_SUFFIX,
        runtime: impChangeDetectorRef
    });
    Identifiers.RenderComponentType = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'RenderComponentType',
        moduleUrl: 'asset:angular2/lib/src/core/render/api' + util_1.MODULE_SUFFIX,
        runtime: impRenderComponentType
    });
    Identifiers.QueryList = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'QueryList',
        moduleUrl: 'asset:angular2/lib/src/core/linker/query_list' + util_1.MODULE_SUFFIX,
        runtime: impQueryList
    });
    Identifiers.TemplateRef = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'TemplateRef',
        moduleUrl: 'asset:angular2/lib/src/core/linker/template_ref' + util_1.MODULE_SUFFIX,
        runtime: impTemplateRef
    });
    Identifiers.TemplateRef_ = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'TemplateRef_',
        moduleUrl: 'asset:angular2/lib/src/core/linker/template_ref' + util_1.MODULE_SUFFIX,
        runtime: impTemplateRef_
    });
    Identifiers.ValueUnwrapper = new compile_metadata_1.CompileIdentifierMetadata({ name: 'ValueUnwrapper', moduleUrl: CD_MODULE_URL, runtime: impValueUnwrapper });
    Identifiers.Injector = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'Injector',
        moduleUrl: "asset:angular2/lib/src/core/di/injector" + util_1.MODULE_SUFFIX,
        runtime: impInjector
    });
    Identifiers.InjectorFactory = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'CodegenInjectorFactory',
        moduleUrl: "asset:angular2/lib/src/core/linker/injector_factory" + util_1.MODULE_SUFFIX,
        runtime: impCodegenInjectorFactory
    });
    Identifiers.CodegenInjector = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'CodegenInjector',
        moduleUrl: "asset:angular2/lib/src/core/linker/injector_factory" + util_1.MODULE_SUFFIX,
        runtime: impCodegenInjector
    });
    Identifiers.ViewEncapsulation = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'ViewEncapsulation',
        moduleUrl: 'asset:angular2/lib/src/core/metadata/view' + util_1.MODULE_SUFFIX,
        runtime: impViewEncapsulation
    });
    Identifiers.ViewType = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'ViewType',
        moduleUrl: "asset:angular2/lib/src/core/linker/view_type" + util_1.MODULE_SUFFIX,
        runtime: impViewType
    });
    Identifiers.ChangeDetectionStrategy = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'ChangeDetectionStrategy',
        moduleUrl: CD_MODULE_URL,
        runtime: impChangeDetectionStrategy
    });
    Identifiers.StaticNodeDebugInfo = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'StaticNodeDebugInfo',
        moduleUrl: "asset:angular2/lib/src/core/linker/debug_context" + util_1.MODULE_SUFFIX,
        runtime: impStaticNodeDebugInfo
    });
    Identifiers.DebugContext = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'DebugContext',
        moduleUrl: "asset:angular2/lib/src/core/linker/debug_context" + util_1.MODULE_SUFFIX,
        runtime: impDebugContext
    });
    Identifiers.Renderer = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'Renderer',
        moduleUrl: 'asset:angular2/lib/src/core/render/api' + util_1.MODULE_SUFFIX,
        runtime: impRenderer
    });
    Identifiers.SimpleChange = new compile_metadata_1.CompileIdentifierMetadata({ name: 'SimpleChange', moduleUrl: CD_MODULE_URL, runtime: impSimpleChange });
    Identifiers.uninitialized = new compile_metadata_1.CompileIdentifierMetadata({ name: 'uninitialized', moduleUrl: CD_MODULE_URL, runtime: impUninitialized });
    Identifiers.ChangeDetectorState = new compile_metadata_1.CompileIdentifierMetadata({ name: 'ChangeDetectorState', moduleUrl: CD_MODULE_URL, runtime: impChangeDetectorState });
    Identifiers.checkBinding = new compile_metadata_1.CompileIdentifierMetadata({ name: 'checkBinding', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impCheckBinding });
    Identifiers.flattenNestedViewRenderNodes = new compile_metadata_1.CompileIdentifierMetadata({
        name: 'flattenNestedViewRenderNodes',
        moduleUrl: VIEW_UTILS_MODULE_URL,
        runtime: impFlattenNestedViewRenderNodes
    });
    Identifiers.devModeEqual = new compile_metadata_1.CompileIdentifierMetadata({ name: 'devModeEqual', moduleUrl: CD_MODULE_URL, runtime: impDevModeEqual });
    Identifiers.interpolate = new compile_metadata_1.CompileIdentifierMetadata({ name: 'interpolate', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impInterpolate });
    Identifiers.castByValue = new compile_metadata_1.CompileIdentifierMetadata({ name: 'castByValue', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impCastByValue });
    Identifiers.EMPTY_ARRAY = new compile_metadata_1.CompileIdentifierMetadata({ name: 'EMPTY_ARRAY', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impEMPTY_ARRAY });
    Identifiers.EMPTY_MAP = new compile_metadata_1.CompileIdentifierMetadata({ name: 'EMPTY_MAP', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: impEMPTY_MAP });
    Identifiers.pureProxies = [
        null,
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy1', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy1 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy2', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy2 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy3', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy3 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy4', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy4 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy5', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy5 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy6', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy6 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy7', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy7 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy8', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy8 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy9', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy9 }),
        new compile_metadata_1.CompileIdentifierMetadata({ name: 'pureProxy10', moduleUrl: VIEW_UTILS_MODULE_URL, runtime: view_utils_1.pureProxy10 }),
    ];
    return Identifiers;
}());
exports.Identifiers = Identifiers;
function identifierToken(identifier) {
    return new compile_metadata_1.CompileTokenMetadata({ identifier: identifier });
}
exports.identifierToken = identifierToken;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpZmllcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWxMYmZ6MjkzLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvaWRlbnRpZmllcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGlDQUE4RCxvQkFBb0IsQ0FBQyxDQUFBO0FBQ25GLHFCQUFvQywrQkFBK0IsQ0FBQyxDQUFBO0FBQ3BFLDhCQUFnRCx3Q0FBd0MsQ0FBQyxDQUFBO0FBQ3pGLDJCQWtCTyxxQ0FBcUMsQ0FBQyxDQUFBO0FBQzdDLGlDQVFPLHFEQUFxRCxDQUFDLENBQUE7QUFDN0Qsd0JBQXlCLGtDQUFrQyxDQUFDLENBQUE7QUFDNUQsNEJBQXlCLHNDQUFzQyxDQUFDLENBQUE7QUFDaEUsbUNBQStCLDZDQUE2QyxDQUFDLENBQUE7QUFDN0Usb0JBQTZELDhCQUE4QixDQUFDLENBQUE7QUFDNUYscUJBQWdDLGlDQUFpQyxDQUFDLENBQUE7QUFDbEUsMEJBQXVCLG9DQUFvQyxDQUFDLENBQUE7QUFDNUQsdUJBQXdCLDBCQUEwQixDQUFDLENBQUE7QUFDbkQseUJBQXVCLCtCQUErQixDQUFDLENBQUE7QUFDdkQsNkJBQXdDLHVDQUF1QyxDQUFDLENBQUE7QUFDaEYscUJBQTRCLFFBQVEsQ0FBQyxDQUFBO0FBQ3JDLGlDQUFzRCwyQ0FBMkMsQ0FBQyxDQUFBO0FBRWxHLElBQUksbUJBQW1CLEdBQUcseUNBQXlDLEdBQUcsb0JBQWEsQ0FBQztBQUNwRixJQUFJLHFCQUFxQixHQUFHLCtDQUErQyxHQUFHLG9CQUFhLENBQUM7QUFDNUYsSUFBSSxhQUFhLEdBQUcsK0RBQStELEdBQUcsb0JBQWEsQ0FBQztBQUVwRyx3REFBd0Q7QUFDeEQsdURBQXVEO0FBQ3ZELDBCQUEwQjtBQUMxQixJQUFJLFlBQVksR0FBRyxzQkFBUyxDQUFDO0FBQzdCLElBQUksVUFBVSxHQUFHLGNBQU8sQ0FBQztBQUN6QixJQUFJ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QUF5QixDQUN6QixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLE9BQU8sRUFBRSx1QkFBVSxFQUFDLENBQUM7UUFDaEYsSUFBSSw0Q0FBeUIsQ0FDekIsRUFBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxPQUFPLEVBQUUsdUJBQVUsRUFBQyxDQUFDO1FBQ2hGLElBQUksNENBQXlCLENBQ3pCLEVBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUscUJBQXFCLEVBQUUsT0FBTyxFQUFFLHdCQUFXLEVBQUMsQ0FBQztLQUNuRixDQUFDO0lBQ0osa0JBQUM7QUFBRCxDQUFDLEFBaEpELElBZ0pDO0FBaEpZLG1CQUFXLGNBZ0p2QixDQUFBO0FBRUQseUJBQWdDLFVBQXFDO0lBQ25FLE1BQU0sQ0FBQyxJQUFJLHVDQUFvQixDQUFDLEVBQUMsVUFBVSxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7QUFDNUQsQ0FBQztBQUZlLHVCQUFlLGtCQUU5QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLCBDb21waWxlVG9rZW5NZXRhZGF0YX0gZnJvbSAnLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7QXBwVmlldywgRGVidWdBcHBWaWV3fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlldyc7XG5pbXBvcnQge1N0YXRpY05vZGVEZWJ1Z0luZm8sIERlYnVnQ29udGV4dH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2RlYnVnX2NvbnRleHQnO1xuaW1wb3J0IHtcbiAgVmlld1V0aWxzLFxuICBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzLFxuICBpbnRlcnBvbGF0ZSxcbiAgY2hlY2tCaW5kaW5nLFxuICBjYXN0QnlWYWx1ZSxcbiAgRU1QVFlfQVJSQVksXG4gIEVNUFRZX01BUCxcbiAgcHVyZVByb3h5MSxcbiAgcHVyZVByb3h5MixcbiAgcHVyZVByb3h5MyxcbiAgcHVyZVByb3h5NCxcbiAgcHVyZVByb3h5NSxcbiAgcHVyZVByb3h5NixcbiAgcHVyZVByb3h5NyxcbiAgcHVyZVByb3h5OCxcbiAgcHVyZVByb3h5OSxcbiAgcHVyZVByb3h5MTBcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdXRpbHMnO1xuaW1wb3J0IHtcbiAgdW5pbml0aWFsaXplZCxcbiAgZGV2TW9kZUVxdWFsLFxuICBTaW1wbGVDaGFuZ2UsXG4gIFZhbHVlVW53cmFwcGVyLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgQ2hhbmdlRGV0ZWN0b3JTdGF0ZSxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7QXBwRWxlbWVudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2VsZW1lbnQnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvdmlld19jb250YWluZXJfcmVmJztcbmltcG9ydCB7UmVuZGVyZXIsIFJlbmRlckNvbXBvbmVudFR5cGUsIFJlbmRlckRlYnVnSW5mb30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X3R5cGUnO1xuaW1wb3J0IHtRdWVyeUxpc3R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlcic7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvcic7XG5pbXBvcnQge1RlbXBsYXRlUmVmLCBUZW1wbGF0ZVJlZl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci90ZW1wbGF0ZV9yZWYnO1xuaW1wb3J0IHtNT0RVTEVfU1VGRklYfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtDb2RlZ2VuSW5qZWN0b3IsIENvZGVnZW5JbmplY3RvckZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbmplY3Rvcl9mYWN0b3J5JztcblxudmFyIEFQUF9WSUVXX01PRFVMRV9VUkwgPSAnYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL2xpbmtlci92aWV3JyArIE1PRFVMRV9TVUZGSVg7XG52YXIgVklFV19VVElMU19NT0RVTEVfVVJMID0gJ2Fzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9saW5rZXIvdmlld191dGlscycgKyBNT0RVTEVfU1VGRklYO1xudmFyIENEX01PRFVMRV9VUkwgPSAnYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbicgKyBNT0RVTEVfU1VGRklYO1xuXG4vLyBSZWFzc2lnbiB0aGUgaW1wb3J0cyB0byBkaWZmZXJlbnQgdmFyaWFibGVzIHNvIHdlIGNhblxuLy8gZGVmaW5lIHN0YXRpYyB2YXJpYWJsZXMgd2l0aCB0aGUgbmFtZSBvZiB0aGUgaW1wb3J0LlxuLy8gKG9ubHkgbmVlZGVkIGZvciBEYXJ0KS5cbnZhciBpbXBWaWV3VXRpbHMgPSBWaWV3VXRpbHM7XG52YXIgaW1wQXBwVmlldyA9IEFwcFZpZXc7XG52YXIgaW1wRGVidWdBcHBWaWV3ID0gRGVidWdBcHBWaWV3O1xudmFyIGltcERlYnVnQ29udGV4dCA9IERlYnVnQ29udGV4dDtcbnZhciBpbXBBcHBFbGVtZW50ID0gQXBwRWxlbWVudDtcbnZhciBpbXBFbGVtZW50UmVmID0gRWxlbWVudFJlZjtcbnZhciBpbXBWaWV3Q29udGFpbmVyUmVmID0gVmlld0NvbnRhaW5lclJlZjtcbnZhciBpbXBDaGFuZ2VEZXRlY3RvclJlZiA9IENoYW5nZURldGVjdG9yUmVmO1xudmFyIGltcFJlbmRlckNvbXBvbmVudFR5cGUgPSBSZW5kZXJDb21wb25lbnRUeXBlO1xudmFyIGltcFF1ZXJ5TGlzdCA9IFF1ZXJ5TGlzdDtcbnZhciBpbXBUZW1wbGF0ZVJlZiA9IFRlbXBsYXRlUmVmO1xudmFyIGltcFRlbXBsYXRlUmVmXyA9IFRlbXBsYXRlUmVmXztcbnZhciBpbXBWYWx1ZVVud3JhcHBlciA9IFZhbHVlVW53cmFwcGVyO1xudmFyIGltcEluamVjdG9yID0gSW5qZWN0b3I7XG52YXIgaW1wQ29kZWdlbkluamVjdG9yID0gQ29kZWdlbkluamVjdG9yO1xudmFyIGltcENvZGVnZW5JbmplY3RvckZhY3RvcnkgPSBDb2RlZ2VuSW5qZWN0b3JGYWN0b3J5O1xudmFyIGltcFZpZXdFbmNhcHN1bGF0aW9uID0gVmlld0VuY2Fwc3VsYXRpb247XG52YXIgaW1wVmlld1R5cGUgPSBWaWV3VHlwZTtcbnZhciBpbXBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5O1xudmFyIGltcFN0YXRpY05vZGVEZWJ1Z0luZm8gPSBTdGF0aWNOb2RlRGVidWdJbmZvO1xudmFyIGltcFJlbmRlcmVyID0gUmVuZGVyZXI7XG52YXIgaW1wU2ltcGxlQ2hhbmdlID0gU2ltcGxlQ2hhbmdlO1xudmFyIGltcFVuaW5pdGlhbGl6ZWQgPSB1bmluaXRpYWxpemVkO1xudmFyIGltcENoYW5nZURldGVjdG9yU3RhdGUgPSBDaGFuZ2VEZXRlY3RvclN0YXRlO1xudmFyIGltcEZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMgPSBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzO1xudmFyIGltcERldk1vZGVFcXVhbCA9IGRldk1vZGVFcXVhbDtcbnZhciBpbXBJbnRlcnBvbGF0ZSA9IGludGVycG9sYXRlO1xudmFyIGltcENoZWNrQmluZGluZyA9IGNoZWNrQmluZGluZztcbnZhciBpbXBDYXN0QnlWYWx1ZSA9IGNhc3RCeVZhbHVlO1xudmFyIGltcEVNUFRZX0FSUkFZID0gRU1QVFlfQVJSQVk7XG52YXIgaW1wRU1QVFlfTUFQID0gRU1QVFlfTUFQO1xuXG5leHBvcnQgY2xhc3MgSWRlbnRpZmllcnMge1xuICBzdGF0aWMgVmlld1V0aWxzID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdWaWV3VXRpbHMnLFxuICAgIG1vZHVsZVVybDogJ2Fzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9saW5rZXIvdmlld191dGlscycgKyBNT0RVTEVfU1VGRklYLFxuICAgIHJ1bnRpbWU6IGltcFZpZXdVdGlsc1xuICB9KTtcbiAgc3RhdGljIEFwcFZpZXcgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YShcbiAgICAgIHtuYW1lOiAnQXBwVmlldycsIG1vZHVsZVVybDogQVBQX1ZJRVdfTU9EVUxFX1VSTCwgcnVudGltZTogaW1wQXBwVmlld30pO1xuICBzdGF0aWMgRGVidWdBcHBWaWV3ID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICB7bmFtZTogJ0RlYnVnQXBwVmlldycsIG1vZHVsZVVybDogQVBQX1ZJRVdfTU9EVUxFX1VSTCwgcnVudGltZTogaW1wRGVidWdBcHBWaWV3fSk7XG4gIHN0YXRpYyBBcHBFbGVtZW50ID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdBcHBFbGVtZW50JyxcbiAgICBtb2R1bGVVcmw6ICdhc3NldDphbmd1bGFyMi9saWIvc3JjL2NvcmUvbGlua2VyL2VsZW1lbnQnICsgTU9EVUxFX1NVRkZJWCxcbiAgICBydW50aW1lOiBpbXBBcHBFbGVtZW50XG4gIH0pO1xuICBzdGF0aWMgRWxlbWVudFJlZiA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgICBuYW1lOiAnRWxlbWVudFJlZicsXG4gICAgbW9kdWxlVXJsOiAnYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X3JlZicgKyBNT0RVTEVfU1VGRklYLFxuICAgIHJ1bnRpbWU6IGltcEVsZW1lbnRSZWZcbiAgfSk7XG4gIHN0YXRpYyBWaWV3Q29udGFpbmVyUmVmID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdWaWV3Q29udGFpbmVyUmVmJyxcbiAgICBtb2R1bGVVcmw6ICdhc3NldDphbmd1bGFyMi9saWIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfY29udGFpbmVyX3JlZicgKyBNT0RVTEVfU1VGRklYLFxuICAgIHJ1bnRpbWU6IGltcFZpZXdDb250YWluZXJSZWZcbiAgfSk7XG4gIHN0YXRpYyBDaGFuZ2VEZXRlY3RvclJlZiA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgICBuYW1lOiAnQ2hhbmdlRGV0ZWN0b3JSZWYnLFxuICAgIG1vZHVsZVVybDogJ2Fzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rvcl9yZWYnICsgTU9EVUxFX1NVRkZJWCxcbiAgICBydW50aW1lOiBpbXBDaGFuZ2VEZXRlY3RvclJlZlxuICB9KTtcbiAgc3RhdGljIFJlbmRlckNvbXBvbmVudFR5cGUgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7XG4gICAgbmFtZTogJ1JlbmRlckNvbXBvbmVudFR5cGUnLFxuICAgIG1vZHVsZVVybDogJ2Fzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9yZW5kZXIvYXBpJyArIE1PRFVMRV9TVUZGSVgsXG4gICAgcnVudGltZTogaW1wUmVuZGVyQ29tcG9uZW50VHlwZVxuICB9KTtcbiAgc3RhdGljIFF1ZXJ5TGlzdCA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgICBuYW1lOiAnUXVlcnlMaXN0JyxcbiAgICBtb2R1bGVVcmw6ICdhc3NldDphbmd1bGFyMi9saWIvc3JjL2NvcmUvbGlua2VyL3F1ZXJ5X2xpc3QnICsgTU9EVUxFX1NVRkZJWCxcbiAgICBydW50aW1lOiBpbXBRdWVyeUxpc3RcbiAgfSk7XG4gIHN0YXRpYyBUZW1wbGF0ZVJlZiA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgICBuYW1lOiAnVGVtcGxhdGVSZWYnLFxuICAgIG1vZHVsZVVybDogJ2Fzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9saW5rZXIvdGVtcGxhdGVfcmVmJyArIE1PRFVMRV9TVUZGSVgsXG4gICAgcnVudGltZTogaW1wVGVtcGxhdGVSZWZcbiAgfSk7XG4gIHN0YXRpYyBUZW1wbGF0ZVJlZl8gPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7XG4gICAgbmFtZTogJ1RlbXBsYXRlUmVmXycsXG4gICAgbW9kdWxlVXJsOiAnYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL2xpbmtlci90ZW1wbGF0ZV9yZWYnICsgTU9EVUxFX1NVRkZJWCxcbiAgICBydW50aW1lOiBpbXBUZW1wbGF0ZVJlZl9cbiAgfSk7XG4gIHN0YXRpYyBWYWx1ZVVud3JhcHBlciA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAge25hbWU6ICdWYWx1ZVVud3JhcHBlcicsIG1vZHVsZVVybDogQ0RfTU9EVUxFX1VSTCwgcnVudGltZTogaW1wVmFsdWVVbndyYXBwZXJ9KTtcbiAgc3RhdGljIEluamVjdG9yID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdJbmplY3RvcicsXG4gICAgbW9kdWxlVXJsOiBgYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL2RpL2luamVjdG9yJHtNT0RVTEVfU1VGRklYfWAsXG4gICAgcnVudGltZTogaW1wSW5qZWN0b3JcbiAgfSk7XG4gIHN0YXRpYyBJbmplY3RvckZhY3RvcnkgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7XG4gICAgbmFtZTogJ0NvZGVnZW5JbmplY3RvckZhY3RvcnknLFxuICAgIG1vZHVsZVVybDogYGFzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9saW5rZXIvaW5qZWN0b3JfZmFjdG9yeSR7TU9EVUxFX1NVRkZJWH1gLFxuICAgIHJ1bnRpbWU6IGltcENvZGVnZW5JbmplY3RvckZhY3RvcnlcbiAgfSk7XG4gIHN0YXRpYyBDb2RlZ2VuSW5qZWN0b3IgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7XG4gICAgbmFtZTogJ0NvZGVnZW5JbmplY3RvcicsXG4gICAgbW9kdWxlVXJsOiBgYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL2xpbmtlci9pbmplY3Rvcl9mYWN0b3J5JHtNT0RVTEVfU1VGRklYfWAsXG4gICAgcnVudGltZTogaW1wQ29kZWdlbkluamVjdG9yXG4gIH0pO1xuICBzdGF0aWMgVmlld0VuY2Fwc3VsYXRpb24gPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7XG4gICAgbmFtZTogJ1ZpZXdFbmNhcHN1bGF0aW9uJyxcbiAgICBtb2R1bGVVcmw6ICdhc3NldDphbmd1bGFyMi9saWIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldycgKyBNT0RVTEVfU1VGRklYLFxuICAgIHJ1bnRpbWU6IGltcFZpZXdFbmNhcHN1bGF0aW9uXG4gIH0pO1xuICBzdGF0aWMgVmlld1R5cGUgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7XG4gICAgbmFtZTogJ1ZpZXdUeXBlJyxcbiAgICBtb2R1bGVVcmw6IGBhc3NldDphbmd1bGFyMi9saWIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZSR7TU9EVUxFX1NVRkZJWH1gLFxuICAgIHJ1bnRpbWU6IGltcFZpZXdUeXBlXG4gIH0pO1xuICBzdGF0aWMgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7XG4gICAgbmFtZTogJ0NoYW5nZURldGVjdGlvblN0cmF0ZWd5JyxcbiAgICBtb2R1bGVVcmw6IENEX01PRFVMRV9VUkwsXG4gICAgcnVudGltZTogaW1wQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lcbiAgfSk7XG4gIHN0YXRpYyBTdGF0aWNOb2RlRGVidWdJbmZvID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdTdGF0aWNOb2RlRGVidWdJbmZvJyxcbiAgICBtb2R1bGVVcmw6IGBhc3NldDphbmd1bGFyMi9saWIvc3JjL2NvcmUvbGlua2VyL2RlYnVnX2NvbnRleHQke01PRFVMRV9TVUZGSVh9YCxcbiAgICBydW50aW1lOiBpbXBTdGF0aWNOb2RlRGVidWdJbmZvXG4gIH0pO1xuICBzdGF0aWMgRGVidWdDb250ZXh0ID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdEZWJ1Z0NvbnRleHQnLFxuICAgIG1vZHVsZVVybDogYGFzc2V0OmFuZ3VsYXIyL2xpYi9zcmMvY29yZS9saW5rZXIvZGVidWdfY29udGV4dCR7TU9EVUxFX1NVRkZJWH1gLFxuICAgIHJ1bnRpbWU6IGltcERlYnVnQ29udGV4dFxuICB9KTtcbiAgc3RhdGljIFJlbmRlcmVyID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdSZW5kZXJlcicsXG4gICAgbW9kdWxlVXJsOiAnYXNzZXQ6YW5ndWxhcjIvbGliL3NyYy9jb3JlL3JlbmRlci9hcGknICsgTU9EVUxFX1NVRkZJWCxcbiAgICBydW50aW1lOiBpbXBSZW5kZXJlclxuICB9KTtcbiAgc3RhdGljIFNpbXBsZUNoYW5nZSA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAge25hbWU6ICdTaW1wbGVDaGFuZ2UnLCBtb2R1bGVVcmw6IENEX01PRFVMRV9VUkwsIHJ1bnRpbWU6IGltcFNpbXBsZUNoYW5nZX0pO1xuICBzdGF0aWMgdW5pbml0aWFsaXplZCA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAge25hbWU6ICd1bmluaXRpYWxpemVkJywgbW9kdWxlVXJsOiBDRF9NT0RVTEVfVVJMLCBydW50aW1lOiBpbXBVbmluaXRpYWxpemVkfSk7XG4gIHN0YXRpYyBDaGFuZ2VEZXRlY3RvclN0YXRlID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICB7bmFtZTogJ0NoYW5nZURldGVjdG9yU3RhdGUnLCBtb2R1bGVVcmw6IENEX01PRFVMRV9VUkwsIHJ1bnRpbWU6IGltcENoYW5nZURldGVjdG9yU3RhdGV9KTtcbiAgc3RhdGljIGNoZWNrQmluZGluZyA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAge25hbWU6ICdjaGVja0JpbmRpbmcnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogaW1wQ2hlY2tCaW5kaW5nfSk7XG4gIHN0YXRpYyBmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgIG5hbWU6ICdmbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzJyxcbiAgICBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCxcbiAgICBydW50aW1lOiBpbXBGbGF0dGVuTmVzdGVkVmlld1JlbmRlck5vZGVzXG4gIH0pO1xuICBzdGF0aWMgZGV2TW9kZUVxdWFsID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICB7bmFtZTogJ2Rldk1vZGVFcXVhbCcsIG1vZHVsZVVybDogQ0RfTU9EVUxFX1VSTCwgcnVudGltZTogaW1wRGV2TW9kZUVxdWFsfSk7XG4gIHN0YXRpYyBpbnRlcnBvbGF0ZSA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAge25hbWU6ICdpbnRlcnBvbGF0ZScsIG1vZHVsZVVybDogVklFV19VVElMU19NT0RVTEVfVVJMLCBydW50aW1lOiBpbXBJbnRlcnBvbGF0ZX0pO1xuICBzdGF0aWMgY2FzdEJ5VmFsdWUgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YShcbiAgICAgIHtuYW1lOiAnY2FzdEJ5VmFsdWUnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogaW1wQ2FzdEJ5VmFsdWV9KTtcbiAgc3RhdGljIEVNUFRZX0FSUkFZID0gbmV3IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICB7bmFtZTogJ0VNUFRZX0FSUkFZJywgbW9kdWxlVXJsOiBWSUVXX1VUSUxTX01PRFVMRV9VUkwsIHJ1bnRpbWU6IGltcEVNUFRZX0FSUkFZfSk7XG4gIHN0YXRpYyBFTVBUWV9NQVAgPSBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YShcbiAgICAgIHtuYW1lOiAnRU1QVFlfTUFQJywgbW9kdWxlVXJsOiBWSUVXX1VUSUxTX01PRFVMRV9VUkwsIHJ1bnRpbWU6IGltcEVNUFRZX01BUH0pO1xuXG4gIHN0YXRpYyBwdXJlUHJveGllcyA9IFtcbiAgICBudWxsLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTEnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5MX0pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTInLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5Mn0pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTMnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5M30pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTQnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5NH0pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTUnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5NX0pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTYnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5Nn0pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTcnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5N30pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTgnLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5OH0pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTknLCBtb2R1bGVVcmw6IFZJRVdfVVRJTFNfTU9EVUxFX1VSTCwgcnVudGltZTogcHVyZVByb3h5OX0pLFxuICAgIG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKFxuICAgICAgICB7bmFtZTogJ3B1cmVQcm94eTEwJywgbW9kdWxlVXJsOiBWSUVXX1VUSUxTX01PRFVMRV9VUkwsIHJ1bnRpbWU6IHB1cmVQcm94eTEwfSksXG4gIF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGlmaWVyVG9rZW4oaWRlbnRpZmllcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSk6IENvbXBpbGVUb2tlbk1ldGFkYXRhIHtcbiAgcmV0dXJuIG5ldyBDb21waWxlVG9rZW5NZXRhZGF0YSh7aWRlbnRpZmllcjogaWRlbnRpZmllcn0pO1xufVxuIl19