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

  const nextDataScript = doc.querySelector('script#__NEXT_DATA__');
  const nextDataJson = nextDataScript?.textContent || '{}';
  const nextData = JSON.parse(nextDataJson);
  const histogramData = nextData?.props?.pageProps?.contentData?.histogramData;

  const ratingArr = histogramData?.histogramValues;
  const sortedArr = ratingArr.sort((a, b) => b.rating - a.rating);

  const ratings = sortedArr?.map((rating) => rating?.voteCount || 0);

  const totalRatings = histogramData?.totalVoteCount || 0;

  const absoluteScore = ratings[9] + ratings[8] - ratings[0] - ratings[1];
  const ratio = absoluteScore / totalRatings;
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
