// Ref: http://norvig.com/lispy.html
// Using typescript as transpiler

// TODO list data type


const globalEnv = {}
// Import all Math method for convenience
Object.getOwnPropertyNames(Math).forEach(method => globalEnv[method] = Math[method])
// Import operator by eval closure
const ops = ["+", "-", "*", "/", ">", "<", ">=", "<="].forEach(op => { globalEnv[op] = (a, b) => eval(`${a} ${op} ${b}`) })
// self defined
globalEnv["="] = (a, b) => a === b
globalEnv["equal?"] = globalEnv["="]
globalEnv["eq?"] = globalEnv["="]
globalEnv["remainder"] = (a, b) => a % b
globalEnv["display"] = console.log
globalEnv["append"] =
globalEnv["apply"] =
globalEnv["begin"] =
globalEnv["car"] = x => (x.length !== 0) ? x[0] : null 
globalEnv["cdr"] = x => (x.length > 1) ? x.slice(1) : null 
globalEnv["cons"] = (x: any, y: Array<any>) => [x].concat(y)
globalEnv["length"] = x => x.length
globalEnv["list"] = (...x) => x
globalEnv["list?"] = x => typeof x === "array"
globalEnv["range"] = (a, b) => [...Array(b-a+1)].map((v, k) => k + a)
globalEnv["map"] = (cb, list) => list.map(cb)

/*
'not':     op.not_,
'null?':   lambda x: x == [], 
'number?': lambda x: isinstance(x, Number),   
'procedure?': callable,
'symbol?': lambda x: isinstance(x, Symbol),
*/

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

function evalate(s: string | number | Array<string>, env = globalEnv) {
  if (typeof s === 'string') {
    return s.match(matchString) ? s.replace(matchString, (_, a, b, c ,d) => { if (b) { return b } else { return d } }) : env[s]
  } else if (typeof s === "number") {
    return s
  } else if (s[0] === "quote") {
    return s[1]
  } else if (s[0] === "if") {
    const [_, test, ret, or] = s
    const exp = evalate(test, env) ? ret : or

    return evalate(exp, env)
  } else if (s[0] === "define") {
    const [_, name, exp] = s
    env[name] = evalate(exp, env)
  } else if (s[0] === "set!") {
    const [_, name, exp] = s
    env[name] = evalate(exp, env)
  } else if (s[0] === "lambda") {
    const [_, params, func] = s

    return (...args) => {
      const tmpEnv =  {}
      args.forEach((val, idx) => tmpEnv[params[idx]] = val)

      return evalate(func, merge(env, tmpEnv))
    }
  } else if (s[0] === "begin") {
    const [_, ...exps] = s

    return exps.map(exp => evalate(exp, env)).pop()
  } else {
    const [op, ...args] = s
    const operation = evalate(op, env)
    const subedArgs = args.map(arg => evalate(arg, env))

    return operation.apply(null, subedArgs)
  }
}

export const eva = (s) =>evalate(parse(tokenize(s)))
