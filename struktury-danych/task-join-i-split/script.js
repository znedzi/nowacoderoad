const numbers = [1, 2, 3, 4, 5, {name: 'Zbyszek'}]

// join wstawia separator
const numbersInString = numbers.join('-')

console.log(numbersInString)

// ponowne utworzenie tablicy
const numberFromSting = numbersInString.split('-')

console.log(numberFromSting)
