const people = [
    {id: '00001', name: 'Ala', age: 25 },
    {id: '00002', name: 'Ola', age: 21 },
    {id: '00003', name: 'Ela', age: 28 },
    {id: '00004', name: 'Iza', age: 24 },
]

const peopleObject = people.reduce(
    
    function(reduced, person, index,array){
        const key = person.id
        const value = person

        // delete służy do usuwania wartości z obiektu
        delete value.id
        
        reduced[key] = value
        
        return reduced
    },{}
)

console.log(peopleObject)
