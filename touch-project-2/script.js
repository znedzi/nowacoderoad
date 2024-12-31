'use strict'

function showResult(result){
    alert('Result is: ' + result)
}
function getNumberFormUser(){
    var input = prompt('Type number!')
    return Number(input)
    
}
function getOperatorFromUser(){
    return prompt('Type operator (+, -, *, /)' )
}
function getConfirmationFromUser(){
    return confirm('Do you wat to proceed?')
}
function getConfirmationFromUserAndProced(result){
    var confirmation = getConfirmationFromUser()

//Jeśli użytkownik wykonuje kolejne ioperacje to wchodzimy w mainLoop, jeśli tylko jedną to wyświetlamy showResult

    if(confirmation){
        mainLoop(result)
    } else {
        showResult(result)
    }
}
function calculate(operator, a, b){
    var calculation = 0

    switch(operator){
        case '+':
            return a + b
        case '-':
            return a - b
        case '*':
            return a * b
        case '/':
            return a / b
    }
}

function mainLoop(result){
    var operator = getOperatorFromUser()
    var number = getNumberFormUser()

    var newResult = calculate(operator, result, number)

    getConfirmationFromUserAndProced(newResult)
}

var result = getNumberFormUser()

getConfirmationFromUserAndProced(result)


