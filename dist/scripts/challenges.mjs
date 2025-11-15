const informationString = window.location.search;
const infoParameters = new URLSearchParams(informationString);
const filterValue = infoParameters.get('filter');
const headline3 = document.querySelector('h3');
headline3.innerText = filterValue;
console.log(filterValue);
export {};
