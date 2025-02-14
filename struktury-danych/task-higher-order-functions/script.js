//  Przykład nr 1

// const hello = function (name){
//     console.log('Hello ' + name)
// }

// const makeHello = function(){
//     return hello
// }

// makeHello()('Janek')
// makeHello()('Maciek')
// makeHello()('Zbyszek')

// // Przykład nr 2

// const makeHello2 = function() {
//     return function(){
//         console.log('Hello world!')
//     }
// }

// const hello2 = makeHello2()

// hello2()

const callWithNumber2 = function(fn){
    return fn(2)
}

const add2 = function(x){
    return x + 8
}

// callWithNumber2 z parametrem add2 zwróci 10
// gdyż jako parametr fn jest wstawiana funkcja add2
console.log(
    callWithNumber2(add2)
)


// callWithNumber2 po przekazaniu funkcji consol.log 
// podstawi ją jako parametr fn 2, która zostanie wyświetlona
// gdyz jako parametr jest wstawiana funkcja console.log
callWithNumber2(console.log) 