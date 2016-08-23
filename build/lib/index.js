// Ref: http://norvig.com/lispy.html
// Using typescript as transpiler
"use strict";
// Standard envirment variables
var globalEnv = {};
// Import all Math method for convenience
Object.getOwnPropertyNames(Math).forEach(function (method) { return globalEnv[method] = Math[method]; });
// Import operator by eval closure
var ops = ["+", "-", "*", "/", ">", "<", ">=", "<="].forEach(function (op) { globalEnv[op] = function (x, y) { return eval(x + " " + op + " " + y); }; });
globalEnv["remainder"] = function (x, y) { return x % y; };
globalEnv["="] = function (x, y) { return JSON.stringify(x) === JSON.stringify(y); };
globalEnv["append"] = globalEnv["+"];
globalEnv["equal?"] = globalEnv["="];
globalEnv["eq?"] = globalEnv["="];
// Lambda related
globalEnv["map"] = function (cb, list) { return list.map(cb); };
globalEnv["apply"] = function (cb, args) { return cb.apply(null, args); };
// List releate 
globalEnv["list"] = function () {
    var x = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        x[_i - 0] = arguments[_i];
    }
    return x;
};
globalEnv["list?"] = function (x) { return typeof x === "array"; };
globalEnv["length"] = function (x) { return x.length; };
globalEnv["car"] = function (x) { return (x.length !== 0) ? x[0] : null; };
globalEnv["cdr"] = function (x) { return (x.length > 1) ? x.slice(1) : null; };
globalEnv["cons"] = function (x, y) { return [x].concat(y); };
// Misc
globalEnv["display"] = console.log;
globalEnv["not"] = function (x) { return typeof x === "boolean" ? !x : null; };
var tokenize = function (input) { return input.replace(/(\()|(\))/g, function (_, a, b) { if (a) {
    return " " + a + " ";
}
else {
    return " " + b + " ";
} }).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "").split(" "); };
var atom = function (token) {
    var ret = Number(token);
    return isNaN(ret) ? token : ret;
};
var parse = function (tokens) {
    if (tokens.length === 0)
        throw Error("Error: Unexpected EOF while reading !");
    var no1 = tokens.shift();
    if (no1 === "(") {
        var list = [];
        while (tokens[0] !== ")") {
            list.push(parse(tokens));
        }
        tokens.shift();
        return list;
    }
    else if (no1 === ")") {
        throw Error("Error: Unexpected ) !");
    }
    else {
        return atom(no1);
    }
};
// Return a obj that shadow copy from a and b, a's prop will be overwrite by b's prop 
function merge(a, b) {
    var obj = {};
    for (var key in a) {
        obj[key] = a[key];
    }
    for (var key in b) {
        obj[key] = b[key];
    }
    return obj;
}
var matchString = /(^"(.*)"$)|(^'(.*)'$)/;
function _evalate(s, env) {
    if (env === void 0) { env = globalEnv; }
    if (typeof s === 'string') {
        var ret = s.match(matchString) ? s.replace(matchString, function (_, a, b, c, d) { if (b) {
            return b;
        }
        else {
            return d;
        } }) : env[s];
        if (ret === undefined)
            throw Error("Unbond variable: [" + s + "] !");
        return ret;
    }
    else if (typeof s === "number") {
        return s;
    }
    else if (s[0] === "quote") {
        return s[1];
    }
    else if (s[0] === "if") {
        var _ = s[0], test = s[1], ret = s[2], or = s[3];
        var exp = _evalate(test, env) ? ret : or;
        return _evalate(exp, env);
    }
    else if (s[0] === "define") {
        var _ = s[0], name_1 = s[1], exp = s[2];
        env[name_1] = _evalate(exp, env);
    }
    else if (s[0] === "set!") {
        var _ = s[0], name_2 = s[1], exp = s[2];
        env[name_2] = _evalate(exp, env);
    }
    else if (s[0] === "lambda") {
        var _ = s[0], params_1 = s[1], func_1 = s[2];
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var tmpEnv = {};
            args.forEach(function (val, idx) { return tmpEnv[params_1[idx]] = val; });
            return _evalate(func_1, merge(env, tmpEnv));
        };
    }
    else if (s[0] === "begin") {
        var _ = s[0], exps = s.slice(1);
        return exps.map(function (exp) { return _evalate(exp, env); }).pop();
    }
    else {
        var _a = s.map(function (exp) { return _evalate(exp, env); }), op = _a[0], args = _a.slice(1);
        return op.apply(null, args);
    }
}
exports.evalate = function (s) { return _evalate(parse(tokenize(s))); };
//# sourceMappingURL=index.js.map