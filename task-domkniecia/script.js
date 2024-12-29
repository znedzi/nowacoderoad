'use strict'


function add(a, b){
    return a + b
}


function  makeAdd(a){
    return function (b) {
        return a + b
    }
}

var add10 = makeAdd(10)
var add3 = makeAdd(3)



console.log(add10(1))   //11
console.log(add10(12))   //22
console.log(add10(-3))   //7

console.log(add3(1))    //4
console.log(add3(12))   //15
console.log(add3(-3))   //0