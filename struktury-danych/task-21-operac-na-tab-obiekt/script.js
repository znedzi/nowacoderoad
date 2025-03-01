const people = [
    {name: 'Ala', age: 25, work: {experience: 3, salary: 4010}, city: 'Lublin', favoriteColors: ['green', 'yellow']},
    {name: 'Ola', age: 21, work: {experience: 3, salary: 5040}, city: 'Warszawa', favoriteColors: ['black', 'yellow']},
    {name: 'Ela', age: 28, work: {experience: 3, salary: 1600}, city: 'Gdańsk', favoriteColors: ['green']},
    {name: 'Iza', age: 24, work: {experience: 3, salary: 6300}, city: 'Lublin', favoriteColors: ['white', 'red']},
]

//sum of salaries
//city === Lublin
// experience > 2

// let sum = 0

// for (let i = 0; i < people.length; i++){
//     const person = people[i]

//     if (
//         person.city === 'Lublin' &&
//         person.work.experience > 2
//     ) {
            // Jeżeli wartość nie istnieje, wstaw 0
//         sum = sum + (person && person.work && person.work.salary) || 0)
//     }
// }

// console.log(sum)


// peopleFromLublin = people.filter(function(person) {
//     return person.city === 'Lublin' 
// })
// peopleWithExpGt2 = peopleFromLublin.filter(function(person){
//      return person.work.experience > 2
//     })

// const salaries = peopleWithExpGt2.reduce(
//     function(reduced, person){
//     return reduced + person.work.salary
// },0
// )

// console.log(salaries)


const filterByCity = function(city){
    return function(person) {
        return (person && person.city) === city 
    }
}

const filterByWorkExperience = function(experience){
    return function(person){
        return (person && person.work && person.work.experience) > experience
    }
}

const sumSalaries = function(reduced, person){
        // jeżeli wartość nie istnieje wstaw 0
        return reduced + ((person && person.work && person.work.salary) || 0)
    }

const salaries =  (
    people
        .filter(filterByCity('Warszawa'))
        .filter(filterByWorkExperience(2))
        .reduce(sumSalaries, 0)
)

console.log(salaries)

const salaries2 =  (
    people
        .filter(filterByCity('Gdańsk'))
        .filter(filterByWorkExperience(2))
        .reduce(sumSalaries, 0)
)

console.log(salaries2)

