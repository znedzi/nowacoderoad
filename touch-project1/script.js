'use strict'


function add(a, b){
    return a + b
}


var userInput1 = Number(prompt('Please type a number!', 0))
var userInput2 = Number(prompt('Please type a number!', 0))


// console.log('suma liczb wynosi:', add(userInput1, userInput2));
// console.log('suma liczb wynosi:', add(x, y));

var sum = add(userInput1, userInput2)


if(sum) {

    alert('The result is:' + sum)

} else { //sum is equal to NaN or 0

    if(sum === 0) {
        alert('The result is:' + sum)
    } else {
        alert('Sorry, you provided not a number')
    }
}