// Ref: http://norvig.com/lispy.html
// Using typescript as transpiler

const globalEnv = {}
const ops = ["+", "-", "*", "/", ">", "<", ">=", "<="].forEach(op => { globalEnv[op] = (a, b) => eval(`${a} ${op} ${b}`) })
globalEnv["="] = (a, b) => a === b
globalEnv["equal?"] = globalEnv["="]
globalEnv["eq?"] = globalEnv["="]
globalEnv["remainder"] = (a, b) => a % b
globalEnv["display"] = console.log

const tokenize = (input: string) => input.replace(/(\()|(\))/g, (_, a, b) => { if (a) { return `${a} `} else { return ` ${b}` } } ).split(" ")
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

// Return a obj that shadow copy from a and b, a's prop will overwrite b's prop 
function merge(a, b) {
  const obj = {}
  for (var key in b) { if (b.hasOwnProperty(key)) { obj[key] = b[key] } }
  for (var key in a) { if (a.hasOwnProperty(key)) { obj[key] = a[key] } }

  return obj
}

const matchString = /(^"(.*)"$)|(^'(.*)'$)/ 

export default function evalate(s: string | number | Array<string>, tmpEnv?) {
  const env = tmpEnv ? merge(globalEnv, tmpEnv) : globalEnv
  if (typeof s === 'string') {
    return s.match(matchString) ? s.replace(matchString, (_, a, b, c ,d) => { if (b) { return b } else { return d } }) : env[s] ? env[s] : `Error: Unbond symbol: ${s} !`
  } else if (typeof s === "number") {
    return s
  } else if (s[0] === "quote") {
    return s.slice(1)
  } else if (s[0] === "if") {
    const [_, test, ret, or] = s
    const exp = evalate(test) ? ret : or

    return evalate(exp)
  } else if (s[0] === "define") {
    const [_, name, exp] = s
    env[name] = evalate(exp)
  } else if (s[0] === "set!") {
    const [_, name, exp] = s
    env[name] = evalate(exp)
  } else if (s[0] === "lambda") {
    const [_, params, func] = s
    const tmpEnv = {}
    return (...args) => {
      // assgin closure variable into temp env
      args.forEach((val, idx) => tmpEnv[params[idx]] = val)

      return evalate(func, tmpEnv)
    }
  } else if (s[0] === "begin") {
    // todo
  } else {
    const [op, ...args] = s
    const operation = evalate(op, tmpEnv)
    const subedArgs = args.map(arg => evalate(arg, tmpEnv))

    return operation.apply(null, subedArgs)
  }
}

/* TEST */
let log = console.log

// const lamba1 = "(define area (lambda (r) (* 3.141592653 (* r r))))"
// const lamba2 = "(area 3)"
// evalate(parse(tokenize(lamba1)))
// var qa = evalate(parse(tokenize(lamba2)))
// log(qa)

// const t1 = "(define r 10)"
// const t2 = "(* 3 (* r r))"
// evalate(parse(tokenize(t1)))
// var q = evalate(parse(tokenize(t2)))
// log(q)

const if1 = '(if (> 1 2) (display "true") (display "false"))'
evalate(parse(tokenize(if1)))
// const str = '"123"'
// log(str)