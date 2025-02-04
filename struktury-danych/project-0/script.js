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

// funkcja render jest niezależna generuje diva z elementami input, p i nasłuchem addEventListener
const render = function () {
    
    const container = document.createElement('div')
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

    // zwracamy div-a z input i p (możemy zwrócić tylko jeden element, a w ten sposób zwracamy obydwa)
    return container
}



// funkcja init ma wywołać naszą aplikację (zawsze piszemy tę funkcję i służy ona 
// do rozruchu naszej aplikacji. Przekazuje jedyną zmienną do globalnego scopu.)

const init = function(containerSelector){

    // deklarujemy kontener w którym zostanie umieszczony nasz kalkutator
    const container = document.querySelector(containerSelector)

    // sprawdzamy czy kontener jest utworzony
    if(!container){
        console.error('Container not found in document')
        return
    } 

    // tworzymy kontener z naszymi elementami p i input oraz addEventListenerem
    // i przypisujemy go do zmiennej app
    const app = render(container)

    // przypisujemy app do container
    container.appendChild(app)
}

// zwracamy init na zewnątrz funkcji
return init

})()

