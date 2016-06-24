var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { Injectable } from 'angular2/core';
import { CompileDiDependencyMetadata, CompileTokenMap } from '../compile_metadata';
import { Identifiers, identifierToken } from '../identifiers';
import * as o from '../output/output_ast';
import { ParseSourceSpan, ParseLocation, ParseSourceFile } from '../parse_util';
import { AppProviderParser } from '../provider_parser';
import { InjectMethodVars } from './constants';
import { createDiTokenExpression, convertValueToOutputAst } from './util';
var mainModuleProp = o.THIS_EXPR.prop('mainModule');
var parentInjectorProp = o.THIS_EXPR.prop('parent');
export class InjectorCompileResult {
    constructor(statements, injectorFactoryVar) {
        this.statements = statements;
        this.injectorFactoryVar = injectorFactoryVar;
    }
}
export let InjectorCompiler = class InjectorCompiler {
    compileInjector(injectorModuleMeta) {
        var builder = new _InjectorBuilder(injectorModuleMeta);
        var sourceFileName = isPresent(injectorModuleMeta.moduleUrl) ?
            `in InjectorModule ${injectorModuleMeta.name} in ${injectorModuleMeta.moduleUrl}` :
            `in InjectorModule ${injectorModuleMeta.name}`;
        var sourceFile = new ParseSourceFile('', sourceFileName);
        var providerParser = new AppProviderParser(new ParseSourceSpan(new ParseLocation(sourceFile, null, null, null), new ParseLocation(sourceFile, null, null, null)), injectorModuleMeta.providers);
        providerParser.parse().forEach((provider) => builder.addProvider(provider));
        var injectorClass = builder.build();
        var injectorFactoryVar = `${injectorClass.name}Factory`;
        var injectorFactoryFnVar = `${injectorClass.name}FactoryClosure`;
        var injectorFactoryFn = o.fn(injectorClass.constructorMethod.params, [
            new o.ReturnStatement(o.variable(injectorClass.name)
                .instantiate(injectorClass.constructorMethod.params.map((param) => o.variable(param.name))))
        ], o.importType(Identifiers.Injector))
            .toDeclStmt(injectorFactoryFnVar);
        var injectorFactoryStmt = o.variable(injectorFactoryVar)
            .set(o.importExpr(Identifiers.InjectorFactory, [o.importType(injectorModuleMeta)])
            .instantiate([o.variable(injectorFactoryFnVar)], o.importType(Identifiers.InjectorFactory, [o.importType(injectorModuleMeta)], [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]);
        return new InjectorCompileResult([injectorClass, injectorFactoryFn, injectorFactoryStmt], injectorFactoryVar);
    }
};
InjectorCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], InjectorCompiler);
class _InjectorBuilder {
    constructor(_mainModuleType) {
        this._mainModuleType = _mainModuleType;
        this._instances = new CompileTokenMap();
        this._fields = [];
        this._ctorStmts = [];
        this._getters = [];
        this._needsMainModule = false;
        this._instances.add(identifierToken(Identifiers.Injector), o.THIS_EXPR);
    }
    addProvider(resolvedProvider) {
        var providerValueExpressions = resolvedProvider.providers.map((provider) => this._getProviderValue(provider));
        var propName = `_${resolvedProvider.token.name}_${this._instances.size}`;
        var instance = this._createProviderProperty(propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider, resolvedProvider.eager);
        this._instances.add(resolvedProvider.token, instance);
    }
    build() {
        this._ctorStmts.push(o.SUPER_EXPR.callFn([
            o.variable(parentInjectorProp.name),
            o.literal(this._needsMainModule),
            o.variable(mainModuleProp.name)
        ])
            .toStmt());
        let getMethodStmts = this._instances.keys().map((token) => {
            var providerExpr = this._instances.get(token);
            return new o.IfStmt(InjectMethodVars.token.identical(createDiTokenExpression(token)), [new o.ReturnStatement(providerExpr)]);
        });
        getMethodStmts.push(new o.IfStmt(InjectMethodVars.token.identical(createDiTokenExpression(identifierToken(this._mainModuleType)))
            .and(o.not(mainModuleProp.equals(o.NULL_EXPR))), [new o.ReturnStatement(mainModuleProp)]));
        var methods = [
            new o.ClassMethod('getInternal', [
                new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
                new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
            ], getMethodStmts.concat([new o.ReturnStatement(InjectMethodVars.notFoundResult)]), o.DYNAMIC_TYPE)
        ];
        var ctor = new o.ClassMethod(null, [
            new o.FnParam(parentInjectorProp.name, o.importType(Identifiers.Injector)),
            new o.FnParam(mainModuleProp.name, o.importType(this._mainModuleType))
        ], this._ctorStmts);
        var injClassName = `${this._mainModuleType.name}Injector`;
        return new o.ClassStmt(injClassName, o.importExpr(Identifiers.CodegenInjector, [o.importType(this._mainModuleType)]), this._fields, this._getters, ctor, methods);
    }
    _getProviderValue(provider) {
        var result;
        if (isPresent(provider.useExisting)) {
            result = this._getDependency(new CompileDiDependencyMetadata({ token: provider.useExisting }));
        }
        else if (isPresent(provider.useFactory)) {
            var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
            var depsExpr = deps.map((dep) => this._getDependency(dep));
            result = o.importExpr(provider.useFactory).callFn(depsExpr);
        }
        else if (isPresent(provider.useClass)) {
            var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
            var depsExpr = deps.map((dep) => this._getDependency(dep));
            result =
                o.importExpr(provider.useClass).instantiate(depsExpr, o.importType(provider.useClass));
        }
        else {
            result = convertValueToOutputAst(provider.useValue);
        }
        if (isPresent(provider.useProperty)) {
            result = result.prop(provider.useProperty);
        }
        return result;
    }
    _createProviderProperty(propName, provider, providerValueExpressions, isMulti, isEager) {
        var resolvedProviderValueExpr;
        var type;
        if (isMulti) {
            resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
            type = new o.ArrayType(o.DYNAMIC_TYPE);
        }
        else {
            resolvedProviderValueExpr = providerValueExpressions[0];
            type = providerValueExpressions[0].type;
        }
        if (isBlank(type)) {
            type = o.DYNAMIC_TYPE;
        }
        if (isEager) {
            this._fields.push(new o.ClassField(propName, type));
            this._ctorStmts.push(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
        }
        else {
            var internalField = `_${propName}`;
            this._fields.push(new o.ClassField(internalField, type));
            // Note: Equals is important for JS so that it also checks the undefined case!
            var getterStmts = [
                new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(), [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]),
                new o.ReturnStatement(o.THIS_EXPR.prop(internalField))
            ];
            this._getters.push(new o.ClassGetter(propName, getterStmts, type));
        }
        return o.THIS_EXPR.prop(propName);
    }
    _getDependency(dep) {
        var result = null;
        if (dep.isValue) {
            result = o.literal(dep.value);
        }
        if (!dep.isSkipSelf) {
            if (isBlank(result)) {
                result = this._instances.get(dep.token);
            }
            if (isBlank(result) && dep.token.equalsTo(identifierToken(this._mainModuleType))) {
                this._needsMainModule = true;
                result = mainModuleProp;
            }
        }
        if (isBlank(result)) {
            var args = [createDiTokenExpression(dep.token)];
            if (dep.isOptional) {
                args.push(o.NULL_EXPR);
            }
            result = parentInjectorProp.callMethod('get', args);
        }
        return result;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5qZWN0b3JfY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVg1aGV2UHA0LnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvdmlld19jb21waWxlci9pbmplY3Rvcl9jb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUMsTUFBTSwwQkFBMEI7T0FDcEQsRUFBQyxVQUFVLEVBQUMsTUFBTSxlQUFlO09BQ2pDLEVBRUwsMkJBQTJCLEVBRTNCLGVBQWUsRUFHaEIsTUFBTSxxQkFBcUI7T0FDckIsRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFDLE1BQU0sZ0JBQWdCO09BQ3BELEtBQUssQ0FBQyxNQUFNLHNCQUFzQjtPQUNsQyxFQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFDLE1BQU0sZUFBZTtPQUN0RSxFQUFDLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CO09BRzdDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxhQUFhO09BQ3JDLEVBQUMsdUJBQXVCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxRQUFRO0FBRXZFLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BELElBQUksa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFcEQ7SUFDRSxZQUFtQixVQUF5QixFQUFTLGtCQUEwQjtRQUE1RCxlQUFVLEdBQVYsVUFBVSxDQUFlO1FBQVMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFRO0lBQUcsQ0FBQztBQUNyRixDQUFDO0FBR0Q7SUFDRSxlQUFlLENBQUMsa0JBQWlEO1FBQy9ELElBQUksT0FBTyxHQUFHLElBQUksZ0JBQWdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN2RCxJ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QUFRLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQ2pGLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDL0UsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTTtnQkFDRixDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxHQUFHLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFDRCxNQUFNLENBQUMsTUFB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Q0FBQztZQUMxQyxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7Z0JBQzdCLE1BQU0sR0FBRyxjQUFjLENBQUM7WUFDMUIsQ0FBQztRQUNILENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksSUFBSSxHQUFHLENBQUMsdUJBQXVCLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDaEQsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pCLENBQUM7WUFDRCxNQUFNLEdBQUcsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0FBQ0gsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmt9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQ29tcGlsZUluamVjdG9yTW9kdWxlTWV0YWRhdGEsXG4gIENvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YSxcbiAgQ29tcGlsZVRva2VuTWV0YWRhdGEsXG4gIENvbXBpbGVUb2tlbk1hcCxcbiAgQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEsXG4gIENvbXBpbGVUeXBlTWV0YWRhdGFcbn0gZnJvbSAnLi4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQge0lkZW50aWZpZXJzLCBpZGVudGlmaWVyVG9rZW59IGZyb20gJy4uL2lkZW50aWZpZXJzJztcbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtQYXJzZVNvdXJjZVNwYW4sIFBhcnNlTG9jYXRpb24sIFBhcnNlU291cmNlRmlsZX0gZnJvbSAnLi4vcGFyc2VfdXRpbCc7XG5pbXBvcnQge0FwcFByb3ZpZGVyUGFyc2VyfSBmcm9tICcuLi9wcm92aWRlcl9wYXJzZXInO1xuaW1wb3J0IHtQcm92aWRlckFzdH0gZnJvbSAnLi4vdGVtcGxhdGVfYXN0JztcblxuaW1wb3J0IHtJbmplY3RNZXRob2RWYXJzfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2NyZWF0ZURpVG9rZW5FeHByZXNzaW9uLCBjb252ZXJ0VmFsdWVUb091dHB1dEFzdH0gZnJvbSAnLi91dGlsJztcblxudmFyIG1haW5Nb2R1bGVQcm9wID0gby5USElTX0VYUFIucHJvcCgnbWFpbk1vZHVsZScpO1xudmFyIHBhcmVudEluamVjdG9yUHJvcCA9IG8uVEhJU19FWFBSLnByb3AoJ3BhcmVudCcpO1xuXG5leHBvcnQgY2xhc3MgSW5qZWN0b3JDb21waWxlUmVzdWx0IHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIHB1YmxpYyBpbmplY3RvckZhY3RvcnlWYXI6IHN0cmluZykge31cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEluamVjdG9yQ29tcGlsZXIge1xuICBjb21waWxlSW5qZWN0b3IoaW5qZWN0b3JNb2R1bGVNZXRhOiBDb21waWxlSW5qZWN0b3JNb2R1bGVNZXRhZGF0YSk6IEluamVjdG9yQ29tcGlsZVJlc3VsdCB7XG4gICAgdmFyIGJ1aWxkZXIgPSBuZXcgX0luamVjdG9yQnVpbGRlcihpbmplY3Rvck1vZHVsZU1ldGEpO1xuICAgIHZhciBzb3VyY2VGaWxlTmFtZSA9XG4gICAgICAgIGlzUHJlc2VudChpbmplY3Rvck1vZHVsZU1ldGEubW9kdWxlVXJsKSA/XG4gICAgICAgICAgICBgaW4gSW5qZWN0b3JNb2R1bGUgJHtpbmplY3Rvck1vZHVsZU1ldGEubmFtZX0gaW4gJHtpbmplY3Rvck1vZHVsZU1ldGEubW9kdWxlVXJsfWAgOlxuICAgICAgICAgICAgYGluIEluamVjdG9yTW9kdWxlICR7aW5qZWN0b3JNb2R1bGVNZXRhLm5hbWV9YDtcbiAgICB2YXIgc291cmNlRmlsZSA9IG5ldyBQYXJzZVNvdXJjZUZpbGUoJycsIHNvdXJjZUZpbGVOYW1lKTtcbiAgICB2YXIgcHJvdmlkZXJQYXJzZXIgPVxuICAgICAgICBuZXcgQXBwUHJvdmlkZXJQYXJzZXIobmV3IFBhcnNlU291cmNlU3BhbihuZXcgUGFyc2VMb2NhdGlvbihzb3VyY2VGaWxlLCBudWxsLCBudWxsLCBudWxsKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBhcnNlTG9jYXRpb24oc291cmNlRmlsZSwgbnVsbCwgbnVsbCwgbnVsbCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5qZWN0b3JNb2R1bGVNZXRhLnByb3ZpZGVycyk7XG4gICAgcHJvdmlkZXJQYXJzZXIucGFyc2UoKS5mb3JFYWNoKChwcm92aWRlcikgPT4gYnVpbGRlci5hZGRQcm92aWRlcihwcm92aWRlcikpO1xuICAgIHZhciBpbmplY3RvckNsYXNzID0gYnVpbGRlci5idWlsZCgpO1xuICAgIHZhciBpbmplY3RvckZhY3RvcnlWYXIgPSBgJHtpbmplY3RvckNsYXNzLm5hbWV9RmFjdG9yeWA7XG4gICAgdmFyIGluamVjdG9yRmFjdG9yeUZuVmFyID0gYCR7aW5qZWN0b3JDbGFzcy5uYW1lfUZhY3RvcnlDbG9zdXJlYDtcbiAgICB2YXIgaW5qZWN0b3JGYWN0b3J5Rm4gPVxuICAgICAgICBvLmZuKGluamVjdG9yQ2xhc3MuY29uc3RydWN0b3JNZXRob2QucGFyYW1zLFxuICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgIG5ldyBvLlJldHVyblN0YXRlbWVudChvLnZhcmlhYmxlKGluamVjdG9yQ2xhc3MubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKGluamVjdG9yQ2xhc3MuY29uc3RydWN0b3JNZXRob2QucGFyYW1zLm1hcChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChwYXJhbSkgPT4gby52YXJpYWJsZShwYXJhbS5uYW1lKSkpKVxuICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkluamVjdG9yKSlcbiAgICAgICAgICAgIC50b0RlY2xTdG10KGluamVjdG9yRmFjdG9yeUZuVmFyKTtcbiAgICB2YXIgaW5qZWN0b3JGYWN0b3J5U3RtdCA9XG4gICAgICAgIG8udmFyaWFibGUoaW5qZWN0b3JGYWN0b3J5VmFyKVxuICAgICAgICAgICAgLnNldChvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuSW5qZWN0b3JGYWN0b3J5LCBbby5pbXBvcnRUeXBlKGluamVjdG9yTW9kdWxlTWV0YSldKVxuICAgICAgICAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKFxuICAgICAgICAgICAgICAgICAgICAgICAgIFtvLnZhcmlhYmxlKGluamVjdG9yRmFjdG9yeUZuVmFyKV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkluamVjdG9yRmFjdG9yeSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uaW1wb3J0VHlwZShpbmplY3Rvck1vZHVsZU1ldGEpXSwgW28uVHlwZU1vZGlmaWVyLkNvbnN0XSkpKVxuICAgICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSk7XG5cbiAgICByZXR1cm4gbmV3IEluamVjdG9yQ29tcGlsZVJlc3VsdChbaW5qZWN0b3JDbGFzcywgaW5qZWN0b3JGYWN0b3J5Rm4sIGluamVjdG9yRmFjdG9yeVN0bXRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yRmFjdG9yeVZhcik7XG4gIH1cbn1cblxuXG5jbGFzcyBfSW5qZWN0b3JCdWlsZGVyIHtcbiAgcHJpdmF0ZSBfaW5zdGFuY2VzID0gbmV3IENvbXBpbGVUb2tlbk1hcDxvLkV4cHJlc3Npb24+KCk7XG4gIHByaXZhdGUgX2ZpZWxkczogby5DbGFzc0ZpZWxkW10gPSBbXTtcbiAgcHJpdmF0ZSBfY3RvclN0bXRzOiBvLlN0YXRlbWVudFtdID0gW107XG4gIHByaXZhdGUgX2dldHRlcnM6IG8uQ2xhc3NHZXR0ZXJbXSA9IFtdO1xuICBwcml2YXRlIF9uZWVkc01haW5Nb2R1bGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tYWluTW9kdWxlVHlwZTogQ29tcGlsZUluamVjdG9yTW9kdWxlTWV0YWRhdGEpIHtcbiAgICB0aGlzLl9pbnN0YW5jZXMuYWRkKGlkZW50aWZpZXJUb2tlbihJZGVudGlmaWVycy5JbmplY3RvciksIG8uVEhJU19FWFBSKTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHJlc29sdmVkUHJvdmlkZXI6IFByb3ZpZGVyQXN0KSB7XG4gICAgdmFyIHByb3ZpZGVyVmFsdWVFeHByZXNzaW9ucyA9XG4gICAgICAgIHJlc29sdmVkUHJvdmlkZXIucHJvdmlkZXJzLm1hcCgocHJvdmlkZXIpID0+IHRoaXMuX2dldFByb3ZpZGVyVmFsdWUocHJvdmlkZXIpKTtcbiAgICB2YXIgcHJvcE5hbWUgPSBgXyR7cmVzb2x2ZWRQcm92aWRlci50b2tlbi5uYW1lfV8ke3RoaXMuX2luc3RhbmNlcy5zaXplfWA7XG4gICAgdmFyIGluc3RhbmNlID1cbiAgICAgICAgdGhpcy5fY3JlYXRlUHJvdmlkZXJQcm9wZXJ0eShwcm9wTmFtZSwgcmVzb2x2ZWRQcm92aWRlciwgcHJvdmlkZXJWYWx1ZUV4cHJlc3Npb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkUHJvdmlkZXIubXVsdGlQcm92aWRlciwgcmVzb2x2ZWRQcm92aWRlci5lYWdlcik7XG4gICAgdGhpcy5faW5zdGFuY2VzLmFkZChyZXNvbHZlZFByb3ZpZGVyLnRva2VuLCBpbnN0YW5jZSk7XG4gIH1cblxuICBidWlsZCgpOiBvLkNsYXNzU3RtdCB7XG4gICAgdGhpcy5fY3RvclN0bXRzLnB1c2goby5TVVBFUl9FWFBSLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLnZhcmlhYmxlKHBhcmVudEluamVjdG9yUHJvcC5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh0aGlzLl9uZWVkc01haW5Nb2R1bGUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby52YXJpYWJsZShtYWluTW9kdWxlUHJvcC5uYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50b1N0bXQoKSk7XG5cbiAgICBsZXQgZ2V0TWV0aG9kU3RtdHM6IG8uU3RhdGVtZW50W10gPSB0aGlzLl9pbnN0YW5jZXMua2V5cygpLm1hcCgodG9rZW4pID0+IHtcbiAgICAgIHZhciBwcm92aWRlckV4cHIgPSB0aGlzLl9pbnN0YW5jZXMuZ2V0KHRva2VuKTtcbiAgICAgIHJldHVybiBuZXcgby5JZlN0bXQoSW5qZWN0TWV0aG9kVmFycy50b2tlbi5pZGVudGljYWwoY3JlYXRlRGlUb2tlbkV4cHJlc3Npb24odG9rZW4pKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW25ldyBvLlJldHVyblN0YXRlbWVudChwcm92aWRlckV4cHIpXSk7XG4gICAgfSk7XG4gICAgZ2V0TWV0aG9kU3RtdHMucHVzaChuZXcgby5JZlN0bXQoXG4gICAgICAgIEluamVjdE1ldGhvZFZhcnMudG9rZW4uaWRlbnRpY2FsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKGlkZW50aWZpZXJUb2tlbih0aGlzLl9tYWluTW9kdWxlVHlwZSkpKVxuICAgICAgICAgICAgLmFuZChvLm5vdChtYWluTW9kdWxlUHJvcC5lcXVhbHMoby5OVUxMX0VYUFIpKSksXG4gICAgICAgIFtuZXcgby5SZXR1cm5TdGF0ZW1lbnQobWFpbk1vZHVsZVByb3ApXSkpO1xuXG4gICAgdmFyIG1ldGhvZHMgPSBbXG4gICAgICBuZXcgby5DbGFzc01ldGhvZChcbiAgICAgICAgICAnZ2V0SW50ZXJuYWwnLFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG5ldyBvLkZuUGFyYW0oSW5qZWN0TWV0aG9kVmFycy50b2tlbi5uYW1lLCBvLkRZTkFNSUNfVFlQRSksXG4gICAgICAgICAgICBuZXcgby5GblBhcmFtKEluamVjdE1ldGhvZFZhcnMubm90Rm91bmRSZXN1bHQubmFtZSwgby5EWU5BTUlDX1RZUEUpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBnZXRNZXRob2RTdG10cy5jb25jYXQoW25ldyBvLlJldHVyblN0YXRlbWVudChJbmplY3RNZXRob2RWYXJzLm5vdEZvdW5kUmVzdWx0KV0pLFxuICAgICAgICAgIG8uRFlOQU1JQ19UWVBFKVxuICAgIF07XG5cbiAgICB2YXIgY3RvciA9IG5ldyBvLkNsYXNzTWV0aG9kKFxuICAgICAgICBudWxsLFxuICAgICAgICBbXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbShwYXJlbnRJbmplY3RvclByb3AubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkluamVjdG9yKSksXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbShtYWluTW9kdWxlUHJvcC5uYW1lLCBvLmltcG9ydFR5cGUodGhpcy5fbWFpbk1vZHVsZVR5cGUpKVxuICAgICAgICBdLFxuICAgICAgICB0aGlzLl9jdG9yU3RtdHMpO1xuXG4gICAgdmFyIGluakNsYXNzTmFtZSA9IGAke3RoaXMuX21haW5Nb2R1bGVUeXBlLm5hbWV9SW5qZWN0b3JgO1xuICAgIHJldHVybiBuZXcgby5DbGFzc1N0bXQoaW5qQ2xhc3NOYW1lLCBvLmltcG9ydEV4cHIoSWRlbnRpZmllcnMuQ29kZWdlbkluamVjdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW28uaW1wb3J0VHlwZSh0aGlzLl9tYWluTW9kdWxlVHlwZSldKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpZWxkcywgdGhpcy5fZ2V0dGVycywgY3RvciwgbWV0aG9kcyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRQcm92aWRlclZhbHVlKHByb3ZpZGVyOiBDb21waWxlUHJvdmlkZXJNZXRhZGF0YSk6IG8uRXhwcmVzc2lvbiB7XG4gICAgdmFyIHJlc3VsdDogby5FeHByZXNzaW9uO1xuICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRXhpc3RpbmcpKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9nZXREZXBlbmRlbmN5KG5ldyBDb21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe3Rva2VuOiBwcm92aWRlci51c2VFeGlzdGluZ30pKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgdmFyIGRlcHMgPSBpc1ByZXNlbnQocHJvdmlkZXIuZGVwcykgPyBwcm92aWRlci5kZXBzIDogcHJvdmlkZXIudXNlRmFjdG9yeS5kaURlcHM7XG4gICAgICB2YXIgZGVwc0V4cHIgPSBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KGRlcCkpO1xuICAgICAgcmVzdWx0ID0gby5pbXBvcnRFeHByKHByb3ZpZGVyLnVzZUZhY3RvcnkpLmNhbGxGbihkZXBzRXhwcik7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgICB2YXIgZGVwcyA9IGlzUHJlc2VudChwcm92aWRlci5kZXBzKSA/IHByb3ZpZGVyLmRlcHMgOiBwcm92aWRlci51c2VDbGFzcy5kaURlcHM7XG4gICAgICB2YXIgZGVwc0V4cHIgPSBkZXBzLm1hcCgoZGVwKSA9PiB0aGlzLl9nZXREZXBlbmRlbmN5KGRlcCkpO1xuICAgICAgcmVzdWx0ID1cbiAgICAgICAgICBvLmltcG9ydEV4cHIocHJvdmlkZXIudXNlQ2xhc3MpLmluc3RhbnRpYXRlKGRlcHNFeHByLCBvLmltcG9ydFR5cGUocHJvdmlkZXIudXNlQ2xhc3MpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gY29udmVydFZhbHVlVG9PdXRwdXRBc3QocHJvdmlkZXIudXNlVmFsdWUpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHByb3ZpZGVyLnVzZVByb3BlcnR5KSkge1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LnByb3AocHJvdmlkZXIudXNlUHJvcGVydHkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cblxuICBwcml2YXRlIF9jcmVhdGVQcm92aWRlclByb3BlcnR5KHByb3BOYW1lOiBzdHJpbmcsIHByb3ZpZGVyOiBQcm92aWRlckFzdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnM6IG8uRXhwcmVzc2lvbltdLCBpc011bHRpOiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRWFnZXI6IGJvb2xlYW4pOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciByZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByO1xuICAgIHZhciB0eXBlO1xuICAgIGlmIChpc011bHRpKSB7XG4gICAgICByZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByID0gby5saXRlcmFsQXJyKHByb3ZpZGVyVmFsdWVFeHByZXNzaW9ucyk7XG4gICAgICB0eXBlID0gbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwciA9IHByb3ZpZGVyVmFsdWVFeHByZXNzaW9uc1swXTtcbiAgICAgIHR5cGUgPSBwcm92aWRlclZhbHVlRXhwcmVzc2lvbnNbMF0udHlwZTtcbiAgICB9XG4gICAgaWYgKGlzQmxhbmsodHlwZSkpIHtcbiAgICAgIHR5cGUgPSBvLkRZTkFNSUNfVFlQRTtcbiAgICB9XG4gICAgaWYgKGlzRWFnZXIpIHtcbiAgICAgIHRoaXMuX2ZpZWxkcy5wdXNoKG5ldyBvLkNsYXNzRmllbGQocHJvcE5hbWUsIHR5cGUpKTtcbiAgICAgIHRoaXMuX2N0b3JTdG10cy5wdXNoKG8uVEhJU19FWFBSLnByb3AocHJvcE5hbWUpLnNldChyZXNvbHZlZFByb3ZpZGVyVmFsdWVFeHByKS50b1N0bXQoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbnRlcm5hbEZpZWxkID0gYF8ke3Byb3BOYW1lfWA7XG4gICAgICB0aGlzLl9maWVsZHMucHVzaChuZXcgby5DbGFzc0ZpZWxkKGludGVybmFsRmllbGQsIHR5cGUpKTtcbiAgICAgIC8vIE5vdGU6IEVxdWFscyBpcyBpbXBvcnRhbnQgZm9yIEpTIHNvIHRoYXQgaXQgYWxzbyBjaGVja3MgdGhlIHVuZGVmaW5lZCBjYXNlIVxuICAgICAgdmFyIGdldHRlclN0bXRzID0gW1xuICAgICAgICBuZXcgby5JZlN0bXQoby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5pc0JsYW5rKCksXG4gICAgICAgICAgICAgICAgICAgICBbby5USElTX0VYUFIucHJvcChpbnRlcm5hbEZpZWxkKS5zZXQocmVzb2x2ZWRQcm92aWRlclZhbHVlRXhwcikudG9TdG10KCldKSxcbiAgICAgICAgbmV3IG8uUmV0dXJuU3RhdGVtZW50KG8uVEhJU19FWFBSLnByb3AoaW50ZXJuYWxGaWVsZCkpXG4gICAgICBdO1xuICAgICAgdGhpcy5fZ2V0dGVycy5wdXNoKG5ldyBvLkNsYXNzR2V0dGVyKHByb3BOYW1lLCBnZXR0ZXJTdG10cywgdHlwZSkpO1xuICAgIH1cbiAgICByZXR1cm4gby5USElTX0VYUFIucHJvcChwcm9wTmFtZSk7XG4gIH1cblxuICBwcml2YXRlIF9nZXREZXBlbmRlbmN5KGRlcDogQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKTogby5FeHByZXNzaW9uIHtcbiAgICB2YXIgcmVzdWx0ID0gbnVsbDtcbiAgICBpZiAoZGVwLmlzVmFsdWUpIHtcbiAgICAgIHJlc3VsdCA9IG8ubGl0ZXJhbChkZXAudmFsdWUpO1xuICAgIH1cbiAgICBpZiAoIWRlcC5pc1NraXBTZWxmKSB7XG4gICAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2luc3RhbmNlcy5nZXQoZGVwLnRva2VuKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0JsYW5rKHJlc3VsdCkgJiYgZGVwLnRva2VuLmVxdWFsc1RvKGlkZW50aWZpZXJUb2tlbih0aGlzLl9tYWluTW9kdWxlVHlwZSkpKSB7XG4gICAgICAgIHRoaXMuX25lZWRzTWFpbk1vZHVsZSA9IHRydWU7XG4gICAgICAgIHJlc3VsdCA9IG1haW5Nb2R1bGVQcm9wO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICB2YXIgYXJncyA9IFtjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihkZXAudG9rZW4pXTtcbiAgICAgIGlmIChkZXAuaXNPcHRpb25hbCkge1xuICAgICAgICBhcmdzLnB1c2goby5OVUxMX0VYUFIpO1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gcGFyZW50SW5qZWN0b3JQcm9wLmNhbGxNZXRob2QoJ2dldCcsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59XG4iXX0=