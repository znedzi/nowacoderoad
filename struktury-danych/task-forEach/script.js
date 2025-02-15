const names = ['Ala', 'Ola', 'Ela']

for (let i=0; i < names.length; i++){
    const name = names[i]
    console.log(name)
}

for (let i = 0; i < names.length; i++ ){
    const element = names[i]
    const index = i
    const array = names
    console.log(element, index, array)
}


const result = names.forEach(console.log)
console.log(result) //it always will be undefined !

// tak jak poniżej działa pętla forEach jest napisana w C++
const myOwnForEach = function(array, callback){

    for (let i = 0; i < names.length; i++ ){
        const element = names[i]
        const index = i
        const array = names

        callback(element, index, array)
    }
}

myOwnForEach(names, console.log)

const numbers = [0, 1, 2, 3, 4, 5, 6 ,7 ,8 ,9]

let sum = 0

for (let i = 0; i < numbers.length; i++) {
    const element = numbers[i]
    sum = sum + numbers[i]
}

console.log(sum)

// *****************************************

let sumForEach = 0

numbers.forEach(function(element, index, array) {
    
    sumForEach = sumForEach + element

})

console.log(sumForEach)
