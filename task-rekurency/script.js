'use strict'


var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// for(var i = 0; i < numbers.length; i++){
//     console.log(numbers[i])
// }

// var i = 0

// function displayNumbers(){
//     console.log(numbers[i])

//     i++

//     if(i < numbers.length){
//         displayNumbers()
//     }
// }

// displayNumbers()

function displayNumbers(i){

    // jeśli warunek spełniony, to return
    if(i >= numbers.length) return
    console.log(numbers[i])

    i++
    displayNumbers(i)

}

displayNumbers(0)