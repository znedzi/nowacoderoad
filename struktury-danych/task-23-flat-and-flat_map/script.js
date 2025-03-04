const people = [
    {name: 'Ala', age: 25, work: {experience: 3, salary: 4010}, city: 'Lublin', favoriteColors: ['green', 'yellow']},
    {name: 'Ola', age: 21, work: {experience: 3, salary: 5040}, city: 'Warszawa', favoriteColors: ['black', 'yellow']},
    {name: 'Ela', age: 28, work: {experience: 3, salary: 1600}, city: 'Gdańsk', favoriteColors: ['green']},
    {name: 'Iza', age: 24, work: {experience: 3, salary: 6300}, city: 'Lublin', favoriteColors: ['white', 'red']},
]

const allFavoriteColors = people.map(function(person){ return person.favoriteColors})

const allFavoriteColorsFlatten = allFavoriteColors.flat()

console.log(allFavoriteColorsFlatten)


console.log(
    people
        .map(function(person){ return person.favoriteColors})
        .flat()
)

console.log(
    people.flatMap(function(person) { return person.favoriteColors })
)


