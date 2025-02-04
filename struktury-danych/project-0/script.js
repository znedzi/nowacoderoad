const initCalculator = (function(){

const sumNumbersFromString = function(numbersInString){

    const numbers = numbersInString.split(',')

    // console.log(numbers)
    
    let sum = 0

    for (let i =0; i < numbers.length; i++){
        
        const number = Number(numbers[i])

        sum = sum + number
    }

    return sum
}

// tej funkcji nie interesuje, gdzie będzie wyświetlany wynik ona ma go tylko skonstrułować
// i zwrócić
const renderResult = function(value){

    const result = sumNumbersFromString(value)

    // Jeżeli result jest NaN, to zwróć 'Error in input!'
    if(Number.isNaN(result)) {
        return 'Error in input!'
    }

    return 'Sum is: ' + result
}


const render = function (containerSelector) {
    
    if(!containerSelector) return

    const container = document.querySelector(containerSelector)

    const input = document.createElement('input')
    const p = document.createElement('p')

    // za pierwszym razem wyświetlamy w "p" wartość sum = 0
    p.innerText = renderResult(input.value)

    // nie możemy napisać w addEventListener samego renderResult()
    // gdyż funkcja była by wywołana w momencie wywołania funkcji render(),
    // a my chcemy wywołac ją w momencie wywołania input
    input.addEventListener(
        'input',
        // wywołanie funkcji w momencie zajścia zdarzenia
        function(){
            // włóż do "p" wynik wygenerowany w renderResult w zależności od input.value
            p.innerText = renderResult(input.value)
        }
    )

    container.appendChild(input)
    container.appendChild(p)
}


// funkcja init ma wywołać naszą aplikację (zawsze piszemy tę funkcję i służy ona 
// do rozruchu naszej aplikacji. Przekazuje jedyną zmienną do globalnego scopu.)

const init = function (containerSelector){

    render(containerSelector)
}

// zwracamy init na zewnątrz funkcji
return init

})()

