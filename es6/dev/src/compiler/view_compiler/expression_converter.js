import * as o from '../output/output_ast';
import { Identifiers } from '../identifiers';
import { BaseException } from 'angular2/src/facade/exceptions';
import { isBlank, isPresent, isArray } from 'angular2/src/facade/lang';
var IMPLICIT_RECEIVER = o.variable('#implicit');
export class ExpressionWithWrappedValueInfo {
    constructor(expression, needsValueUnwrapper) {
        this.expression = expression;
        this.needsValueUnwrapper = needsValueUnwrapper;
    }
}
export function convertCdExpressionToIr(nameResolver, implicitReceiver, expression, valueUnwrapper) {
    var visitor = new _AstToIrVisitor(nameResolver, implicitReceiver, valueUnwrapper);
    var irAst = expression.visit(visitor, _Mode.Expression);
    return new ExpressionWithWrappedValueInfo(irAst, visitor.needsValueUnwrapper);
}
export function convertCdStatementToIr(nameResolver, implicitReceiver, stmt) {
    var visitor = new _AstToIrVisitor(nameResolver, implicitReceiver, null);
    var statements = [];
    flattenStatements(stmt.visit(visitor, _Mode.Statement), statements);
    return statements;
}
var _Mode;
(function (_Mode) {
    _Mode[_Mode["Statement"] = 0] = "Statement";
    _Mode[_Mode["Expression"] = 1] = "Expression";
})(_Mode || (_Mode = {}));
function ensureStatementMode(mode, ast) {
    if (mode !== _Mode.Statement) {
        throw new BaseException(`Expected a statement, but saw ${ast}`);
    }
}
function ensureExpressionMode(mode, ast) {
    if (mode !== _Mode.Expression) {
        throw new BaseException(`Expected an expression, but saw ${ast}`);
    }
}
function convertToStatementIfNeeded(mode, expr) {
    if (mode === _Mode.Statement) {
        return expr.toStmt();
    }
    else {
        return expr;
    }
}
class _AstToIrVisitor {
    constructor(_nameResolver, _implicitReceiver, _valueUnwrapper) {
        this._nameResolver = _nameResolver;
        this._implicitReceiver = _implicitReceiver;
        this._valueUnwrapper = _valueUnwrapper;
        this.needsValueUnwrapper = false;
    }
    visitBinary(ast, mode) {
        var op;
        switch (ast.operation) {
            case '+':
                op = o.BinaryOperator.Plus;
                break;
            case '-':
                op = o.BinaryOperator.Minus;
                break;
            case '*':
                op = o.BinaryOperator.Multiply;
                break;
            case '/':
                op = o.BinaryOperator.Divide;
                break;
            case '%':
                op = o.BinaryOperator.Modulo;
                break;
            case '&&':
                op = o.BinaryOperator.And;
                break;
            case '||':
                op = o.BinaryOperator.Or;
                break;
            case '==':
                op = o.BinaryOperator.Equals;
                break;
            case '!=':
                op = o.BinaryOperator.NotEquals;
                break;
            case '===':
                op = o.BinaryOperator.Identical;
                break;
            case '!==':
                op = o.BinaryOperator.NotIdentical;
                break;
            case '<':
                op = o.BinaryOperator.Lower;
                break;
            case '>':
                op = o.BinaryOperator.Bigger;
                break;
            case '<=':
                op = o.BinaryOperator.LowerEquals;
                break;
            case '>=':
                op = o.BinaryOperator.BiggerEquals;
                break;
            default:
                throw new BaseException(`Unsupported operation ${ast.operation}`);
        }
        return convertToStatementIfNeeded(mode, new o.BinaryOperatorExpr(op, ast.left.visit(this, _Mode.Expression), ast.right.visit(this, _Mode.Expression)));
    }
    visitChain(ast, mode) {
        ensureStatementMode(mode, ast);
        return this.visitAll(ast.expressions, mode);
    }
    visitConditional(ast, mode) {
        var value = ast.condition.visit(this, _Mode.Expression);
        return convertToStatementIfNeeded(mode, value.conditional(ast.trueExp.visit(this, _Mode.Expression), ast.falseExp.visit(this, _Mode.Expression)));
    }
    visitPipe(ast, mode) {
        var input = ast.exp.visit(this, _Mode.Expression);
        var args = this.visitAll(ast.args, _Mode.Expression);
        var value = this._nameResolver.callPipe(ast.name, input, args);
        this.needsValueUnwrapper = true;
        return convertToStatementIfNeeded(mode, this._valueUnwrapper.callMethod('unwrap', [value]));
    }
    visitFunctionCall(ast, mode) {
        return convertToStatementIfNeeded(mode, ast.target.visit(this, _Mode.Expression)
            .callFn(this.visitAll(ast.args, _Mode.Expression)));
    }
    visitImplicitReceiver(ast, mode) {
        ensureExpressionMode(mode, ast);
        return IMPLICIT_RECEIVER;
    }
    visitInterpolation(ast, mode) {
        ensureExpressionMode(mode, ast);
        var args = [o.literal(ast.expressions.length)];
        for (var i = 0; i < ast.strings.length - 1; i++) {
            args.push(o.literal(ast.strings[i]));
            args.push(ast.expressions[i].visit(this, _Mode.Expression));
        }
        args.push(o.literal(ast.strings[ast.strings.length - 1]));
        return o.importExpr(Identifiers.interpolate).callFn(args);
    }
    visitKeyedRead(ast, mode) {
        return convertToStatementIfNeeded(mode, ast.obj.visit(this, _Mode.Expression).key(ast.key.visit(this, _Mode.Expression)));
    }
    visitKeyedWrite(ast, mode) {
        var obj = ast.obj.visit(this, _Mode.Expression);
        var key = ast.key.visit(this, _Mode.Expression);
        var value = ast.value.visit(this, _Mode.Expression);
        return convertToStatementIfNeeded(mode, obj.key(key).set(value));
    }
    visitLiteralArray(ast, mode) {
        return convertToStatementIfNeeded(mode, this._nameResolver.createLiteralArray(this.visitAll(ast.expressions, mode)));
    }
    visitLiteralMap(ast, mode) {
        var parts = [];
        for (var i = 0; i < ast.keys.length; i++) {
            parts.push([ast.keys[i], ast.values[i].visit(this, _Mode.Expression)]);
        }
        return convertToStatementIfNeeded(mode, this._nameResolver.createLiteralMap(parts));
    }
    visitLiteralPrimitive(ast, mode) {
        return convertToStatementIfNeeded(mode, o.literal(ast.value));
    }
    visitMethodCall(ast, mode) {
        var args = this.visitAll(ast.args, _Mode.Expression);
        var result = null;
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        if (receiver === IMPLICIT_RECEIVER) {
            var varExpr = this._nameResolver.getLocal(ast.name);
            if (isPresent(varExpr)) {
                result = varExpr.callFn(args);
            }
            else {
                receiver = this._implicitReceiver;
            }
        }
        if (isBlank(result)) {
            result = receiver.callMethod(ast.name, args);
        }
        return convertToStatementIfNeeded(mode, result);
    }
    visitPrefixNot(ast, mode) {
        return convertToStatementIfNeeded(mode, o.not(ast.expression.visit(this, _Mode.Expression)));
    }
    visitPropertyRead(ast, mode) {
        var result = null;
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        if (receiver === IMPLICIT_RECEIVER) {
            result = this._nameResolver.getLocal(ast.name);
            if (isBlank(result)) {
                receiver = this._implicitReceiver;
            }
        }
        if (isBlank(result)) {
            result = receiver.prop(ast.name);
        }
        return convertToStatementIfNeeded(mode, result);
    }
    visitPropertyWrite(ast, mode) {
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        if (receiver === IMPLICIT_RECEIVER) {
            var varExpr = this._nameResolver.getLocal(ast.name);
            if (isPresent(varExpr)) {
                throw new BaseException('Cannot assign to a reference or variable!');
            }
            receiver = this._implicitReceiver;
        }
        return convertToStatementIfNeeded(mode, receiver.prop(ast.name).set(ast.value.visit(this, _Mode.Expression)));
    }
    visitSafePropertyRead(ast, mode) {
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        return convertToStatementIfNeeded(mode, receiver.isBlank().conditional(o.NULL_EXPR, receiver.prop(ast.name)));
    }
    visitSafeMethodCall(ast, mode) {
        var receiver = ast.receiver.visit(this, _Mode.Expression);
        var args = this.visitAll(ast.args, _Mode.Expression);
        return convertToStatementIfNeeded(mode, receiver.isBlank().conditional(o.NULL_EXPR, receiver.callMethod(ast.name, args)));
    }
    visitAll(asts, mode) { return asts.map(ast => ast.visit(this, mode)); }
    visitQuote(ast, mode) {
        throw new BaseException('Quotes are not supported for evaluation!');
    }
}
function flattenStatements(arg, output) {
    if (isArray(arg)) {
        arg.forEach((entry) => flattenStatements(entry, output));
    }
    else {
        output.push(arg);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbl9jb252ZXJ0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVg1aGV2UHA0LnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvdmlld19jb21waWxlci9leHByZXNzaW9uX2NvbnZlcnRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FDTyxLQUFLLENBQUMsTUFBTSxzQkFBc0I7T0FDbEMsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FFbkMsRUFBQyxhQUFhLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDckQsRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBYSxNQUFNLDBCQUEwQjtBQUVoRixJQUFJLGlCQUFpQixHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7QUFTaEQ7SUFDRSxZQUFtQixVQUF3QixFQUFTLG1CQUE0QjtRQUE3RCxlQUFVLEdBQVYsVUFBVSxDQUFjO1FBQVMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFTO0lBQUcsQ0FBQztBQUN0RixDQUFDO0FBRUQsd0NBQ0ksWUFBMEIsRUFBRSxnQkFBOEIsRUFBRSxVQUFxQixFQUNqRixjQUE2QjtJQUMvQixJQUFJLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDbEYsSUFBSSxLQUFLLEdBQWlCLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0RSxNQUFNLENBQUMsSUFBSSw4QkFBOEIsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDaEYsQ0FBQztBQUVELHVDQUF1QyxZQUEwQixFQUFFLGdCQUE4QixFQUMxRCxJQUFlO0lBQ3BELElBQUksT0FBTyxHQUFHLElBQUksZUFBZSxDQUFDLFlBQVksRUFBRSxnQkFBZ0Is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LENBQUM7UUFDVCxHQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxLQUFLLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkIsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZEFzdCBmcm9tICcuLi9leHByZXNzaW9uX3BhcnNlci9hc3QnO1xuaW1wb3J0ICogYXMgbyBmcm9tICcuLi9vdXRwdXQvb3V0cHV0X2FzdCc7XG5pbXBvcnQge0lkZW50aWZpZXJzfSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5cbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBpc0FycmF5LCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG52YXIgSU1QTElDSVRfUkVDRUlWRVIgPSBvLnZhcmlhYmxlKCcjaW1wbGljaXQnKTtcblxuZXhwb3J0IGludGVyZmFjZSBOYW1lUmVzb2x2ZXIge1xuICBjYWxsUGlwZShuYW1lOiBzdHJpbmcsIGlucHV0OiBvLkV4cHJlc3Npb24sIGFyZ3M6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uO1xuICBnZXRMb2NhbChuYW1lOiBzdHJpbmcpOiBvLkV4cHJlc3Npb247XG4gIGNyZWF0ZUxpdGVyYWxBcnJheSh2YWx1ZXM6IG8uRXhwcmVzc2lvbltdKTogby5FeHByZXNzaW9uO1xuICBjcmVhdGVMaXRlcmFsTWFwKHZhbHVlczogQXJyYXk8QXJyYXk8c3RyaW5nIHwgby5FeHByZXNzaW9uPj4pOiBvLkV4cHJlc3Npb247XG59XG5cbmV4cG9ydCBjbGFzcyBFeHByZXNzaW9uV2l0aFdyYXBwZWRWYWx1ZUluZm8ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXhwcmVzc2lvbjogby5FeHByZXNzaW9uLCBwdWJsaWMgbmVlZHNWYWx1ZVVud3JhcHBlcjogYm9vbGVhbikge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRDZEV4cHJlc3Npb25Ub0lyKFxuICAgIG5hbWVSZXNvbHZlcjogTmFtZVJlc29sdmVyLCBpbXBsaWNpdFJlY2VpdmVyOiBvLkV4cHJlc3Npb24sIGV4cHJlc3Npb246IGNkQXN0LkFTVCxcbiAgICB2YWx1ZVVud3JhcHBlcjogby5SZWFkVmFyRXhwcik6IEV4cHJlc3Npb25XaXRoV3JhcHBlZFZhbHVlSW5mbyB7XG4gIHZhciB2aXNpdG9yID0gbmV3IF9Bc3RUb0lyVmlzaXRvcihuYW1lUmVzb2x2ZXIsIGltcGxpY2l0UmVjZWl2ZXIsIHZhbHVlVW53cmFwcGVyKTtcbiAgdmFyIGlyQXN0OiBvLkV4cHJlc3Npb24gPSBleHByZXNzaW9uLnZpc2l0KHZpc2l0b3IsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICByZXR1cm4gbmV3IEV4cHJlc3Npb25XaXRoV3JhcHBlZFZhbHVlSW5mbyhpckFzdCwgdmlzaXRvci5uZWVkc1ZhbHVlVW53cmFwcGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRDZFN0YXRlbWVudFRvSXIobmFtZVJlc29sdmVyOiBOYW1lUmVzb2x2ZXIsIGltcGxpY2l0UmVjZWl2ZXI6IG8uRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0bXQ6IGNkQXN0LkFTVCk6IG8uU3RhdGVtZW50W10ge1xuICB2YXIgdmlzaXRvciA9IG5ldyBfQXN0VG9JclZpc2l0b3IobmFtZVJlc29sdmVyLCBpbXBsaWNpdFJlY2VpdmVyLCBudWxsKTtcbiAgdmFyIHN0YXRlbWVudHMgPSBbXTtcbiAgZmxhdHRlblN0YXRlbWVudHMoc3RtdC52aXNpdCh2aXNpdG9yLCBfTW9kZS5TdGF0ZW1lbnQpLCBzdGF0ZW1lbnRzKTtcbiAgcmV0dXJuIHN0YXRlbWVudHM7XG59XG5cbmVudW0gX01vZGUge1xuICBTdGF0ZW1lbnQsXG4gIEV4cHJlc3Npb25cbn1cblxuZnVuY3Rpb24gZW5zdXJlU3RhdGVtZW50TW9kZShtb2RlOiBfTW9kZSwgYXN0OiBjZEFzdC5BU1QpIHtcbiAgaWYgKG1vZGUgIT09IF9Nb2RlLlN0YXRlbWVudCkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBFeHBlY3RlZCBhIHN0YXRlbWVudCwgYnV0IHNhdyAke2FzdH1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbnN1cmVFeHByZXNzaW9uTW9kZShtb2RlOiBfTW9kZSwgYXN0OiBjZEFzdC5BU1QpIHtcbiAgaWYgKG1vZGUgIT09IF9Nb2RlLkV4cHJlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgRXhwZWN0ZWQgYW4gZXhwcmVzc2lvbiwgYnV0IHNhdyAke2FzdH1gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChtb2RlOiBfTW9kZSwgZXhwcjogby5FeHByZXNzaW9uKTogby5FeHByZXNzaW9uIHwgby5TdGF0ZW1lbnQge1xuICBpZiAobW9kZSA9PT0gX01vZGUuU3RhdGVtZW50KSB7XG4gICAgcmV0dXJuIGV4cHIudG9TdG10KCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV4cHI7XG4gIH1cbn1cblxuY2xhc3MgX0FzdFRvSXJWaXNpdG9yIGltcGxlbWVudHMgY2RBc3QuQXN0VmlzaXRvciB7XG4gIHB1YmxpYyBuZWVkc1ZhbHVlVW53cmFwcGVyOiBib29sZWFuID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbmFtZVJlc29sdmVyOiBOYW1lUmVzb2x2ZXIsIHByaXZhdGUgX2ltcGxpY2l0UmVjZWl2ZXI6IG8uRXhwcmVzc2lvbixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmFsdWVVbndyYXBwZXI6IG8uUmVhZFZhckV4cHIpIHt9XG5cbiAgdmlzaXRCaW5hcnkoYXN0OiBjZEFzdC5CaW5hcnksIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICB2YXIgb3A7XG4gICAgc3dpdGNoIChhc3Qub3BlcmF0aW9uKSB7XG4gICAgICBjYXNlICcrJzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLlBsdXM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLSc6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5NaW51cztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcqJzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLk11bHRpcGx5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuRGl2aWRlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJyUnOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuTW9kdWxvO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJyYmJzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLkFuZDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd8fCc6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5PcjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICc9PSc6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5FcXVhbHM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnIT0nOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuTm90RXF1YWxzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJz09PSc6XG4gICAgICAgIG9wID0gby5CaW5hcnlPcGVyYXRvci5JZGVudGljYWw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnIT09JzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLk5vdElkZW50aWNhbDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICc8JzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLkxvd2VyO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJz4nOlxuICAgICAgICBvcCA9IG8uQmluYXJ5T3BlcmF0b3IuQmlnZ2VyO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJzw9JzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLkxvd2VyRXF1YWxzO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJz49JzpcbiAgICAgICAgb3AgPSBvLkJpbmFyeU9wZXJhdG9yLkJpZ2dlckVxdWFscztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5zdXBwb3J0ZWQgb3BlcmF0aW9uICR7YXN0Lm9wZXJhdGlvbn1gKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgIG1vZGUsIG5ldyBvLkJpbmFyeU9wZXJhdG9yRXhwcihvcCwgYXN0LmxlZnQudmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QucmlnaHQudmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbikpKTtcbiAgfVxuICB2aXNpdENoYWluKGFzdDogY2RBc3QuQ2hhaW4sIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICBlbnN1cmVTdGF0ZW1lbnRNb2RlKG1vZGUsIGFzdCk7XG4gICAgcmV0dXJuIHRoaXMudmlzaXRBbGwoYXN0LmV4cHJlc3Npb25zLCBtb2RlKTtcbiAgfVxuICB2aXNpdENvbmRpdGlvbmFsKGFzdDogY2RBc3QuQ29uZGl0aW9uYWwsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICB2YXIgdmFsdWU6IG8uRXhwcmVzc2lvbiA9IGFzdC5jb25kaXRpb24udmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbik7XG4gICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKFxuICAgICAgICBtb2RlLCB2YWx1ZS5jb25kaXRpb25hbChhc3QudHJ1ZUV4cC52aXNpdCh0aGlzLCBfTW9kZS5FeHByZXNzaW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXN0LmZhbHNlRXhwLnZpc2l0KHRoaXMsIF9Nb2RlLkV4cHJlc3Npb24pKSk7XG4gIH1cbiAgdmlzaXRQaXBlKGFzdDogY2RBc3QuQmluZGluZ1BpcGUsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICB2YXIgaW5wdXQgPSBhc3QuZXhwLnZpc2l0KHRoaXMsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIHZhciBhcmdzID0gdGhpcy52aXNpdEFsbChhc3QuYXJncywgX01vZGUuRXhwcmVzc2lvbik7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5fbmFtZVJlc29sdmVyLmNhbGxQaXBlKGFzdC5uYW1lLCBpbnB1dCwgYXJncyk7XG4gICAgdGhpcy5uZWVkc1ZhbHVlVW53cmFwcGVyID0gdHJ1ZTtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQobW9kZSwgdGhpcy5fdmFsdWVVbndyYXBwZXIuY2FsbE1ldGhvZCgndW53cmFwJywgW3ZhbHVlXSkpO1xuICB9XG4gIHZpc2l0RnVuY3Rpb25DYWxsKGFzdDogY2RBc3QuRnVuY3Rpb25DYWxsLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKG1vZGUsIGFzdC50YXJnZXQudmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5jYWxsRm4odGhpcy52aXNpdEFsbChhc3QuYXJncywgX01vZGUuRXhwcmVzc2lvbikpKTtcbiAgfVxuICB2aXNpdEltcGxpY2l0UmVjZWl2ZXIoYXN0OiBjZEFzdC5JbXBsaWNpdFJlY2VpdmVyLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgZW5zdXJlRXhwcmVzc2lvbk1vZGUobW9kZSwgYXN0KTtcbiAgICByZXR1cm4gSU1QTElDSVRfUkVDRUlWRVI7XG4gIH1cbiAgdmlzaXRJbnRlcnBvbGF0aW9uKGFzdDogY2RBc3QuSW50ZXJwb2xhdGlvbiwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIGVuc3VyZUV4cHJlc3Npb25Nb2RlKG1vZGUsIGFzdCk7XG4gICAgdmFyIGFyZ3MgPSBbby5saXRlcmFsKGFzdC5leHByZXNzaW9ucy5sZW5ndGgpXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFzdC5zdHJpbmdzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgYXJncy5wdXNoKG8ubGl0ZXJhbChhc3Quc3RyaW5nc1tpXSkpO1xuICAgICAgYXJncy5wdXNoKGFzdC5leHByZXNzaW9uc1tpXS52aXNpdCh0aGlzLCBfTW9kZS5FeHByZXNzaW9uKSk7XG4gICAgfVxuICAgIGFyZ3MucHVzaChvLmxpdGVyYWwoYXN0LnN0cmluZ3NbYXN0LnN0cmluZ3MubGVuZ3RoIC0gMV0pKTtcbiAgICByZXR1cm4gby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmludGVycG9sYXRlKS5jYWxsRm4oYXJncyk7XG4gIH1cbiAgdmlzaXRLZXllZFJlYWQoYXN0OiBjZEFzdC5LZXllZFJlYWQsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgIG1vZGUsIGFzdC5vYmoudmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbikua2V5KGFzdC5rZXkudmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbikpKTtcbiAgfVxuICB2aXNpdEtleWVkV3JpdGUoYXN0OiBjZEFzdC5LZXllZFdyaXRlLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgdmFyIG9iajogby5FeHByZXNzaW9uID0gYXN0Lm9iai52aXNpdCh0aGlzLCBfTW9kZS5FeHByZXNzaW9uKTtcbiAgICB2YXIga2V5OiBvLkV4cHJlc3Npb24gPSBhc3Qua2V5LnZpc2l0KHRoaXMsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIHZhciB2YWx1ZTogby5FeHByZXNzaW9uID0gYXN0LnZhbHVlLnZpc2l0KHRoaXMsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChtb2RlLCBvYmoua2V5KGtleSkuc2V0KHZhbHVlKSk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsQXJyYXkoYXN0OiBjZEFzdC5MaXRlcmFsQXJyYXksIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgIG1vZGUsIHRoaXMuX25hbWVSZXNvbHZlci5jcmVhdGVMaXRlcmFsQXJyYXkodGhpcy52aXNpdEFsbChhc3QuZXhwcmVzc2lvbnMsIG1vZGUpKSk7XG4gIH1cbiAgdmlzaXRMaXRlcmFsTWFwKGFzdDogY2RBc3QuTGl0ZXJhbE1hcCwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXN0LmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhcnRzLnB1c2goW2FzdC5rZXlzW2ldLCBhc3QudmFsdWVzW2ldLnZpc2l0KHRoaXMsIF9Nb2RlLkV4cHJlc3Npb24pXSk7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0VG9TdGF0ZW1lbnRJZk5lZWRlZChtb2RlLCB0aGlzLl9uYW1lUmVzb2x2ZXIuY3JlYXRlTGl0ZXJhbE1hcChwYXJ0cykpO1xuICB9XG4gIHZpc2l0TGl0ZXJhbFByaW1pdGl2ZShhc3Q6IGNkQXN0LkxpdGVyYWxQcmltaXRpdmUsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQobW9kZSwgby5saXRlcmFsKGFzdC52YWx1ZSkpO1xuICB9XG4gIHZpc2l0TWV0aG9kQ2FsbChhc3Q6IGNkQXN0Lk1ldGhvZENhbGwsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICB2YXIgYXJncyA9IHRoaXMudmlzaXRBbGwoYXN0LmFyZ3MsIF9Nb2RlLkV4cHJlc3Npb24pO1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgIHZhciByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzLCBfTW9kZS5FeHByZXNzaW9uKTtcbiAgICBpZiAocmVjZWl2ZXIgPT09IElNUExJQ0lUX1JFQ0VJVkVSKSB7XG4gICAgICB2YXIgdmFyRXhwciA9IHRoaXMuX25hbWVSZXNvbHZlci5nZXRMb2NhbChhc3QubmFtZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KHZhckV4cHIpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhckV4cHIuY2FsbEZuKGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVjZWl2ZXIgPSB0aGlzLl9pbXBsaWNpdFJlY2VpdmVyO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNCbGFuayhyZXN1bHQpKSB7XG4gICAgICByZXN1bHQgPSByZWNlaXZlci5jYWxsTWV0aG9kKGFzdC5uYW1lLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKG1vZGUsIHJlc3VsdCk7XG4gIH1cbiAgdmlzaXRQcmVmaXhOb3QoYXN0OiBjZEFzdC5QcmVmaXhOb3QsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQobW9kZSwgby5ub3QoYXN0LmV4cHJlc3Npb24udmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbikpKTtcbiAgfVxuICB2aXNpdFByb3BlcnR5UmVhZChhc3Q6IGNkQXN0LlByb3BlcnR5UmVhZCwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIHZhciByZXN1bHQgPSBudWxsO1xuICAgIHZhciByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzLCBfTW9kZS5FeHByZXNzaW9uKTtcbiAgICBpZiAocmVjZWl2ZXIgPT09IElNUExJQ0lUX1JFQ0VJVkVSKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9uYW1lUmVzb2x2ZXIuZ2V0TG9jYWwoYXN0Lm5hbWUpO1xuICAgICAgaWYgKGlzQmxhbmsocmVzdWx0KSkge1xuICAgICAgICByZWNlaXZlciA9IHRoaXMuX2ltcGxpY2l0UmVjZWl2ZXI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc0JsYW5rKHJlc3VsdCkpIHtcbiAgICAgIHJlc3VsdCA9IHJlY2VpdmVyLnByb3AoYXN0Lm5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQobW9kZSwgcmVzdWx0KTtcbiAgfVxuICB2aXNpdFByb3BlcnR5V3JpdGUoYXN0OiBjZEFzdC5Qcm9wZXJ0eVdyaXRlLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgdmFyIHJlY2VpdmVyOiBvLkV4cHJlc3Npb24gPSBhc3QucmVjZWl2ZXIudmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbik7XG4gICAgaWYgKHJlY2VpdmVyID09PSBJTVBMSUNJVF9SRUNFSVZFUikge1xuICAgICAgdmFyIHZhckV4cHIgPSB0aGlzLl9uYW1lUmVzb2x2ZXIuZ2V0TG9jYWwoYXN0Lm5hbWUpO1xuICAgICAgaWYgKGlzUHJlc2VudCh2YXJFeHByKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IGFzc2lnbiB0byBhIHJlZmVyZW5jZSBvciB2YXJpYWJsZSEnKTtcbiAgICAgIH1cbiAgICAgIHJlY2VpdmVyID0gdGhpcy5faW1wbGljaXRSZWNlaXZlcjtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRUb1N0YXRlbWVudElmTmVlZGVkKFxuICAgICAgICBtb2RlLCByZWNlaXZlci5wcm9wKGFzdC5uYW1lKS5zZXQoYXN0LnZhbHVlLnZpc2l0KHRoaXMsIF9Nb2RlLkV4cHJlc3Npb24pKSk7XG4gIH1cbiAgdmlzaXRTYWZlUHJvcGVydHlSZWFkKGFzdDogY2RBc3QuU2FmZVByb3BlcnR5UmVhZCwgbW9kZTogX01vZGUpOiBhbnkge1xuICAgIHZhciByZWNlaXZlciA9IGFzdC5yZWNlaXZlci52aXNpdCh0aGlzLCBfTW9kZS5FeHByZXNzaW9uKTtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgIG1vZGUsIHJlY2VpdmVyLmlzQmxhbmsoKS5jb25kaXRpb25hbChvLk5VTExfRVhQUiwgcmVjZWl2ZXIucHJvcChhc3QubmFtZSkpKTtcbiAgfVxuICB2aXNpdFNhZmVNZXRob2RDYWxsKGFzdDogY2RBc3QuU2FmZU1ldGhvZENhbGwsIG1vZGU6IF9Nb2RlKTogYW55IHtcbiAgICB2YXIgcmVjZWl2ZXIgPSBhc3QucmVjZWl2ZXIudmlzaXQodGhpcywgX01vZGUuRXhwcmVzc2lvbik7XG4gICAgdmFyIGFyZ3MgPSB0aGlzLnZpc2l0QWxsKGFzdC5hcmdzLCBfTW9kZS5FeHByZXNzaW9uKTtcbiAgICByZXR1cm4gY29udmVydFRvU3RhdGVtZW50SWZOZWVkZWQoXG4gICAgICAgIG1vZGUsIHJlY2VpdmVyLmlzQmxhbmsoKS5jb25kaXRpb25hbChvLk5VTExfRVhQUiwgcmVjZWl2ZXIuY2FsbE1ldGhvZChhc3QubmFtZSwgYXJncykpKTtcbiAgfVxuICB2aXNpdEFsbChhc3RzOiBjZEFzdC5BU1RbXSwgbW9kZTogX01vZGUpOiBhbnkgeyByZXR1cm4gYXN0cy5tYXAoYXN0ID0+IGFzdC52aXNpdCh0aGlzLCBtb2RlKSk7IH1cbiAgdmlzaXRRdW90ZShhc3Q6IGNkQXN0LlF1b3RlLCBtb2RlOiBfTW9kZSk6IGFueSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oJ1F1b3RlcyBhcmUgbm90IHN1cHBvcnRlZCBmb3IgZXZhbHVhdGlvbiEnKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuU3RhdGVtZW50cyhhcmc6IGFueSwgb3V0cHV0OiBvLlN0YXRlbWVudFtdKSB7XG4gIGlmIChpc0FycmF5KGFyZykpIHtcbiAgICAoPGFueVtdPmFyZykuZm9yRWFjaCgoZW50cnkpID0+IGZsYXR0ZW5TdGF0ZW1lbnRzKGVudHJ5LCBvdXRwdXQpKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQucHVzaChhcmcpO1xuICB9XG59Il19