const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

let numbersMultiplied = []

for(let i = 0; i < numbers.length; i++) {

    const number = numbers[i]
    const numberMultiplied = number * 2

    numbersMultiplied = numbersMultiplied.concat(numberMultiplied)
}

console.log(numbersMultiplied)

const numbersMultiplied2 = numbers.map(function(element, index, array){
    return element * 2
})

console.log(numbersMultiplied2)

// ******************************************

const myOwnMap = function(array_1, callback) {

        let arrayMapped = []

        for(let i =0; i < array_1.length; i++) {
            const element = array_1[i]
            const index = i
            const array = array_1

            const result = callback(element, index, array)

            arrayMapped = arrayMapped.concat(result)
        }

        return arrayMapped
}

const numbersMultipliedMyOwnMap = myOwnMap(numbers, function(element, index, array){
    return element * 2
})

console.log(numbersMultipliedMyOwnMap)

