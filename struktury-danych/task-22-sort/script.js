const people = [
    {name: 'Ala', age: 25, work: {experience: 3, salary: 4010}, city: 'Lublin', favoriteColors: ['green', 'yellow']},
    {name: 'Ola', age: 21, work: {experience: 3, salary: 5040}, city: 'Warszawa', favoriteColors: ['black', 'yellow']},
    {name: 'Ela', age: 28, work: {experience: 3, salary: 1600}, city: 'Gdańsk', favoriteColors: ['green']},
    {name: 'Iza', age: 24, work: {experience: 3, salary: 6300}, city: 'Lublin', favoriteColors: ['white', 'red']},
]

const names = ['Ala', 'Ola', 'Ela']

const numbers = [-1, 10, -100, 3, 4, 1, 11, 15, 20, 21, 0]


// funkcja sortowanie malejące
const sortAscending = function (a, b) { return b -a }


// funkcja sortowanie rosnące
const sortDescending = function (a, b) { return a - b }

const numberSorted = (
    numbers
    .slice()
    .sort(sortAscending)
    // odwróć sortowanie
    .reverse()
)

console.log(numberSorted)

const peopleByAge = (
    people
    .slice()
    .sort(function(personA, personB){
        return sortAscending(personA.age, personB.age)
    })
)

console.log(peopleByAge)

const peopleBySalary = (
    people
    .slice()
    .sort(function(personA, personB){
        return sortAscending(personA.work.salary, personB.work.salary)
    })
)

console.log(peopleBySalary)
