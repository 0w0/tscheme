// Ref: http://norvig.com/lispy.html
// Using typescript as transpiler

// Standard envirment variables
const globalEnv = {}
// Import all Math method for convenience
Object.getOwnPropertyNames(Math).forEach(method => globalEnv[method] = Math[method])
globalEnv["pi"] = Math.PI
// Import operator by eval closure
const ops = ["+", "-", "*", "/", ">", "<", ">=", "<="].forEach(op => { globalEnv[op] = (x, y) => eval(`${x} ${op} ${y}`) })
globalEnv["remainder"] = (x, y) => x % y
globalEnv["="] = (x, y) => JSON.stringify(x) === JSON.stringify(y)
globalEnv["append"] = globalEnv["+"]
globalEnv["equal?"] = globalEnv["="]
globalEnv["eq?"] = globalEnv["="]
// Lambda related
globalEnv["map"] = (cb, list) => list.map(cb)
globalEnv["apply"] = (cb, args) => cb.apply(null, args)
// List releate 
globalEnv["list"] = (...x) => x
globalEnv["list?"] = x => typeof x === "array"
globalEnv["length"] = x => x.length
globalEnv["car"] = x => (x.length !== 0) ? x[0] : null 
globalEnv["cdr"] = x => (x.length > 1) ? x.slice(1) : null 
globalEnv["cons"] = (x, y) => [x].concat(y)
// Misc
globalEnv["display"] = console.log
globalEnv["not"] = x => typeof x === "boolean" ? !x : null

const tokenize = (input: string) => input.replace(/(\()|(\))/g, (_, a, b) => { if (a) { return ` ${a} `} else { return ` ${b} ` } } ).replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "").split(" ");
const atom = (token) => {
  const ret = Number(token)

  return isNaN(ret) ? token : ret
}
const parse = (tokens: Array<string>) => {
  if (tokens.length === 0) throw Error("Error: Unexpected EOF while reading !")
  const no1 = tokens.shift()
  if (no1 === "(") {
    let list = []
    while (tokens[0] !== ")") {
      list.push(parse(tokens))
    }
    tokens.shift()

    return list
  } else if (no1 === ")") {
    throw Error("Error: Unexpected ) !")
  } else {
    return atom(no1)
  }
}

// Return a obj that shadow copy from a and b, a's prop will be overwrite by b's prop 
function merge(a, b) {
  const obj = {}
  for (let key in a) { obj[key] = a[key] }
  for (let key in b) { obj[key] = b[key] }

  return obj
}

const matchString = /(^"(.*)"$)|(^'(.*)'$)/ 

function _evaluate(s: string | number | Array<string>, env = globalEnv) {
  if (typeof s === 'string') {
    const ret = s.match(matchString) ? s.replace(matchString, (_, a, b, c ,d) => { if (b) { return b } else { return d } }) : env[s]
    if (ret === undefined) throw Error(`Unbond variable: [${s}] !`)
    
    return ret 
  } else if (typeof s === "number") {
    return s
  } else if (s[0] === "quote") {
    return s[1]
  } else if (s[0] === "if") {
    const [_, test, ret, or] = s
    const exp = _evaluate(test, env) ? ret : or

    return _evaluate(exp, env)
  } else if (s[0] === "define") {
    const [_, name, exp] = s
    env[name] = _evaluate(exp, env)
  } else if (s[0] === "set!") {
    const [_, name, exp] = s
    env[name] = _evaluate(exp, env)
  } else if (s[0] === "lambda") {
    const [_, params, func] = s

    return (...args) => {
      const tmpEnv =  {}
      args.forEach((val, idx) => tmpEnv[params[idx]] = val)

      return _evaluate(func, merge(env, tmpEnv))
    }
  } else if (s[0] === "begin") {
    const [_, ...exps] = s

    return exps.map(exp => _evaluate(exp, env)).pop()
  } else {
    const [op, ...args] = s.map(exp => _evaluate(exp, env))

    // op should be a function or thorw error

    return op.apply(null, args)
  }
}

export const evaluate = (s) =>_evaluate(parse(tokenize(s)))
