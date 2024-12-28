'use strict'


var num1 = 1
var num2 = 2

var operator = prompt('Please type on of +, -, *, /')

// var operator = '*'

function add(a, b){
    return a + b
}

function substract(a, b){
    return a - b
}

function multiply(a, b){
    return a * b
}

function divide(a, b){
    return a / b
}

function displayError(){
    alert('Wrong operator!')
}

function displayResult(result){
    alert('Result is: ' + result)
}

function displayInfo(error, result){
    if(error){
        displayError()
    } else {
        displayResult(result)
    }
}

var result = 0
var error = false 

// if(operator === '+') {
//     result = add(num1, num2)
// } else if(operator === '-') {
//     result = substract(num1, num2)
// } else if(operator === '*') {
//     result = multiply(num1, num2)
// } else if(operator === '/') {
//     result = divide(num1, num2)
// } else {
//     error = true
// }

switch (operator) {
    case '+':
        result = add(num1,num2)
        break;
    case '-':
        result = substract(num1,num2)
        break;
    case '*':
        result = multiply(num1,num2)
        break;
    case '/':
        result = divide(num1,num2)
        break;
    default:
        error = true //ustawiamy flagę na true, domyślnie jest false
}


displayInfo(error, result)
