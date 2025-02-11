const numbers = [0,1,2,3,4,5,6,7,8,9]

const newNumbers = numbers

// this is true because in newNumbers is reference to array in numbers
console.log(numbers === newNumbers)

const copyOfNumbers = numbers.slice()

// this is false cause copyOfNumbers is newArray produced by .slice()
console.log(numbers === copyOfNumbers)

const person1 = {name: 'Ola', age: 21}
const person2 = {name: 'Ala', age: 21}


const people = [
    person1,
    person2,
]

const newPeople = people

console.log(newPeople === people) //true

const copyOfPeople = people.slice()

// tworzona jest kopia tablicy, ale do obiektów wewnątrz niej są tylko tworzone 
// referencje w nowoutworzonej tablicy 
console.log(copyOfPeople === people) //false

// this is a SHALLOW COPY, references inside array stays the same!
console.log(copyOfPeople[0] === people[0]) //true

const newNumbers2 = numbers.slice(-3,-1)

console.log(newNumbers2)


const removeElement = function(array, indexToRemove) {
    const head = array.slice(0, indexToRemove)
    const tail = array.slice(indexToRemove + 1)

    const newArray = head.concat(tail)

    return newArray
}

const numbersWithout4 = removeElement(numbers, 4)
console.log(numbersWithout4)




