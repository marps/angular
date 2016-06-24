import { CompileIdentifierMetadata, createHostComponentMeta } from './compile_metadata';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ListWrapper } from 'angular2/src/facade/collection';
import * as o from './output/output_ast';
import { ComponentFactory } from 'angular2/src/core/linker/component_factory';
import { MODULE_SUFFIX } from './util';
var _COMPONENT_FACTORY_IDENTIFIER = new CompileIdentifierMetadata({
    name: 'ComponentFactory',
    runtime: ComponentFactory,
    moduleUrl: `asset:angular2/lib/src/core/linker/component_factory${MODULE_SUFFIX}`
});
export class SourceModule {
    constructor(moduleUrl, source) {
        this.moduleUrl = moduleUrl;
        this.source = source;
    }
}
export class NormalizedComponentWithViewDirectives {
    constructor(component, directives, pipes) {
        this.component = component;
        this.directives = directives;
        this.pipes = pipes;
    }
}
export class OfflineCompiler {
    constructor(_directiveNormalizer, _templateParser, _styleCompiler, _viewCompiler, _injectorCompiler, _outputEmitter) {
        this._directiveNormalizer = _directiveNormalizer;
        this._templateParser = _templateParser;
        this._styleCompiler = _styleCompiler;
        this._viewCompiler = _viewCompiler;
        this._injectorCompiler = _injectorCompiler;
        this._outputEmitter = _outputEmitter;
    }
    normalizeDirectiveMetadata(directive) {
        return this._directiveNormalizer.normalizeDirective(directive);
    }
    compile(components, injectorModules) {
        var moduleUrl;
        if (components.length > 0) {
            moduleUrl = _templateModuleUrl(components[0].component.type);
        }
        else if (injectorModules.length > 0) {
            moduleUrl = _templateModuleUrl(injectorModules[0].type);
        }
        else {
            throw new BaseException('No components nor injectorModules given');
        }
        var statements = [];
        var exportedVars = [];
        components.forEach(componentWithDirs => {
            var compMeta = componentWithDirs.component;
            _assertComponent(compMeta);
            var compViewFactoryVar = this._compileComponent(compMeta, componentWithDirs.directives, componentWithDirs.pipes, statements);
            exportedVars.push(compViewFactoryVar);
            var hostMeta = createHostComponentMeta(compMeta.type, compMeta.selector);
            var hostViewFactoryVar = this._compileComponent(hostMeta, [compMeta], [], statements);
            var compFactoryVar = `${compMeta.type.name}NgFactory`;
            statements.push(o.variable(compFactoryVar)
                .set(o.importExpr(_COMPONENT_FACTORY_IDENTIFIER)
                .instantiate([
                o.literal(compMeta.selector),
                o.variable(hostViewFactoryVar),
                o.importExpr(compMeta.type),
                o.METADATA_MAP
            ], o.importType(_COMPONENT_FACTORY_IDENTIFIER, null, [o.TypeModifier.Const])))
                .toDeclStmt(null, [o.StmtModifier.Final]));
            exportedVars.push(compFactoryVar);
        });
        injectorModules.forEach((injectorModuleMeta) => {
            var compileResult = this._injectorCompiler.compileInjector(injectorModuleMeta);
            compileResult.statements.forEach(stmt => statements.push(stmt));
            exportedVars.push(compileResult.injectorFactoryVar);
        });
        return this._codegenSourceModule(moduleUrl, statements, exportedVars);
    }
    compileStylesheet(stylesheetUrl, cssText) {
        var plainStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, false);
        var shimStyles = this._styleCompiler.compileStylesheet(stylesheetUrl, cssText, true);
        return [
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, false), _resolveStyleStatements(plainStyles), [plainStyles.stylesVar]),
            this._codegenSourceModule(_stylesModuleUrl(stylesheetUrl, true), _resolveStyleStatements(shimStyles), [shimStyles.stylesVar])
        ];
    }
    _compileComponent(compMeta, directives, pipes, targetStatements) {
        var styleResult = this._styleCompiler.compileComponent(compMeta);
        var parsedTemplate = this._templateParser.parse(compMeta, compMeta.template.template, directives, pipes, compMeta.type.name);
        var viewResult = this._viewCompiler.compileComponent(compMeta, parsedTemplate, o.variable(styleResult.stylesVar), pipes);
        ListWrapper.addAll(targetStatements, _resolveStyleStatements(styleResult));
        ListWrapper.addAll(targetStatements, _resolveViewStatements(viewResult));
        return viewResult.viewFactoryVar;
    }
    _codegenSourceModule(moduleUrl, statements, exportedVars) {
        return new SourceModule(moduleUrl, this._outputEmitter.emitStatements(moduleUrl, statements, exportedVars));
    }
}
function _resolveViewStatements(compileResult) {
    compileResult.dependencies.forEach((dep) => { dep.factoryPlaceholder.moduleUrl = _templateModuleUrl(dep.comp.type); });
    return compileResult.statements;
}
function _resolveStyleStatements(compileResult) {
    compileResult.dependencies.forEach((dep) => {
        dep.valuePlaceholder.moduleUrl = _stylesModuleUrl(dep.sourceUrl, dep.isShimmed);
    });
    return compileResult.statements;
}
function _templateModuleUrl(type) {
    var moduleUrl = type.moduleUrl;
    var urlWithoutSuffix = moduleUrl.substring(0, moduleUrl.length - MODULE_SUFFIX.length);
    return `${urlWithoutSuffix}.template${MODULE_SUFFIX}`;
}
function _stylesModuleUrl(stylesheetUrl, shim) {
    return shim ? `${stylesheetUrl}.shim${MODULE_SUFFIX}` : `${stylesheetUrl}${MODULE_SUFFIX}`;
}
function _assertComponent(meta) {
    if (!meta.isComponent) {
        throw new BaseException(`Could not compile '${meta.type.name}' because it is not a component.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmbGluZV9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtWDVoZXZQcDQudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vZmZsaW5lX2NvbXBpbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBRUwseUJBQXlCLEVBRXpCLHVCQUF1QixFQUd4QixNQUFNLG9CQUFvQjtPQUVwQixFQUFDLGFBQWEsRUFBZ0IsTUFBTSxnQ0FBZ0M7T0FDcEUsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FPbkQsS0FBSyxDQUFDLE1BQU0scUJBQXFCO09BQ2pDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSw0Q0FBNEM7T0FFcEUsRUFDTCxhQUFhLEVBQ2QsTUFBTSxRQUFRO0FBRWYsSUFBSSw2QkFBNkIsR0FBRyxJQUFJLHlCQUF5QixDQUFDO0lBQ2hFLElBQUksRUFBRSxrQkFBa0I7SUFDeEIsT0FBTyxFQUFFLGdCQUFnQjtJQUN6QixTQUFTLEVBQUUsdURBQXVELGFBQWEsRUFBRTtDQUNsRixDQUFDLENBQUM7QUFFSDtJQUNFLFlBQW1CLFNBQWlCLEVBQVMsTUFBYztRQUF4QyxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUFHLENBQUM7QUFDakUsQ0FBQztBQUVEO0lBQ0UsWUFBbUIsU0FBbUMsRUFDbkMsVUFBc0MsRUFBUyxLQUE0QjtRQUQzRSxjQUFTLEdBQVQsU0FBUyxDQUEwQjtRQUNuQyxlQUFVLEdBQVYsVUFBVSxDQUE0QjtRQUFTLFVBQUssR0FBTCxLQUFLLENBQXVCO0lBQUcsQ0FBQztBQUNwRyxDQUFDO0FBRUQ7SUFDRSxZQUFvQixvQkFBeUMsRUFDekMsZUFBK0IsRUFBVSxjQUE2QixFQUN0RSxhQUEyQixFQUFVLGlCQUFtQyxFQUN4RSxjQUE2QjtRQUg3Qix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXFCO1FBQ3pDLG9C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a0M7SUFDakUsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHO1FBQ3JDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEYsQ0FBQyxDQUFDLENBQUM7SUFDSCxNQUFNLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztBQUNsQyxDQUFDO0FBRUQsNEJBQTRCLElBQXlCO0lBQ25ELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDL0IsSUFBSSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2RixNQUFNLENBQUMsR0FBRyxnQkFBZ0IsWUFBWSxhQUFhLEVBQUUsQ0FBQztBQUN4RCxDQUFDO0FBRUQsMEJBQTBCLGFBQXFCLEVBQUUsSUFBYTtJQUM1RCxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsYUFBYSxRQUFRLGFBQWEsRUFBRSxHQUFHLEdBQUcsYUFBYSxHQUFHLGFBQWEsRUFBRSxDQUFDO0FBQzdGLENBQUM7QUFFRCwwQkFBMEIsSUFBOEI7SUFDdEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLElBQUksYUFBYSxDQUFDLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksa0NBQWtDLENBQUMsQ0FBQztJQUNsRyxDQUFDO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgQ29tcGlsZVBpcGVNZXRhZGF0YSxcbiAgY3JlYXRlSG9zdENvbXBvbmVudE1ldGEsXG4gIENvbXBpbGVJbmplY3Rvck1vZHVsZU1ldGFkYXRhLFxuICBDb21waWxlVHlwZU1ldGFkYXRhXG59IGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5cbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgdW5pbXBsZW1lbnRlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1N0eWxlQ29tcGlsZXIsIFN0eWxlc0NvbXBpbGVEZXBlbmRlbmN5LCBTdHlsZXNDb21waWxlUmVzdWx0fSBmcm9tICcuL3N0eWxlX2NvbXBpbGVyJztcbmltcG9ydCB7Vmlld0NvbXBpbGVyLCBWaWV3Q29tcGlsZVJlc3VsdH0gZnJvbSAnLi92aWV3X2NvbXBpbGVyL3ZpZXdfY29tcGlsZXInO1xuaW1wb3J0IHtJbmplY3RvckNvbXBpbGVyLCBJbmplY3RvckNvbXBpbGVSZXN1bHR9IGZyb20gJy4vdmlld19jb21waWxlci9pbmplY3Rvcl9jb21waWxlcic7XG5pbXBvcnQge1RlbXBsYXRlUGFyc2VyfSBmcm9tICcuL3RlbXBsYXRlX3BhcnNlcic7XG5pbXBvcnQge0RpcmVjdGl2ZU5vcm1hbGl6ZXJ9IGZyb20gJy4vZGlyZWN0aXZlX25vcm1hbGl6ZXInO1xuaW1wb3J0IHtPdXRwdXRFbWl0dGVyfSBmcm9tICcuL291dHB1dC9hYnN0cmFjdF9lbWl0dGVyJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0NvbXBvbmVudEZhY3Rvcnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5cbmltcG9ydCB7XG4gIE1PRFVMRV9TVUZGSVgsXG59IGZyb20gJy4vdXRpbCc7XG5cbnZhciBfQ09NUE9ORU5UX0ZBQ1RPUllfSURFTlRJRklFUiA9IG5ldyBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgbmFtZTogJ0NvbXBvbmVudEZhY3RvcnknLFxuICBydW50aW1lOiBDb21wb25lbnRGYWN0b3J5LFxuICBtb2R1bGVVcmw6IGBhc3NldDphbmd1bGFyMi9saWIvc3JjL2NvcmUvbGlua2VyL2NvbXBvbmVudF9mYWN0b3J5JHtNT0RVTEVfU1VGRklYfWBcbn0pO1xuXG5leHBvcnQgY2xhc3MgU291cmNlTW9kdWxlIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1vZHVsZVVybDogc3RyaW5nLCBwdWJsaWMgc291cmNlOiBzdHJpbmcpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBOb3JtYWxpemVkQ29tcG9uZW50V2l0aFZpZXdEaXJlY3RpdmVzIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXBvbmVudDogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aXZlczogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10sIHB1YmxpYyBwaXBlczogQ29tcGlsZVBpcGVNZXRhZGF0YVtdKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgT2ZmbGluZUNvbXBpbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlyZWN0aXZlTm9ybWFsaXplcjogRGlyZWN0aXZlTm9ybWFsaXplcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdGVtcGxhdGVQYXJzZXI6IFRlbXBsYXRlUGFyc2VyLCBwcml2YXRlIF9zdHlsZUNvbXBpbGVyOiBTdHlsZUNvbXBpbGVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF92aWV3Q29tcGlsZXI6IFZpZXdDb21waWxlciwgcHJpdmF0ZSBfaW5qZWN0b3JDb21waWxlcjogSW5qZWN0b3JDb21waWxlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfb3V0cHV0RW1pdHRlcjogT3V0cHV0RW1pdHRlcikge31cblxuICBub3JtYWxpemVEaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmU6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSk6XG4gICAgICBQcm9taXNlPENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT4ge1xuICAgIHJldHVybiB0aGlzLl9kaXJlY3RpdmVOb3JtYWxpemVyLm5vcm1hbGl6ZURpcmVjdGl2ZShkaXJlY3RpdmUpO1xuICB9XG5cbiAgY29tcGlsZShjb21wb25lbnRzOiBOb3JtYWxpemVkQ29tcG9uZW50V2l0aFZpZXdEaXJlY3RpdmVzW10sXG4gICAgICAgICAgaW5qZWN0b3JNb2R1bGVzOiBDb21waWxlSW5qZWN0b3JNb2R1bGVNZXRhZGF0YVtdKTogU291cmNlTW9kdWxlIHtcbiAgICB2YXIgbW9kdWxlVXJsOiBzdHJpbmc7XG4gICAgaWYgKGNvbXBvbmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgbW9kdWxlVXJsID0gX3RlbXBsYXRlTW9kdWxlVXJsKGNvbXBvbmVudHNbMF0uY29tcG9uZW50LnR5cGUpO1xuICAgIH0gZWxzZSBpZiAoaW5qZWN0b3JNb2R1bGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIG1vZHVsZVVybCA9IF90ZW1wbGF0ZU1vZHVsZVVybChpbmplY3Rvck1vZHVsZXNbMF0udHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdObyBjb21wb25lbnRzIG5vciBpbmplY3Rvck1vZHVsZXMgZ2l2ZW4nKTtcbiAgICB9XG4gICAgdmFyIHN0YXRlbWVudHMgPSBbXTtcbiAgICB2YXIgZXhwb3J0ZWRWYXJzID0gW107XG4gICAgY29tcG9uZW50cy5mb3JFYWNoKGNvbXBvbmVudFdpdGhEaXJzID0+IHtcbiAgICAgIHZhciBjb21wTWV0YSA9IDxDb21waWxlRGlyZWN0aXZlTWV0YWRhdGE+Y29tcG9uZW50V2l0aERpcnMuY29tcG9uZW50O1xuICAgICAgX2Fzc2VydENvbXBvbmVudChjb21wTWV0YSk7XG4gICAgICB2YXIgY29tcFZpZXdGYWN0b3J5VmFyID0gdGhpcy5fY29tcGlsZUNvbXBvbmVudChjb21wTWV0YSwgY29tcG9uZW50V2l0aERpcnMuZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFdpdGhEaXJzLnBpcGVzLCBzdGF0ZW1lbnRzKTtcbiAgICAgIGV4cG9ydGVkVmFycy5wdXNoKGNvbXBWaWV3RmFjdG9yeVZhcik7XG5cbiAgICAgIHZhciBob3N0TWV0YSA9IGNyZWF0ZUhvc3RDb21wb25lbnRNZXRhKGNvbXBNZXRhLnR5cGUsIGNvbXBNZXRhLnNlbGVjdG9yKTtcbiAgICAgIHZhciBob3N0Vmlld0ZhY3RvcnlWYXIgPSB0aGlzLl9jb21waWxlQ29tcG9uZW50KGhvc3RNZXRhLCBbY29tcE1ldGFdLCBbXSwgc3RhdGVtZW50cyk7XG4gICAgICB2YXIgY29tcEZhY3RvcnlWYXIgPSBgJHtjb21wTWV0YS50eXBlLm5hbWV9TmdGYWN0b3J5YDtcbiAgICAgIHN0YXRlbWVudHMucHVzaChvLnZhcmlhYmxlKGNvbXBGYWN0b3J5VmFyKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuc2V0KG8uaW1wb3J0RXhwcihfQ09NUE9ORU5UX0ZBQ1RPUllfSURFTlRJRklFUilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwoY29tcE1ldGEuc2VsZWN0b3IpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnZhcmlhYmxlKGhvc3RWaWV3RmFjdG9yeVZhciksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8uaW1wb3J0RXhwcihjb21wTWV0YS50eXBlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5NRVRBREFUQV9NQVBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmltcG9ydFR5cGUoX0NPTVBPTkVOVF9GQUNUT1JZX0lERU5USUZJRVIsIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uVHlwZU1vZGlmaWVyLkNvbnN0XSkpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gICAgICBleHBvcnRlZFZhcnMucHVzaChjb21wRmFjdG9yeVZhcik7XG4gICAgfSk7XG5cbiAgICBpbmplY3Rvck1vZHVsZXMuZm9yRWFjaCgoaW5qZWN0b3JNb2R1bGVNZXRhKSA9PiB7XG4gICAgICB2YXIgY29tcGlsZVJlc3VsdCA9IHRoaXMuX2luamVjdG9yQ29tcGlsZXIuY29tcGlsZUluamVjdG9yKGluamVjdG9yTW9kdWxlTWV0YSk7XG4gICAgICBjb21waWxlUmVzdWx0LnN0YXRlbWVudHMuZm9yRWFjaChzdG10ID0+IHN0YXRlbWVudHMucHVzaChzdG10KSk7XG4gICAgICBleHBvcnRlZFZhcnMucHVzaChjb21waWxlUmVzdWx0LmluamVjdG9yRmFjdG9yeVZhcik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUobW9kdWxlVXJsLCBzdGF0ZW1lbnRzLCBleHBvcnRlZFZhcnMpO1xuICB9XG5cbiAgY29tcGlsZVN0eWxlc2hlZXQoc3R5bGVzaGVldFVybDogc3RyaW5nLCBjc3NUZXh0OiBzdHJpbmcpOiBTb3VyY2VNb2R1bGVbXSB7XG4gICAgdmFyIHBsYWluU3R5bGVzID0gdGhpcy5fc3R5bGVDb21waWxlci5jb21waWxlU3R5bGVzaGVldChzdHlsZXNoZWV0VXJsLCBjc3NUZXh0LCBmYWxzZSk7XG4gICAgdmFyIHNoaW1TdHlsZXMgPSB0aGlzLl9zdHlsZUNvbXBpbGVyLmNvbXBpbGVTdHlsZXNoZWV0KHN0eWxlc2hlZXRVcmwsIGNzc1RleHQsIHRydWUpO1xuICAgIHJldHVybiBbXG4gICAgICB0aGlzLl9jb2RlZ2VuU291cmNlTW9kdWxlKF9zdHlsZXNNb2R1bGVVcmwoc3R5bGVzaGVldFVybCwgZmFsc2UpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhwbGFpblN0eWxlcyksIFtwbGFpblN0eWxlcy5zdHlsZXNWYXJdKSxcbiAgICAgIHRoaXMuX2NvZGVnZW5Tb3VyY2VNb2R1bGUoX3N0eWxlc01vZHVsZVVybChzdHlsZXNoZWV0VXJsLCB0cnVlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Jlc29sdmVTdHlsZVN0YXRlbWVudHMoc2hpbVN0eWxlcyksIFtzaGltU3R5bGVzLnN0eWxlc1Zhcl0pXG4gICAgXTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbXBpbGVDb21wb25lbnQoY29tcE1ldGE6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSwgcGlwZXM6IENvbXBpbGVQaXBlTWV0YWRhdGFbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKTogc3RyaW5nIHtcbiAgICB2YXIgc3R5bGVSZXN1bHQgPSB0aGlzLl9zdHlsZUNvbXBpbGVyLmNvbXBpbGVDb21wb25lbnQoY29tcE1ldGEpO1xuICAgIHZhciBwYXJzZWRUZW1wbGF0ZSA9IHRoaXMuX3RlbXBsYXRlUGFyc2VyLnBhcnNlKGNvbXBNZXRhLCBjb21wTWV0YS50ZW1wbGF0ZS50ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzLCBwaXBlcywgY29tcE1ldGEudHlwZS5uYW1lKTtcbiAgICB2YXIgdmlld1Jlc3VsdCA9IHRoaXMuX3ZpZXdDb21waWxlci5jb21waWxlQ29tcG9uZW50KGNvbXBNZXRhLCBwYXJzZWRUZW1wbGF0ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8udmFyaWFibGUoc3R5bGVSZXN1bHQuc3R5bGVzVmFyKSwgcGlwZXMpO1xuICAgIExpc3RXcmFwcGVyLmFkZEFsbCh0YXJnZXRTdGF0ZW1lbnRzLCBfcmVzb2x2ZVN0eWxlU3RhdGVtZW50cyhzdHlsZVJlc3VsdCkpO1xuICAgIExpc3RXcmFwcGVyLmFkZEFsbCh0YXJnZXRTdGF0ZW1lbnRzLCBfcmVzb2x2ZVZpZXdTdGF0ZW1lbnRzKHZpZXdSZXN1bHQpKTtcbiAgICByZXR1cm4gdmlld1Jlc3VsdC52aWV3RmFjdG9yeVZhcjtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfY29kZWdlblNvdXJjZU1vZHVsZShtb2R1bGVVcmw6IHN0cmluZywgc3RhdGVtZW50czogby5TdGF0ZW1lbnRbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBvcnRlZFZhcnM6IHN0cmluZ1tdKTogU291cmNlTW9kdWxlIHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZU1vZHVsZShcbiAgICAgICAgbW9kdWxlVXJsLCB0aGlzLl9vdXRwdXRFbWl0dGVyLmVtaXRTdGF0ZW1lbnRzKG1vZHVsZVVybCwgc3RhdGVtZW50cywgZXhwb3J0ZWRWYXJzKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX3Jlc29sdmVWaWV3U3RhdGVtZW50cyhjb21waWxlUmVzdWx0OiBWaWV3Q29tcGlsZVJlc3VsdCk6IG8uU3RhdGVtZW50W10ge1xuICBjb21waWxlUmVzdWx0LmRlcGVuZGVuY2llcy5mb3JFYWNoKFxuICAgICAgKGRlcCkgPT4geyBkZXAuZmFjdG9yeVBsYWNlaG9sZGVyLm1vZHVsZVVybCA9IF90ZW1wbGF0ZU1vZHVsZVVybChkZXAuY29tcC50eXBlKTsgfSk7XG4gIHJldHVybiBjb21waWxlUmVzdWx0LnN0YXRlbWVudHM7XG59XG5cblxuZnVuY3Rpb24gX3Jlc29sdmVTdHlsZVN0YXRlbWVudHMoY29tcGlsZVJlc3VsdDogU3R5bGVzQ29tcGlsZVJlc3VsdCk6IG8uU3RhdGVtZW50W10ge1xuICBjb21waWxlUmVzdWx0LmRlcGVuZGVuY2llcy5mb3JFYWNoKChkZXApID0+IHtcbiAgICBkZXAudmFsdWVQbGFjZWhvbGRlci5tb2R1bGVVcmwgPSBfc3R5bGVzTW9kdWxlVXJsKGRlcC5zb3VyY2VVcmwsIGRlcC5pc1NoaW1tZWQpO1xuICB9KTtcbiAgcmV0dXJuIGNvbXBpbGVSZXN1bHQuc3RhdGVtZW50cztcbn1cblxuZnVuY3Rpb24gX3RlbXBsYXRlTW9kdWxlVXJsKHR5cGU6IENvbXBpbGVUeXBlTWV0YWRhdGEpOiBzdHJpbmcge1xuICB2YXIgbW9kdWxlVXJsID0gdHlwZS5tb2R1bGVVcmw7XG4gIHZhciB1cmxXaXRob3V0U3VmZml4ID0gbW9kdWxlVXJsLnN1YnN0cmluZygwLCBtb2R1bGVVcmwubGVuZ3RoIC0gTU9EVUxFX1NVRkZJWC5sZW5ndGgpO1xuICByZXR1cm4gYCR7dXJsV2l0aG91dFN1ZmZpeH0udGVtcGxhdGUke01PRFVMRV9TVUZGSVh9YDtcbn1cblxuZnVuY3Rpb24gX3N0eWxlc01vZHVsZVVybChzdHlsZXNoZWV0VXJsOiBzdHJpbmcsIHNoaW06IGJvb2xlYW4pOiBzdHJpbmcge1xuICByZXR1cm4gc2hpbSA/IGAke3N0eWxlc2hlZXRVcmx9LnNoaW0ke01PRFVMRV9TVUZGSVh9YCA6IGAke3N0eWxlc2hlZXRVcmx9JHtNT0RVTEVfU1VGRklYfWA7XG59XG5cbmZ1bmN0aW9uIF9hc3NlcnRDb21wb25lbnQobWV0YTogQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhKSB7XG4gIGlmICghbWV0YS5pc0NvbXBvbmVudCkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDb3VsZCBub3QgY29tcGlsZSAnJHttZXRhLnR5cGUubmFtZX0nIGJlY2F1c2UgaXQgaXMgbm90IGEgY29tcG9uZW50LmApO1xuICB9XG59XG4iXX0=