'use strict'


var names = ['Ala', 'Ola', 'Ela', 'Agnieszka']
var numbers = [1, 2, 3, 4, 555]

// console.log(names[0])
// console.log(names[1])
// console.log(names[2]) // 2 , 3 so , names.length


for (var i = 0; i < names.length; i++) {
    console.log('For loop iteration no. ' +
         (i+ 1) +
          ' ' +
           names[i]
        );
    }


    var sum = 0

    for (var j = 0; j < numbers.length; j ++) {
        // console.log(numbers[j])
        sum = sum + numbers[j]
        console.log(sum);
        
    }

    console.log('sum of all numbers: ' + sum)
    