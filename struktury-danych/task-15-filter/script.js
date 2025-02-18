const numbers = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

const positiveNumbers = numbers.filter(function(number, index, array){
    return number > 0
})

const negativeNumbers = numbers.filter(function(number, index, array){
    return number < 0
})

console.log(positiveNumbers)
console.log(negativeNumbers)


const  myOwnFilter = function (array, callback){

    let filteredArray = []

    for(let i = 0; i < array.length; i++) {

        const element = array[i]
        const index = i

        const result = callback(element, index, array)

        if(result){
            // poszczególne wyniki dodajemy do tablicy
            filteredArray = filteredArray.concat(element) 
        }
    }
    // zwracamy przefiltrowaną tablicę
    return filteredArray
}

const positiveNumbersByMyOwnFilter = myOwnFilter(numbers,  function(number, index, array){
    return number > 0
})

const negativeNumbersByMyOwnFilter = myOwnFilter(numbers,  function(number, index, array){
    return number < 0
})

console.log(positiveNumbersByMyOwnFilter)
console.log(negativeNumbersByMyOwnFilter)