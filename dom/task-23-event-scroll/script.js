const offset = 50

function onWindowScroll(event){
    // console.log(this.window.scrollY)

    const navbar = document.querySelector('.navbar')
    const square = document.querySelector('.square')

    //wysokość widocznego okna
    const viewportHeight = window.innerHeight
    // console.log(this.innerHeight)
    

    const squarePosition = square.getBoundingClientRect()
    
    const squareBottom = squarePosition.bottom
    const squareTop = squarePosition.top

    if(squareBottom < offset) {
        navbar.innerText = 'Square is out (above) of viewport'
    } else if (squareTop > viewportHeight) {
        navbar.innerText = 'Square is out (bellow) of viewport'
    } else {
        navbar.innerText = 'Square is in the viewport'
    }
}

// wywołujemy funkcję onWindowScroll w celu określenia położenia kwadratu 
// za czym posuszymy scrollem ponieważ, to scroll uruchamia addEventListener 
onWindowScroll()
window.addEventListener(
    'scroll',
    onWindowScroll
)

