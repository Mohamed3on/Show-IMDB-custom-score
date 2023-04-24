const addCommas = (x) => {
  return x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const appendAfter = (element, newElement) => {
  element.parentNode.insertBefore(newElement, element.nextSibling);
};

async function fetchRatings() {
  let currentURL = new URL(window.location.href);
  const pathname = currentURL.pathname;

  // Check if the pathname matches the required pattern
  if (!pathname.match(/\/title\/tt\d+\/(maindetails\/?|ratings\/?)?/)) {
    return;
  }

  // Remove query parameters and any additional path segments
  currentURL.search = ''; // Remove query parameters
  currentURL.pathname = currentURL.pathname.split('/').slice(0, 3).join('/'); // Keep only the first 3 path segments

  const ratingsURL = currentURL.href + '/ratings/';

  const response = await fetch(ratingsURL);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');

  const ratings = Array.from(doc.getElementsByClassName('leftAligned'))
    .slice(1, 11)
    .map((element) => parseInt(element.textContent.replace(/,/g, '')));

  const absoluteScore = ratings[0] + ratings[1] - ratings[9] - ratings[8];
  const sum = ratings.reduce((a, b) => a + b, 0);
  const ratio = absoluteScore / sum;
  const calculatedScore = Math.round(absoluteScore * ratio);

  const scoreElement = document.createElement('div');
  scoreElement.innerHTML = `${addCommas(String(calculatedScore))} (${Math.round(ratio * 100)}%)`;
  scoreElement.style.fontWeight = 'bold';
  scoreElement.style.fontSize = '1.2rem';
  scoreElement.style.color = '#f5c518';

  const headline = document.querySelector('h1');
  appendAfter(headline, scoreElement);
}

fetchRatings();
