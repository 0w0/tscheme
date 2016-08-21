// Ref: http://norvig.com/lispy.html
// Using typescript as transpiler

const globalEnv = {}
const ops = ["+", "-", "*", "/", ">", "<", ">=", "<="].forEach(op => { globalEnv[op] = (a, b) => eval(`${a} ${op} ${b}`) })
globalEnv["="] = (a, b) => a === b
globalEnv["equal?"] = globalEnv["="]
globalEnv["eq?"] = globalEnv["="]
globalEnv["remainder"] = (a, b) => a % b
globalEnv["display"] = console.log
globalEnv["pi"] = Math.PI

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
  for (let key in a) { obj[key] = a[key] }
  for (let key in b) { obj[key] = b[key] }

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
    const exp = evalate(test, tmpEnv) ? ret : or

    return evalate(exp, tmpEnv)
  } else if (s[0] === "define") {
    const [_, name, exp] = s
    env[name] = evalate(exp, tmpEnv)
  } else if (s[0] === "set!") {
    const [_, name, exp] = s
    env[name] = evalate(exp, tmpEnv)
  } else if (s[0] === "lambda") {
    const [_, params, func] = s
    const tmpEnv = {}
    return (...args) => {
      // assgin closure variable into temp env
      args.forEach((val, idx) => tmpEnv[params[idx]] = val)

      return evalate(func, tmpEnv)
    }
  } else if (s[0] === "begin") {
    const [_, ...exps] = s

    return exps.map(exp => evalate(exp, tmpEnv)).pop()
  } else {
    const [op, ...args] = s
    const operation = evalate(op, tmpEnv)
    // console.log("",env)
    const subedArgs = args.map(arg => evalate(arg, tmpEnv))

    return operation.apply(null, subedArgs)
  }
}

// import * as repl from "repl"
// repl.start({
//   prompt: "tscheme> ",
//   eval: (cmd, context, filename, callback) => {
//     callback(null, evalate(parse(tokenize(cmd.replace(/\n$/, "")))))
//   }
// })

/* TEST */
let log = console.log
let eva = (s) => evalate(parse(tokenize(s)))
// const lamba1 = "(define area (lambda (r) (* 3.141592653 (* r r))))"
// const lamba2 = "(area 3)"
// eva(lamba1)
// var qa = eva(lamba2)
// log(qa)

// const t1 = "(define r 10)"
// const t2 = "(* 3 (* r r))"
// eva(t1)
// var q = eva(t2)
// log(q)

// const if1 = '(if (> 1 0) (display "true") (display "false"))'
// eva(if1)

// const begin = "(begin (define r 10) (* pi (* r r)))"
// log(eva(begin))

// const fact1 = "(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))"
// const fact2 = "(fact 100)"
// eva(fact1)
// var q = eva(fact2)
// log(q)
