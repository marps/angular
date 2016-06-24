import * as o from './output_ast';
import { isPresent, isBlank, isArray } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { EmitterVisitorContext, AbstractEmitterVisitor, CATCH_ERROR_VAR, CATCH_STACK_VAR } from './abstract_emitter';
import { getImportModulePath, ImportEnv } from './path_util';
var _debugModuleUrl = 'asset://debug/lib';
export function debugOutputAstAsTypeScript(ast) {
    var converter = new _TsEmitterVisitor(_debugModuleUrl);
    var ctx = EmitterVisitorContext.createRoot([]);
    var asts;
    if (isArray(ast)) {
        asts = ast;
    }
    else {
        asts = [ast];
    }
    asts.forEach((ast) => {
        if (ast instanceof o.Statement) {
            ast.visitStatement(converter, ctx);
        }
        else if (ast instanceof o.Expression) {
            ast.visitExpression(converter, ctx);
        }
        else if (ast instanceof o.Type) {
            ast.visitType(converter, ctx);
        }
        else {
            throw new BaseException(`Don't know how to print debug info for ${ast}`);
        }
    });
    return ctx.toSource();
}
export class TypeScriptEmitter {
    constructor() {
    }
    emitStatements(moduleUrl, stmts, exportedVars) {
        var converter = new _TsEmitterVisitor(moduleUrl);
        var ctx = EmitterVisitorContext.createRoot(exportedVars);
        converter.visitAllStatements(stmts, ctx);
        var srcParts = [];
        converter.importsWithPrefixes.forEach((prefix, importedModuleUrl) => {
            // Note: can't write the real word for import as it screws up system.js auto detection...
            srcParts.push(`imp` +
                `ort * as ${prefix} from '${getImportModulePath(moduleUrl, importedModuleUrl, ImportEnv.JS)}';`);
        });
        srcParts.push(ctx.toSource());
        return srcParts.join('\n');
    }
}
class _TsEmitterVisitor extends AbstractEmitterVisitor {
    constructor(_moduleUrl) {
        super(false);
        this._moduleUrl = _moduleUrl;
        this.importsWithPrefixes = new Map();
    }
    visitExternalExpr(ast, ctx) {
        this._visitIdentifier(ast.value, ast.typeParams, ctx);
        return null;
    }
    visitDeclareVarStmt(stmt, ctx) {
        if (ctx.isExportedVar(stmt.name)) {
            ctx.print(`export `);
        }
        if (stmt.hasModifier(o.StmtModifier.Final)) {
            ctx.print(`const`);
        }
        else {
            ctx.print(`var`);
        }
        ctx.print(` ${stmt.name}`);
        if (isPresent(stmt.type)) {
            ctx.print(`:`);
            stmt.type.visitType(this, ctx);
        }
        ctx.print(` = `);
        stmt.value.visitExpression(this, ctx);
        ctx.println(`;`);
        return null;
    }
    visitCastExpr(ast, ctx) {
        ctx.print(`(<`);
        ast.type.visitType(this, ctx);
        ctx.print(`>`);
        ast.value.visitExpression(this, ctx);
        ctx.print(`)`);
        return null;
    }
    visitDeclareClassStmt(stmt, ctx) {
        ctx.pushClass(stmt);
        if (ctx.isExportedVar(stmt.name)) {
            ctx.print(`export `);
        }
        ctx.print(`class ${stmt.name}`);
        if (isPresent(stmt.parent)) {
            ctx.print(` extends `);
            stmt.parent.visitExpression(this, ctx);
        }
        ctx.println(` {`);
        ctx.incIndent();
        stmt.fields.forEach((field) => this._visitClassField(field, ctx));
        if (isPresent(stmt.constructorMethod)) {
            this._visitClassConstructor(stmt, ctx);
        }
        stmt.getters.forEach((getter) => this._visitClassGetter(getter, ctx));
        stmt.methods.forEach((method) => this._visitClassMethod(method, ctx));
        ctx.decIndent();
        ctx.println(`}`);
        ctx.popClass();
        return null;
    }
    _visitClassField(field, ctx) {
        if (field.hasModifier(o.StmtModifier.Private)) {
            ctx.print(`private `);
        }
        ctx.print(field.name);
        if (isPresent(field.type)) {
            ctx.print(`:`);
            field.type.visitType(this, ctx);
        }
        ctx.println(`;`);
    }
    _visitClassGetter(getter, ctx) {
        if (getter.hasModifier(o.StmtModifier.Private)) {
            ctx.print(`private `);
        }
        ctx.print(`get ${getter.name}()`);
        if (isPresent(getter.type)) {
            ctx.print(`:`);
            getter.type.visitType(this, ctx);
        }
        ctx.println(` {`);
        ctx.incIndent();
        this.visitAllStatements(getter.body, ctx);
        ctx.decIndent();
        ctx.println(`}`);
    }
    _visitClassConstructor(stmt, ctx) {
        ctx.print(`constructor(`);
        this._visitParams(stmt.constructorMethod.params, ctx);
        ctx.println(`) {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.constructorMethod.body, ctx);
        ctx.decIndent();
        ctx.println(`}`);
    }
    _visitClassMethod(method, ctx) {
        if (method.hasModifier(o.StmtModifier.Private)) {
            ctx.print(`private `);
        }
        ctx.print(`${method.name}(`);
        this._visitParams(method.params, ctx);
        ctx.print(`):`);
        if (isPresent(method.type)) {
            method.type.visitType(this, ctx);
        }
        else {
            ctx.print(`void`);
        }
        ctx.println(` {`);
        ctx.incIndent();
        this.visitAllStatements(method.body, ctx);
        ctx.decIndent();
        ctx.println(`}`);
    }
    visitFunctionExpr(ast, ctx) {
        ctx.print(`(`);
        this._visitParams(ast.params, ctx);
        ctx.print(`):`);
        if (isPresent(ast.type)) {
            ast.type.visitType(this, ctx);
        }
        else {
            ctx.print(`void`);
        }
        ctx.println(` => {`);
        ctx.incIndent();
        this.visitAllStatements(ast.statements, ctx);
        ctx.decIndent();
        ctx.print(`}`);
        return null;
    }
    visitDeclareFunctionStmt(stmt, ctx) {
        if (ctx.isExportedVar(stmt.name)) {
            ctx.print(`export `);
        }
        ctx.print(`function ${stmt.name}(`);
        this._visitParams(stmt.params, ctx);
        ctx.print(`):`);
        if (isPresent(stmt.type)) {
            stmt.type.visitType(this, ctx);
        }
        else {
            ctx.print(`void`);
        }
        ctx.println(` {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.statements, ctx);
        ctx.decIndent();
        ctx.println(`}`);
        return null;
    }
    visitTryCatchStmt(stmt, ctx) {
        ctx.println(`try {`);
        ctx.incIndent();
        this.visitAllStatements(stmt.bodyStmts, ctx);
        ctx.decIndent();
        ctx.println(`} catch (${CATCH_ERROR_VAR.name}) {`);
        ctx.incIndent();
        var catchStmts = [
            CATCH_STACK_VAR.set(CATCH_ERROR_VAR.prop('stack'))
                .toDeclStmt(null, [o.StmtModifier.Final])
        ].concat(stmt.catchStmts);
        this.visitAllStatements(catchStmts, ctx);
        ctx.decIndent();
        ctx.println(`}`);
        return null;
    }
    visitBuiltintType(type, ctx) {
        var typeStr;
        switch (type.name) {
            case o.BuiltinTypeName.Bool:
                typeStr = 'boolean';
                break;
            case o.BuiltinTypeName.Dynamic:
                typeStr = 'any';
                break;
            case o.BuiltinTypeName.Function:
                typeStr = 'Function';
                break;
            case o.BuiltinTypeName.Number:
                typeStr = 'number';
                break;
            case o.BuiltinTypeName.Int:
                typeStr = 'number';
                break;
            case o.BuiltinTypeName.String:
                typeStr = 'string';
                break;
            default:
                throw new BaseException(`Unsupported builtin type ${type.name}`);
        }
        ctx.print(typeStr);
        return null;
    }
    visitExternalType(ast, ctx) {
        this._visitIdentifier(ast.value, ast.typeParams, ctx);
        return null;
    }
    visitArrayType(type, ctx) {
        if (isPresent(type.of)) {
            type.of.visitType(this, ctx);
        }
        else {
            ctx.print(`any`);
        }
        ctx.print(`[]`);
        return null;
    }
    visitMapType(type, ctx) {
        ctx.print(`{[key: string]:`);
        if (isPresent(type.valueType)) {
            type.valueType.visitType(this, ctx);
        }
        else {
            ctx.print(`any`);
        }
        ctx.print(`}`);
        return null;
    }
    getBuiltinMethodName(method) {
        var name;
        switch (method) {
            case o.BuiltinMethod.ConcatArray:
                name = 'concat';
                break;
            case o.BuiltinMethod.SubscribeObservable:
                name = 'subscribe';
                break;
            case o.BuiltinMethod.bind:
                name = 'bind';
                break;
            default:
                throw new BaseException(`Unknown builtin method: ${method}`);
        }
        return name;
    }
    _visitParams(params, ctx) {
        this.visitAllObjects((param) => {
            ctx.print(param.name);
            if (isPresent(param.type)) {
                ctx.print(`:`);
                param.type.visitType(this, ctx);
            }
        }, params, ctx, ',');
    }
    _visitIdentifier(value, typeParams, ctx) {
        if (isPresent(value.moduleUrl) && value.moduleUrl != this._moduleUrl) {
            var prefix = this.importsWithPrefixes.get(value.moduleUrl);
            if (isBlank(prefix)) {
                prefix = `import${this.importsWithPrefixes.size}`;
                this.importsWithPrefixes.set(value.moduleUrl, prefix);
            }
            ctx.print(`${prefix}.`);
        }
        ctx.print(value.name);
        if (isPresent(typeParams) && typeParams.length > 0) {
            ctx.print(`<`);
            this.visitAllObjects((type) => type.visitType(this, ctx), typeParams, ctx, ',');
            ctx.print(`>`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNfZW1pdHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtWDVoZXZQcDQudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9vdXRwdXQvdHNfZW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FBTyxLQUFLLENBQUMsTUFBTSxjQUFjO09BQzFCLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFLUCxPQUFPLEVBQ1IsTUFBTSwwQkFBMEI7T0FFMUIsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFFTCxxQkFBcUIsRUFDckIsc0JBQXNCLEVBQ3RCLGVBQWUsRUFDZixlQUFlLEVBQ2hCLE1BQU0sb0JBQW9CO09BQ3BCLEVBQUMsbUJBQW1CLEVBQUUsU0FBUyxFQUFDLE1BQU0sYUFBYTtBQUUxRCxJQUFJLGVBQWUsR0FBRyxtQkFBbUIsQ0FBQztBQUUxQywyQ0FBMkMsR0FDSztJQUM5QyxJQUFJLFNBQVMsR0FBRyxJQUFJLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3ZELElBQUksR0FBRyxHQUFHLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQyxJQUFJLElBQVcsQ0FBQztJQUNoQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLElBQUksR0FBVSxHQUFHLENBQUM7SUFDcEIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ04sSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZixDQUFDO0lBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUc7UUFDZixFQUFFLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsR0FBRyxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FB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Q0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ2hGLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvIGZyb20gJy4vb3V0cHV0X2FzdCc7XG5pbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIGlzU3RyaW5nLFxuICBldmFsRXhwcmVzc2lvbixcbiAgUmVnRXhwV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlcixcbiAgaXNBcnJheVxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtDb21waWxlSWRlbnRpZmllck1ldGFkYXRhfSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7XG4gIE91dHB1dEVtaXR0ZXIsXG4gIEVtaXR0ZXJWaXNpdG9yQ29udGV4dCxcbiAgQWJzdHJhY3RFbWl0dGVyVmlzaXRvcixcbiAgQ0FUQ0hfRVJST1JfVkFSLFxuICBDQVRDSF9TVEFDS19WQVJcbn0gZnJvbSAnLi9hYnN0cmFjdF9lbWl0dGVyJztcbmltcG9ydCB7Z2V0SW1wb3J0TW9kdWxlUGF0aCwgSW1wb3J0RW52fSBmcm9tICcuL3BhdGhfdXRpbCc7XG5cbnZhciBfZGVidWdNb2R1bGVVcmwgPSAnYXNzZXQ6Ly9kZWJ1Zy9saWInO1xuXG5leHBvcnQgZnVuY3Rpb24gZGVidWdPdXRwdXRBc3RBc1R5cGVTY3JpcHQoYXN0OiBvLlN0YXRlbWVudCB8IG8uRXhwcmVzc2lvbiB8IG8uVHlwZSB8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW55W10pOiBzdHJpbmcge1xuICB2YXIgY29udmVydGVyID0gbmV3IF9Uc0VtaXR0ZXJWaXNpdG9yKF9kZWJ1Z01vZHVsZVVybCk7XG4gIHZhciBjdHggPSBFbWl0dGVyVmlzaXRvckNvbnRleHQuY3JlYXRlUm9vdChbXSk7XG4gIHZhciBhc3RzOiBhbnlbXTtcbiAgaWYgKGlzQXJyYXkoYXN0KSkge1xuICAgIGFzdHMgPSA8YW55W10+YXN0O1xuICB9IGVsc2Uge1xuICAgIGFzdHMgPSBbYXN0XTtcbiAgfVxuICBhc3RzLmZvckVhY2goKGFzdCkgPT4ge1xuICAgIGlmIChhc3QgaW5zdGFuY2VvZiBvLlN0YXRlbWVudCkge1xuICAgICAgYXN0LnZpc2l0U3RhdGVtZW50KGNvbnZlcnRlciwgY3R4KTtcbiAgICB9IGVsc2UgaWYgKGFzdCBpbnN0YW5jZW9mIG8uRXhwcmVzc2lvbikge1xuICAgICAgYXN0LnZpc2l0RXhwcmVzc2lvbihjb252ZXJ0ZXIsIGN0eCk7XG4gICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBvLlR5cGUpIHtcbiAgICAgIGFzdC52aXNpdFR5cGUoY29udmVydGVyLCBjdHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgRG9uJ3Qga25vdyBob3cgdG8gcHJpbnQgZGVidWcgaW5mbyBmb3IgJHthc3R9YCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGN0eC50b1NvdXJjZSgpO1xufVxuXG5leHBvcnQgY2xhc3MgVHlwZVNjcmlwdEVtaXR0ZXIgaW1wbGVtZW50cyBPdXRwdXRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuICBlbWl0U3RhdGVtZW50cyhtb2R1bGVVcmw6IHN0cmluZywgc3RtdHM6IG8uU3RhdGVtZW50W10sIGV4cG9ydGVkVmFyczogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIHZhciBjb252ZXJ0ZXIgPSBuZXcgX1RzRW1pdHRlclZpc2l0b3IobW9kdWxlVXJsKTtcbiAgICB2YXIgY3R4ID0gRW1pdHRlclZpc2l0b3JDb250ZXh0LmNyZWF0ZVJvb3QoZXhwb3J0ZWRWYXJzKTtcbiAgICBjb252ZXJ0ZXIudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXRzLCBjdHgpO1xuICAgIHZhciBzcmNQYXJ0cyA9IFtdO1xuICAgIGNvbnZlcnRlci5pbXBvcnRzV2l0aFByZWZpeGVzLmZvckVhY2goKHByZWZpeCwgaW1wb3J0ZWRNb2R1bGVVcmwpID0+IHtcbiAgICAgIC8vIE5vdGU6IGNhbid0IHdyaXRlIHRoZSByZWFsIHdvcmQgZm9yIGltcG9ydCBhcyBpdCBzY3Jld3MgdXAgc3lzdGVtLmpzIGF1dG8gZGV0ZWN0aW9uLi4uXG4gICAgICBzcmNQYXJ0cy5wdXNoKFxuICAgICAgICAgIGBpbXBgICtcbiAgICAgICAgICBgb3J0ICogYXMgJHtwcmVmaXh9IGZyb20gJyR7Z2V0SW1wb3J0TW9kdWxlUGF0aChtb2R1bGVVcmwsIGltcG9ydGVkTW9kdWxlVXJsLCBJbXBvcnRFbnYuSlMpfSc7YCk7XG4gICAgfSk7XG4gICAgc3JjUGFydHMucHVzaChjdHgudG9Tb3VyY2UoKSk7XG4gICAgcmV0dXJuIHNyY1BhcnRzLmpvaW4oJ1xcbicpO1xuICB9XG59XG5cbmNsYXNzIF9Uc0VtaXR0ZXJWaXNpdG9yIGV4dGVuZHMgQWJzdHJhY3RFbWl0dGVyVmlzaXRvciBpbXBsZW1lbnRzIG8uVHlwZVZpc2l0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tb2R1bGVVcmw6IHN0cmluZykgeyBzdXBlcihmYWxzZSk7IH1cblxuICBpbXBvcnRzV2l0aFByZWZpeGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICB2aXNpdEV4dGVybmFsRXhwcihhc3Q6IG8uRXh0ZXJuYWxFeHByLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdGhpcy5fdmlzaXRJZGVudGlmaWVyKGFzdC52YWx1ZSwgYXN0LnR5cGVQYXJhbXMsIGN0eCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXREZWNsYXJlVmFyU3RtdChzdG10OiBvLkRlY2xhcmVWYXJTdG10LCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgaWYgKGN0eC5pc0V4cG9ydGVkVmFyKHN0bXQubmFtZSkpIHtcbiAgICAgIGN0eC5wcmludChgZXhwb3J0IGApO1xuICAgIH1cbiAgICBpZiAoc3RtdC5oYXNNb2RpZmllcihvLlN0bXRNb2RpZmllci5GaW5hbCkpIHtcbiAgICAgIGN0eC5wcmludChgY29uc3RgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGB2YXJgKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGAgJHtzdG10Lm5hbWV9YCk7XG4gICAgaWYgKGlzUHJlc2VudChzdG10LnR5cGUpKSB7XG4gICAgICBjdHgucHJpbnQoYDpgKTtcbiAgICAgIHN0bXQudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9XG4gICAgY3R4LnByaW50KGAgPSBgKTtcbiAgICBzdG10LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludGxuKGA7YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRDYXN0RXhwcihhc3Q6IG8uQ2FzdEV4cHIsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYCg8YCk7XG4gICAgYXN0LnR5cGUudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGA+YCk7XG4gICAgYXN0LnZhbHVlLnZpc2l0RXhwcmVzc2lvbih0aGlzLCBjdHgpO1xuICAgIGN0eC5wcmludChgKWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0RGVjbGFyZUNsYXNzU3RtdChzdG10OiBvLkNsYXNzU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wdXNoQ2xhc3Moc3RtdCk7XG4gICAgaWYgKGN0eC5pc0V4cG9ydGVkVmFyKHN0bXQubmFtZSkpIHtcbiAgICAgIGN0eC5wcmludChgZXhwb3J0IGApO1xuICAgIH1cbiAgICBjdHgucHJpbnQoYGNsYXNzICR7c3RtdC5uYW1lfWApO1xuICAgIGlmIChpc1ByZXNlbnQoc3RtdC5wYXJlbnQpKSB7XG4gICAgICBjdHgucHJpbnQoYCBleHRlbmRzIGApO1xuICAgICAgc3RtdC5wYXJlbnQudmlzaXRFeHByZXNzaW9uKHRoaXMsIGN0eCk7XG4gICAgfVxuICAgIGN0eC5wcmludGxuKGAge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICBzdG10LmZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4gdGhpcy5fdmlzaXRDbGFzc0ZpZWxkKGZpZWxkLCBjdHgpKTtcbiAgICBpZiAoaXNQcmVzZW50KHN0bXQuY29uc3RydWN0b3JNZXRob2QpKSB7XG4gICAgICB0aGlzLl92aXNpdENsYXNzQ29uc3RydWN0b3Ioc3RtdCwgY3R4KTtcbiAgICB9XG4gICAgc3RtdC5nZXR0ZXJzLmZvckVhY2goKGdldHRlcikgPT4gdGhpcy5fdmlzaXRDbGFzc0dldHRlcihnZXR0ZXIsIGN0eCkpO1xuICAgIHN0bXQubWV0aG9kcy5mb3JFYWNoKChtZXRob2QpID0+IHRoaXMuX3Zpc2l0Q2xhc3NNZXRob2QobWV0aG9kLCBjdHgpKTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50bG4oYH1gKTtcbiAgICBjdHgucG9wQ2xhc3MoKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBwcml2YXRlIF92aXNpdENsYXNzRmllbGQoZmllbGQ6IG8uQ2xhc3NGaWVsZCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpIHtcbiAgICBpZiAoZmllbGQuaGFzTW9kaWZpZXIoby5TdG10TW9kaWZpZXIuUHJpdmF0ZSkpIHtcbiAgICAgIGN0eC5wcmludChgcHJpdmF0ZSBgKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGZpZWxkLm5hbWUpO1xuICAgIGlmIChpc1ByZXNlbnQoZmllbGQudHlwZSkpIHtcbiAgICAgIGN0eC5wcmludChgOmApO1xuICAgICAgZmllbGQudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9XG4gICAgY3R4LnByaW50bG4oYDtgKTtcbiAgfVxuICBwcml2YXRlIF92aXNpdENsYXNzR2V0dGVyKGdldHRlcjogby5DbGFzc0dldHRlciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpIHtcbiAgICBpZiAoZ2V0dGVyLmhhc01vZGlmaWVyKG8uU3RtdE1vZGlmaWVyLlByaXZhdGUpKSB7XG4gICAgICBjdHgucHJpbnQoYHByaXZhdGUgYCk7XG4gICAgfVxuICAgIGN0eC5wcmludChgZ2V0ICR7Z2V0dGVyLm5hbWV9KClgKTtcbiAgICBpZiAoaXNQcmVzZW50KGdldHRlci50eXBlKSkge1xuICAgICAgY3R4LnByaW50KGA6YCk7XG4gICAgICBnZXR0ZXIudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9XG4gICAgY3R4LnByaW50bG4oYCB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKGdldHRlci5ib2R5LCBjdHgpO1xuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihgfWApO1xuICB9XG4gIHByaXZhdGUgX3Zpc2l0Q2xhc3NDb25zdHJ1Y3RvcihzdG10OiBvLkNsYXNzU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpIHtcbiAgICBjdHgucHJpbnQoYGNvbnN0cnVjdG9yKGApO1xuICAgIHRoaXMuX3Zpc2l0UGFyYW1zKHN0bXQuY29uc3RydWN0b3JNZXRob2QucGFyYW1zLCBjdHgpO1xuICAgIGN0eC5wcmludGxuKGApIHtgKTtcbiAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMoc3RtdC5jb25zdHJ1Y3Rvck1ldGhvZC5ib2R5LCBjdHgpO1xuICAgIGN0eC5kZWNJbmRlbnQoKTtcbiAgICBjdHgucHJpbnRsbihgfWApO1xuICB9XG4gIHByaXZhdGUgX3Zpc2l0Q2xhc3NNZXRob2QobWV0aG9kOiBvLkNsYXNzTWV0aG9kLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCkge1xuICAgIGlmIChtZXRob2QuaGFzTW9kaWZpZXIoby5TdG10TW9kaWZpZXIuUHJpdmF0ZSkpIHtcbiAgICAgIGN0eC5wcmludChgcHJpdmF0ZSBgKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGAke21ldGhvZC5uYW1lfShgKTtcbiAgICB0aGlzLl92aXNpdFBhcmFtcyhtZXRob2QucGFyYW1zLCBjdHgpO1xuICAgIGN0eC5wcmludChgKTpgKTtcbiAgICBpZiAoaXNQcmVzZW50KG1ldGhvZC50eXBlKSkge1xuICAgICAgbWV0aG9kLnR5cGUudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGN0eC5wcmludChgdm9pZGApO1xuICAgIH1cbiAgICBjdHgucHJpbnRsbihgIHtgKTtcbiAgICBjdHguaW5jSW5kZW50KCk7XG4gICAgdGhpcy52aXNpdEFsbFN0YXRlbWVudHMobWV0aG9kLmJvZHksIGN0eCk7XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludGxuKGB9YCk7XG4gIH1cbiAgdmlzaXRGdW5jdGlvbkV4cHIoYXN0OiBvLkZ1bmN0aW9uRXhwciwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludChgKGApO1xuICAgIHRoaXMuX3Zpc2l0UGFyYW1zKGFzdC5wYXJhbXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGApOmApO1xuICAgIGlmIChpc1ByZXNlbnQoYXN0LnR5cGUpKSB7XG4gICAgICBhc3QudHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGB2b2lkYCk7XG4gICAgfVxuICAgIGN0eC5wcmludGxuKGAgPT4ge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhhc3Quc3RhdGVtZW50cywgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50KGB9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXREZWNsYXJlRnVuY3Rpb25TdG10KHN0bXQ6IG8uRGVjbGFyZUZ1bmN0aW9uU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGlmIChjdHguaXNFeHBvcnRlZFZhcihzdG10Lm5hbWUpKSB7XG4gICAgICBjdHgucHJpbnQoYGV4cG9ydCBgKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGBmdW5jdGlvbiAke3N0bXQubmFtZX0oYCk7XG4gICAgdGhpcy5fdmlzaXRQYXJhbXMoc3RtdC5wYXJhbXMsIGN0eCk7XG4gICAgY3R4LnByaW50KGApOmApO1xuICAgIGlmIChpc1ByZXNlbnQoc3RtdC50eXBlKSkge1xuICAgICAgc3RtdC50eXBlLnZpc2l0VHlwZSh0aGlzLCBjdHgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdHgucHJpbnQoYHZvaWRgKTtcbiAgICB9XG4gICAgY3R4LnByaW50bG4oYCB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKHN0bXQuc3RhdGVtZW50cywgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50bG4oYH1gKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2aXNpdFRyeUNhdGNoU3RtdChzdG10OiBvLlRyeUNhdGNoU3RtdCwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIGN0eC5wcmludGxuKGB0cnkge2ApO1xuICAgIGN0eC5pbmNJbmRlbnQoKTtcbiAgICB0aGlzLnZpc2l0QWxsU3RhdGVtZW50cyhzdG10LmJvZHlTdG10cywgY3R4KTtcbiAgICBjdHguZGVjSW5kZW50KCk7XG4gICAgY3R4LnByaW50bG4oYH0gY2F0Y2ggKCR7Q0FUQ0hfRVJST1JfVkFSLm5hbWV9KSB7YCk7XG4gICAgY3R4LmluY0luZGVudCgpO1xuICAgIHZhciBjYXRjaFN0bXRzID0gW1xuICAgICAgPG8uU3RhdGVtZW50PkNBVENIX1NUQUNLX1ZBUi5zZXQoQ0FUQ0hfRVJST1JfVkFSLnByb3AoJ3N0YWNrJykpXG4gICAgICAgICAgLnRvRGVjbFN0bXQobnVsbCwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSlcbiAgICBdLmNvbmNhdChzdG10LmNhdGNoU3RtdHMpO1xuICAgIHRoaXMudmlzaXRBbGxTdGF0ZW1lbnRzKGNhdGNoU3RtdHMsIGN0eCk7XG4gICAgY3R4LmRlY0luZGVudCgpO1xuICAgIGN0eC5wcmludGxuKGB9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2aXNpdEJ1aWx0aW50VHlwZSh0eXBlOiBvLkJ1aWx0aW5UeXBlLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgdmFyIHR5cGVTdHI7XG4gICAgc3dpdGNoICh0eXBlLm5hbWUpIHtcbiAgICAgIGNhc2Ugby5CdWlsdGluVHlwZU5hbWUuQm9vbDpcbiAgICAgICAgdHlwZVN0ciA9ICdib29sZWFuJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQnVpbHRpblR5cGVOYW1lLkR5bmFtaWM6XG4gICAgICAgIHR5cGVTdHIgPSAnYW55JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQnVpbHRpblR5cGVOYW1lLkZ1bmN0aW9uOlxuICAgICAgICB0eXBlU3RyID0gJ0Z1bmN0aW9uJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIG8uQnVpbHRpblR5cGVOYW1lLk51bWJlcjpcbiAgICAgICAgdHlwZVN0ciA9ICdudW1iZXInO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CdWlsdGluVHlwZU5hbWUuSW50OlxuICAgICAgICB0eXBlU3RyID0gJ251bWJlcic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJ1aWx0aW5UeXBlTmFtZS5TdHJpbmc6XG4gICAgICAgIHR5cGVTdHIgPSAnc3RyaW5nJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5zdXBwb3J0ZWQgYnVpbHRpbiB0eXBlICR7dHlwZS5uYW1lfWApO1xuICAgIH1cbiAgICBjdHgucHJpbnQodHlwZVN0cik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmlzaXRFeHRlcm5hbFR5cGUoYXN0OiBvLkV4dGVybmFsVHlwZSwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiBhbnkge1xuICAgIHRoaXMuX3Zpc2l0SWRlbnRpZmllcihhc3QudmFsdWUsIGFzdC50eXBlUGFyYW1zLCBjdHgpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0QXJyYXlUeXBlKHR5cGU6IG8uQXJyYXlUeXBlLCBjdHg6IEVtaXR0ZXJWaXNpdG9yQ29udGV4dCk6IGFueSB7XG4gICAgaWYgKGlzUHJlc2VudCh0eXBlLm9mKSkge1xuICAgICAgdHlwZS5vZi52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGBhbnlgKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGBbXWApO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZpc2l0TWFwVHlwZSh0eXBlOiBvLk1hcFR5cGUsIGN0eDogRW1pdHRlclZpc2l0b3JDb250ZXh0KTogYW55IHtcbiAgICBjdHgucHJpbnQoYHtba2V5OiBzdHJpbmddOmApO1xuICAgIGlmIChpc1ByZXNlbnQodHlwZS52YWx1ZVR5cGUpKSB7XG4gICAgICB0eXBlLnZhbHVlVHlwZS52aXNpdFR5cGUodGhpcywgY3R4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnByaW50KGBhbnlgKTtcbiAgICB9XG4gICAgY3R4LnByaW50KGB9YCk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRCdWlsdGluTWV0aG9kTmFtZShtZXRob2Q6IG8uQnVpbHRpbk1ldGhvZCk6IHN0cmluZyB7XG4gICAgdmFyIG5hbWU7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2Ugby5CdWlsdGluTWV0aG9kLkNvbmNhdEFycmF5OlxuICAgICAgICBuYW1lID0gJ2NvbmNhdCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBvLkJ1aWx0aW5NZXRob2QuU3Vic2NyaWJlT2JzZXJ2YWJsZTpcbiAgICAgICAgbmFtZSA9ICdzdWJzY3JpYmUnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2Ugby5CdWlsdGluTWV0aG9kLmJpbmQ6XG4gICAgICAgIG5hbWUgPSAnYmluZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVua25vd24gYnVpbHRpbiBtZXRob2Q6ICR7bWV0aG9kfWApO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuXG5cbiAgcHJpdmF0ZSBfdmlzaXRQYXJhbXMocGFyYW1zOiBvLkZuUGFyYW1bXSwgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiB2b2lkIHtcbiAgICB0aGlzLnZpc2l0QWxsT2JqZWN0cygocGFyYW0pID0+IHtcbiAgICAgIGN0eC5wcmludChwYXJhbS5uYW1lKTtcbiAgICAgIGlmIChpc1ByZXNlbnQocGFyYW0udHlwZSkpIHtcbiAgICAgICAgY3R4LnByaW50KGA6YCk7XG4gICAgICAgIHBhcmFtLnR5cGUudmlzaXRUeXBlKHRoaXMsIGN0eCk7XG4gICAgICB9XG4gICAgfSwgcGFyYW1zLCBjdHgsICcsJyk7XG4gIH1cblxuICBwcml2YXRlIF92aXNpdElkZW50aWZpZXIodmFsdWU6IENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEsIHR5cGVQYXJhbXM6IG8uVHlwZVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4OiBFbWl0dGVyVmlzaXRvckNvbnRleHQpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHZhbHVlLm1vZHVsZVVybCkgJiYgdmFsdWUubW9kdWxlVXJsICE9IHRoaXMuX21vZHVsZVVybCkge1xuICAgICAgdmFyIHByZWZpeCA9IHRoaXMuaW1wb3J0c1dpdGhQcmVmaXhlcy5nZXQodmFsdWUubW9kdWxlVXJsKTtcbiAgICAgIGlmIChpc0JsYW5rKHByZWZpeCkpIHtcbiAgICAgICAgcHJlZml4ID0gYGltcG9ydCR7dGhpcy5pbXBvcnRzV2l0aFByZWZpeGVzLnNpemV9YDtcbiAgICAgICAgdGhpcy5pbXBvcnRzV2l0aFByZWZpeGVzLnNldCh2YWx1ZS5tb2R1bGVVcmwsIHByZWZpeCk7XG4gICAgICB9XG4gICAgICBjdHgucHJpbnQoYCR7cHJlZml4fS5gKTtcbiAgICB9XG4gICAgY3R4LnByaW50KHZhbHVlLm5hbWUpO1xuICAgIGlmIChpc1ByZXNlbnQodHlwZVBhcmFtcykgJiYgdHlwZVBhcmFtcy5sZW5ndGggPiAwKSB7XG4gICAgICBjdHgucHJpbnQoYDxgKTtcbiAgICAgIHRoaXMudmlzaXRBbGxPYmplY3RzKCh0eXBlKSA9PiB0eXBlLnZpc2l0VHlwZSh0aGlzLCBjdHgpLCB0eXBlUGFyYW1zLCBjdHgsICcsJyk7XG4gICAgICBjdHgucHJpbnQoYD5gKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==