const names1 = ['Ala', 'Ola']
const names2 = ['Ela', 'Iza']
const names3 = ['Marta', 'Maja']


const allNames = (

    names1
        .concat(names2)
        .concat(names3)

) 

console.log(allNames)
console.log(allNames.length)

console.log(

    names1
        .concat(names2)
        .concat(names3)
        .length

)

const allNamesReverted = (

    names2
        .concat(names2)
        .concat(names1)
)

const allNamesRevertedSecondTime = (

    names1
        .concat(names2)
        .concat(names3)

)
// nowo utworzone tablice nie są sobie równe, bo to nie są referencje
//  do tej samej tablicy
console.log(allNamesReverted === allNamesRevertedSecondTime)  //false

const allNamesPlusOneMore = allNames.concat('Malwina')
console.log(allNamesPlusOneMore)
