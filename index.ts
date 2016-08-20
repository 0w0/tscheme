// Ref: http://norvig.com/lispy.html
// Using typescript as traspiler

const globalEnv = {}
// globalEnv["+"] = (a, b) => a + b
// globalEnv["-"] = (a, b) => a - b
// globalEnv["*"] = (a, b) => a * b
// globalEnv["/"] = (a, b) => a / b
// globalEnv[">"] = (a, b) => a > b
// globalEnv["<"] = (a, b) => a < b
// globalEnv[">="] = (a, b) => a >= b
// globalEnv["<="] = (a, b) => a <= b
// globalEnv["="] = (a, b) => a === b
const ops = ["+", "-", "*", "/", ">", "<", ">=", "<=", "="].forEach(op => { globalEnv[op] = (a, b) => eval(`${a} ${op} ${b}`) })
globalEnv["equal?"] = globalEnv["="]
globalEnv["eq?"] = globalEnv["="]
globalEnv["remainder"] = (a, b) => a % b

const tokenize = (input: string) => input.replace(/(\()|(\))/g, (_, a, b) => { if (a) { return `${a} `} else { return ` ${b}` } } ).split(" ")
const atom = (token) => {
  const ret = Number(token)

  return isNaN(ret) ? token : ret
}
const parse = (tokens: Array<string>) => {
  if (tokens.length === 0) throw Error("Unexpected EOF while reading !")
  const no1 = tokens.shift()
  if (no1 === "(") {
    let list = []
    while (tokens[0] !== ")") {
      list.push(parse(tokens))
    }
    tokens.shift()

    return list
  } else if (no1 === ")") {
    throw Error("Unexpected ) !")
  } else {
    return atom(no1)
  }
}

import * as R from "ramda"

export default function evalate(s: string | number | Array<string>, tmpEnv?) {
  const env = tmpEnv ? R.merge(globalEnv, tmpEnv) : globalEnv
  // if (tmpEnv) console.log(s)
  if (typeof s === 'string') {
    return env[s]
  } else if (typeof s === "number") {
    return s
  } else if (s[0] === "quote") {
    return s.slice(1)
  } else if (s[0] === "if") {
    const [_, test, ret, or] = s
    
    return evalate(test) ? ret : or
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

const lamba1 = "(define area (lambda (r) (* 3.141592653 (* r r))))"
const lamba2 = "(area 3)"

const t1 = "(define r 10)"
const t2 = "(* 3 (* r r))"
const t3 = "(* 3 2)"

evalate(parse(tokenize(lamba1)))
const qa = evalate(parse(tokenize(lamba2)))

console.log(qa)

// console.log(env)
// console.log(
  // parse(tokenize(lamba1))
// )

// evalate(parse(tokenize(t1)))
// console.log(env)
// var q = evalate(parse(tokenize(t2)))
// var q = evalate(parse(tokenize("12")))

// console.log(q)

// console.log(q)

// evalate(parse(tokenize(t1)), env)
// test
// console.log(JSON.stringify(
  // tokenize(input3)
  // parse(tokenize(t1)),
  // evalate(parse(tokenize(t3)), env)
// ))
