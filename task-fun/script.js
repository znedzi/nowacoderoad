'use strict'


var func = console.log

// funkcja console.log nic nie zwraca
var result = console.log('Hello')

console.log('func:', func)
console.log(result)

var x = 5
var y = 10

// add becomes a variable accessible in global scope

function add(x, y){
    // var x = 1
    // var y = 2

    return x + y
}

console.log(add)
console.log(add(5,5))
console.log(add(5,20))




