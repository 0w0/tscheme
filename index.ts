// Ref: http://norvig.com/lispy.html
// Using typescript as traspiler

const input = "(set! twox (* x 2))"
const input2 = "(define circle-area (lambda (r) (* pi (* r r))))"
const input3 = "(begin (define r 10) (* pi (* r r)))"

const env = new Object()
const tokenize = (input: string) => input.replace(/(\()|(\))/g, (_, a, b) => { if (a) { return `${a} `} else { return ` ${b}` } } ).split(" ")
const atom = (token) => {
  const ret = Number(token)

  return isNaN(ret) ? token : ret;
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

// test
console.log(
  // tokenize(input3)
  parse(tokenize(input3))
)

/*

[ '(', 'set!', 'twox', '(', '*', 'x', '2', ')', ')' ] // no1 === ( 
['set!', 'twox', '(', '*', 'x', '2', ')'] // return atom(tokens)
['set!', 'twox', ['*', 'x', 2]]

*/