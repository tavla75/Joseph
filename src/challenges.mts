const informationString: string = window.location.search;
const infoParameters: URLSearchParams = new URLSearchParams(informationString);
const filterValue = infoParameters.get('filter');

const headline3: HTMLElement = document.querySelector('h3') as HTMLElement;

headline3.innerText = filterValue as string;
console.log(filterValue);