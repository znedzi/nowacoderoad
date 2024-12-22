'use strict'

; (function(numbersAmount){

var numbersAmount



// to co urzytkownik przekaże do środka użyj jako dwie liczby dodawania 
    function add(a, b){
        return a + b
    }
    
    // to co urzytkownik przekaże do środka użyj jako zmienną "sum"
    function showResult(sum) {
        
        if(sum) {
        
            alert('The result is:  ' + sum)
        
        } else { //sum is equal to NaN or 0
        
            if(sum === 0) {
                alert('The result is:' + sum)
            } else {
                alert('Sorry, you provided not a number')
            }
        }
    }

    function getNumberForUser (){
        var userInput1 = (prompt('Please type a number!', 0))
        var number = Number(userInput1)
        return number
    }
    

    var result = 0


    for(var i = 0; i < numbersAmount; i++) {
        var number = getNumberForUser()
        result = add(result, number)
    }
  
        
    showResult(result)
 
})(2)
