const input = document.getElementById('input');
const output = document.getElementById('output');

//This is the process Item function
function processItem(qty, singular) {
  if (qty < 1000) {
    if (qty === 0) {
      //console.log(makePlural(singular));
      return 'no' + ' ' + makePlural(singular);
    } else if (qty === 1) {
      //console.log(makePlural(singular));
      return 'one' + ' ' + makePlural(singular);
    } else {
      //console.log(makePlural(singular));
      return qty + ' ' + makePlural(singular);
    }
  }
}

function processInput() {
  //const IN = input.value;
  const inList = input.value.split('\n')

  const count = +inList[0]

  for (let i = 1; i <= count; i++) {
    //proceeds to split each line into two parts the number and the object
    const item = inList[i].split(' ');
    const qty = +item[0];
    const singular = item[1];
    console.log(qty, singular);

    if (qty < 1000) {
      const result = processItem(qty, singular);
      output.innerHTML += result;
      output.innerHTML += '<br />'
    }
  }
}

function makePlural(singular) {
  if (singular.endsWith('s') ||
    singular.endsWith('x') ||
    singular.endsWith('z') ||
    singular.endsWith('ch') ||
    singular.endsWith('sh')) {
    return singular + 'es';
  } else if (singular.endsWith('o') && !'aeiouy'.includes(singular.slice(-2, -1))) {
    return singular + 'es';
  } else if (singular.endsWith('y') &&
    'qwrtypsdfghjklzxcvbnm'.includes(singular.slice(-2, -1))) {
    return singular.slice(0, -1) + 'ies';
  } else if (singular.endsWith('fe') &&
    !(singular.slice(0, -2)).includes('f')) {
    console.log(singular.slice(0, -2))
    return singular.slice(0, -2) + 'ves';
  } else if (singular.endsWith('f') &&
    !(singular.slice(0, -2)).includes('f')) {
    return singular.slice(0, -2) + 'ves';
  } else {
    return singular + 's';
  }
}
