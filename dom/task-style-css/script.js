const square = document.querySelector('.square')

// this is ok but inconvenient (niewygodny)
// square.setAttribute('style', 'background-color: red; width: 100px; height: 100px')


// NAJłATWIEJSZY Sposób tzw. STYLE LINIOWE
// square.style.height = '100px'
// square.style.width = '100px'
// square.style.backgroundColor = 'green'
// square.style.borderRadius = '50%'



// this is ok but inconvenient (niewygodny)
//pobieramy aktualne klasy i zapisujemy je do zmiennej
// const currentClassName = square.getAttribute('class')

//ustawiamy klasy, tj. zostawiamy klasy które już były currentClassName i dodajemy 
//nową klasę
// square.setAttribute('class', currentClassName + ' ' + 'red-square')

// this is ok but inconvenient (niewygodny)
// const currentClassName = square.className
// square.className = currentClassName + ' ' + 'red-square'

//Tworzymy obiekt styles, a następnie dołączmy go do strony
//dołączmy również klasę do strony
const styles = `
    .red-square {
        width: 100px;
        height: 100px;
        background-color: green;
    }`

// Tworzymy element style
const style = document.createElement('style')
style.innerHTML = styles
// utworzenie przykładowego id dla style
style.id = 'js-style-element-1'
// dodajemy obiekt style do head
document.head.appendChild(style)

// dodaje klasę do klas istniejących (nie wspierany przez IE)
square.classList.add('red-square')
// usuwa wybraną klasę
// square.classList.remove(red-square)
// usunięcie id styli, spowoduje usunięcie elementu styli
// document.querySelector('#js-style-element-1').remove()