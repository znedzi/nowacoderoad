'use strict'

var x = 1
var y = 2

if (x === y) {
    console.log('Prawda!')   
} else {
    console.log('Fałsz!')
}

if(x !== y) {
    console.log('Prawda x- nie jest równy')
} else {
    console.log('Fałsz x jest równy')
}

var string = 'Hello!'
var emptyString = ''

if(string) {
    console.log('Prawda')
} else {
    console.log('Fałsz')
}

if(emptyString) {
    console.log('Prawda')
} else {
    console.log('Fałsz')
}

// add(0,0) === 0
// add(0) === 0
// add() === 0
// add(5) === 5

function add(a, b) {
    console.log('a:', a)
    console.log('b:', b)

    if(a === undefined) {
        a = 0
    }

    if(b === undefined) {
        b = 0
    }
    
    return a + b
}