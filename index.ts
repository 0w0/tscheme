const input = "(set! twox (* x 2))"

const tokenize = (input: string) => input.replace(/(\()|(\))/g, (_, a, b) => {if(a) { return `${a} `} else { return ` ${b}` } }).split(" ")
const parse = (token) => {}




// test
console.log(
  tokenize(input)
)