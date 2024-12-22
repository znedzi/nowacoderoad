'use strict'


var text = 'Hello!'
var endIncrement = 10

for (var i = 0; i < endIncrement; i = i +  1) {
    console.log(text + ( i + 1))
}

for (var j = 0; j < endIncrement; j++) {
    console.log(text + (j + 1))
}

for (var decrement = endIncrement; decrement > 0; decrement--) {
    console.log(text + decrement)
}