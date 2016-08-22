import { eva } from "./index"

const test = (exps: Array<string>, expect) => {
  const output = exps.map((exp) => eva(exp)).pop()
  try {
    console.assert(JSON.stringify(expect) === JSON.stringify(output), `Expect: ${expect}, but get ${output}`)
  } catch (err) {
    console.log("Error")
    console.log("Test: ", exps)
    console.error(err.message, "\n")
  }
}

test(["(define area (lambda (r) (* 3.141592653 (* r r))))", "(area 3)"], 28.274333877)
test(["(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))","(fact 10)"], 3628800)
test(["(define fact (lambda (n) (if (<= n 1) 1 (* n (fact (- n 1))))))","(fact 100)"], 9.33262154439441e+157)
let preDefine = [
  "(define first car)",
  "(define rest cdr)",
  "(define count (lambda (item L) (if L (+ (equal? item (first L)) (count item (rest L))) 0)))"
]
test(preDefine.concat(["(count 0 (list 0 1 2 3 0 0))"]), 4) // 3
test(preDefine.concat(["(count (quote the) (quote (the more the merrier the bigger the better)))"]), 5) // 4

preDefine = [
  "(define twice (lambda (x) (* 2 x)))",
  "(twice 5)",
  "(define repeat (lambda (f) (lambda (x) (f (f x)))))",
]
test(preDefine.concat(["((repeat (repeat twice)) 10)"]), 160)
test(preDefine.concat(["((repeat (repeat (repeat twice))) 10)"]), 2560)
test(preDefine.concat(["((repeat (repeat (repeat (repeat twice)))) 10)"]), 655360)

test(["(pow 2 16)"], 65536)

preDefine = [
  "(define fib (lambda (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2))))))",
  "(define range (lambda (a b) (if (= a b) (quote ()) (cons a (range (+ a 1) b)))))"
]
test(preDefine.concat(["(range 0 10)"]), [0,1,2,3,4,5,6,7,8,9])
test(preDefine.concat(["(map fib (range 0 10))"]), [1,1,2,3,5,8,13,21,34,55])
test(preDefine.concat(["(map fib (range 0 20))"]), [1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597,2584,4181,6765])

console.log("\nTest done.")
