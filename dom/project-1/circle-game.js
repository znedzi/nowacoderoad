// Pozbywamy się zmiennych z globalnego scopu(zakresu) poprzez otoczenie kodu funcją 
// samowywołującą się. Ukrywamy całą naszą aplikację w jednej funkcji.

const startCircleGame = (function(){

// Rysujemy kontener na pozycję koła i koło
// const container = createPositionContainer('body')
// const   circle = createCircle('body')

// w celu zapobiegnięcia rysowania koła przy niewywołanej funkcji tworzymy puste zmienne let
let container = null
let circle = null

function createPositionContainer(containerSelector) {
    
    const container = document.querySelector(containerSelector)

    //jeżeli nie ma containerSelector, to zakończ program
    if(!container) return


    const div = document.createElement('div')

    div.style.position = 'absolute'
    div.style.bottom = '0px'
    div.style.right = '0px'

    container.appendChild(div)

    return div
}

function createCircle(containerSelector){

    const container = document.querySelector(containerSelector)

    //jeżeli nie ma containerSelector, to zakończ program
    if(!container) return

    const circle = document.createElement('div')

    circle.style.position = 'absolute'
    circle.style.top = '0px'
    circle.style.left = '0px'
    circle.style.width = '100px'
    circle.style.height = '100px'
    circle.style.backgroundColor = 'blue'
    circle.style.borderRadius = '50%'

    container.appendChild(circle)

    // Dobra praktyka to zwracać obiekt, który funkcja produkuje, aby później móc 
    //się do niego odnieść (np. zmienić mu pozycję)
    return circle
}

// ta funkcja zamienia wartość stringową ze znacznikiem px, na samą postać liczbową
function extractPixelFromString(pixelsString){
    return Number(pixelsString.replace('px', ''))
}

function move(deltaX = 0, deltaY = 0){
    const currentTop = extractPixelFromString(circle.style.top)
    const currentLeft = extractPixelFromString(circle.style.left)

    circle.style.top = currentTop + deltaY + 'px'
    circle.style.left = currentLeft + deltaX + 'px'

    dispalyPosition()
}

function moveDown(deltaTop = 10) {
    //aktualna warość naszego koła w wartości liczbowej
    // const currentTop = Number(circle.style.top.replace('px', ''))

    //przesuwamy koło o sumę aktualnej jego wartości oraz wartości dodanej 
    // circle.style.top = currentTop + deltaTop + 'px'

    // zastępujemy powyższe linie kodem uniwersalnym (wywołaniem funkcji move())
    move(0, deltaTop)
}

function moveLeft(deltaLeft = 10) {
    //aktualna warość naszego koła w wartości liczbowej
    // const currentLeft = Number(circle.style.left.replace('px', ''))

    //przesuwamy koło o sumę aktualnej jego wartości oraz wartości dodanej 
    // circle.style.left = currentLeft + deltaLeft + 'px'

    // zastępujemy powyższe linie kodem uniwersalnym (wywołaniem funkcji move())
    move(-deltaLeft, 0)
}

function moveUp(deltaTop = 10) {
    //aktualna warość naszego koła w wartości liczbowej
    // const currentTop = Number(circle.style.top.replace('px', ''))

    //przesuwamy koło o sumę aktualnej jego wartości oraz wartości dodanej 
    // circle.style.top = currentTop - deltaTop + 'px'

    // zastępujemy powyższe linie kodem uniwersalnym (wywołaniem funkcji move())
    move(0, -deltaTop)
}

function moveRight(deltaLeft = 10) {
    //aktualna warość naszego koła w wartości liczbowej
    // const currentLeft = Number(circle.style.left.replace('px', ''))

    //przesuwamy koło o sumę aktualnej jego wartości oraz wartości dodanej 
    // circle.style.left = currentLeft - deltaLeft + 'px'

    // zastępujemy powyższe linie kodem uniwersalnym (wywołaniem funkcji move())
    move(deltaLeft, 0)
}

function dispalyPosition() {

    // czyścimy kontener
    container.innerHTML = ''

    // funcja pobiera właściowości (w tym współrzędne) wybranego elementu 
    const position = circle.getBoundingClientRect()

    const pX = document.createElement('p')
    const pY = document.createElement('p')

    // dajemy nawiasy, aby najpierw wykonał się kod w nawiasie i dopiero, aby został przyleiony do stringa
    //inaczej mielibyśmy konkatenację i konkatenację
    pX.innerText = 'Position X: ' + (position.x + position.width / 2)
    pY.innerText = 'Position Y: ' + (position.y + position.height / 2)

    // wkładamy utworzone funkcje do kontenera
    container.appendChild(pX)
    container.appendChild(pY)
}





function keyEventHandler(event){
    console.log(event.key)

    // dla przypadku naciśnięcia klawisza strzałka w dół
    // if(event.key === 'ArrowDown'){
    //     moveDown
    // }


// instrukcja switch obejmuje wszystkie przypadki
    switch (event.key) {
        case 'ArrowUp':
            moveUp()
            break
        case 'ArrowDown':
            moveDown()
            break
        case 'ArrowLeft':
            moveLeft()
            break
            case 'ArrowRight':
            moveRight()
            break
        default:
            break;
    }
}
       
// Jeżeli coś inicjalizujemy (czyli rozpoczynamy pracę) to wywołujemy funkcję init.
function init(){
    // Rysujemy kontener na pozycję koła i koło i przypisujemy do wcześniej utworzonych
    // zmiennych let
    container = createPositionContainer('body')
    circle = createCircle('body')


dispalyPosition()

window.addEventListener(
    'keydown',
    keyEventHandler
)
}

// wywołujemy funkcję
// init()

// zwracamy funkcję na zewnątrz
return init


})()