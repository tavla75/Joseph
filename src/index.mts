/// <reference path="./booking.d.ts" />
import type { multipleChallenges, oneChallenge } from "./interfaces.mts";

// Constant and variables for handling lists of challenges
const maxFetchIntervall: number = 30000;
let challengeArray: Array<oneChallenge>;
let topRatedChalls: Array<oneChallenge> = new Array(3).fill({});

// DOM-pointers
const navigation: HTMLElement = document.querySelector(
  ".navigation"
) as HTMLElement;
const mainSection: HTMLElement = document.querySelector("main") as HTMLElement;
const card_section: HTMLElement = document.querySelector(
  ".card-container"
) as HTMLElement;

navigation.addEventListener("click", (event) => {
  event.preventDefault();
  const target: HTMLElement = event.target as HTMLElement;
  console.log(target.tagName);
  if (target.tagName === "A") {
    const action: string = target.dataset.action as string;
    const targetId: string = target.dataset.id as string;

    /* switch(action) {
        case 'online':
            window.open('challenges.html?filter=online', "challengesTab");
            break;

        case 'onsite':
            window.open('challenges.html?filter=onsite', "challengesTab");
            break;
        
        case 'story':
            window.open('storypage.html', "ESCStoryTab");
            break;

        case 'contact':
            code for opening modal with contact form
            break;
        
        default:
          console.log('Nothing to see here!');
    } */
    console.log('Action from clicked: ', action);
  }
});

mainSection.addEventListener("click", (event) => {
  event.preventDefault();
  const target: HTMLElement = event.target as HTMLElement;
  console.log(target.tagName);
  if (target.tagName === "BUTTON") {
    const action: string = target.dataset.action as string;
    const targetId: string = target.dataset.id as string;

    /* switch(action) {
        case 'online':
            window.open('challenges.html?filter=online', "challengesTab");
            break;

        case 'onsite':
            window.open('challenges.html?filter=onsite', "challengesTab");
            break;
        
        case 'story':
            window.open('storypage.html', "ESCStoryTab");
            break;

        case 'see_all':
            window.open('challenges.html?filter=none', "challengesTab");
            break;

        case 'booking':
            import("./" + "booking.js").then((m: any) => m.openBookingModal(targetId));
          break;

        default:
          console.log('Nothing to see here!');        
    } */
    console.log('Action from clicked: ', action, " - ID if it exist: ", targetId);
  }
});

async function fetchChallengesAndSaveToLocal() {
  try {
    const url: string =
      "https://lernia-sjj-assignments.vercel.app/api/challenges";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data: multipleChallenges = await response.json();
    const challengesList: Array<oneChallenge> = data.challenges;
    localStorage.clear();
    localStorage.setItem("savedChallenges", JSON.stringify(challengesList));
    localStorage.setItem("lastFetch", JSON.stringify(Date.now()));

    return challengesList;
  } catch (error: any) {
    console.error(error.message);
  }
}

function getChallengeList(): Array<oneChallenge> {
  let tempChallengeArray: Array<oneChallenge>;
  if (localStorage.getItem("savedChallenges") && checkIntervall()) {
    const tempStorage: string | null = localStorage.getItem("savedChallenges");
    if (tempStorage) {
      tempChallengeArray = JSON.parse(tempStorage);
    } else {
      throw new Error(
        "Problem has arised with challenges saved in localStorage."
      );
    }
  } else {
    const tempArray: unknown = fetchChallengesAndSaveToLocal();
    tempChallengeArray = tempArray as Array<oneChallenge>;
  }
  return tempChallengeArray;
}

const checkIntervall = (): boolean => {
  let lastFetchString: string | null = localStorage.getItem("lastFetch");
  let lastFetchTime: number = 0;
  if (lastFetchString) {
    lastFetchTime = +lastFetchString;
  }
  const timeNow: number = Date.now();

  return timeNow - lastFetchTime < maxFetchIntervall;
};

function sortOutTopRated(inputArray: Array<oneChallenge>): void {
  if (localStorage.getItem("savedTopThree") && checkIntervall()) {
    const tempTopThree: string | null = localStorage.getItem("savedTopThree");
    if (tempTopThree) {
      topRatedChalls = JSON.parse(tempTopThree);
    } else {
      throw new Error(
        "Problem has arised with top three list saved in localStorage"
      );
    }
  } else {
    const sortedArray: Array<oneChallenge> = [...inputArray].sort(
      (a, b) => b.rating - a.rating
    );
    const newTopThree: Array<oneChallenge> = sortedArray.slice(0, 3);
    topRatedChalls = newTopThree;
    localStorage.setItem("savedTopThree", JSON.stringify(newTopThree));
  }
}

// Function that inserts top three challenge-cards in the startpage
const putTopRatedInDOM = (): void => {
  if (!card_section) {
    console.error("putTopRatedInDOM: .card-container not found in DOM");
    return;
  }
  topRatedChalls.forEach((element) => {
    const cardImg: HTMLImageElement = document.createElement("img");
    cardImg.setAttribute("src", element.image);
    cardImg.setAttribute("class", "card__image");

    const card_title: HTMLElement = document.createElement("h4");
    card_title.setAttribute("class", "card__title");
    card_title.innerText = element.title;

    const rating_container: HTMLElement = document.createElement("div");
    const rating: HTMLElement = document.createElement("span");
    const rating_real: number = element.rating;
    const rating_rounded: number = Math.ceil(element.rating);
    for (let index = 1; index <= rating_rounded; index++) {
      const rating_star: HTMLImageElement = document.createElement("img");
      if (0 < index - rating_real && index - rating_real < 1) {
        rating_star.setAttribute("src", "resources/Star 3 half.svg");
        rating_star.setAttribute("class", "rating__star--half");
        rating.appendChild(rating_star);
      } else {
        rating_star.setAttribute("src", "resources/Star 3.svg");
        rating_star.setAttribute("class", "rating__star");
        rating.appendChild(rating_star);
      }
    }
    if (5 - rating_rounded > 0) {
      for (let index = 0; index < 5 - rating_rounded; index++) {
        const rating_star: HTMLImageElement = document.createElement("img");
        rating_star.setAttribute("src", "resources/Star 3 hollow.svg");
        rating_star.setAttribute("class", "rating__star--empty");
        rating.appendChild(rating_star);
      }
    }
    rating_container.appendChild(rating);
    rating_container.setAttribute("class", "rating-container");
    const room_participants: HTMLElement = document.createElement("span");
    room_participants.innerText =
      element.minParticipants +
      " - " +
      element.maxParticipants +
      " participants";
    room_participants.setAttribute("class", "card__room-participants");
    rating_container.appendChild(room_participants);

    const card_description: HTMLElement = document.createElement("div");
    card_description.setAttribute("class", "card__description");
    card_description.innerText = element.description;

    const card_button: HTMLButtonElement = document.createElement("button");
    card_button.setAttribute("class", "card__button");
    card_button.setAttribute("data-action", "booking");
    card_button.setAttribute("data-id", "" + element.id);
    card_button.innerText = "Book this room";
    
    card_button.addEventListener("click", () => {
      import("./" + "booking.js").then((m: any) => m.openBookingModal("" + element.id));
    });
    card_button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        import("./" + "booking.js").then((m: any) => m.openBookingModal("" + element.id));
      }
    });

    const card: HTMLElement = document.createElement("article");
    card.setAttribute("id", "" + element.id);
    card.setAttribute("class", "card");
    card.appendChild(cardImg);
    card.appendChild(card_title);
    card.appendChild(rating_container);
    card.appendChild(card_description);
    card.appendChild(card_button);

    card_section.appendChild(card);
  });
};
//Navigering till challenge sidan med förfiltrering
function goToChallengePage(type: string) {
    window.location.assign(`./challenges.html?type=${encodeURIComponent(type)}`);
}
//Hämtar alla knappar för navigering till challenge sidan
const challengeNavButtons = document.querySelectorAll<HTMLButtonElement>('.js-challenge-nav');

//Lägger till event listeners för varje knapp
challengeNavButtons.forEach(btn => {const type = btn.dataset.type || ''; 

    //Klick och tangenttryckning för tillgänglighet
    btn.addEventListener('click', () => goToChallengePage(type));

    // Gör knapparna åtkomliga via tangentbordet
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); //Förhindra scrollning vid mellanslag
            goToChallengePage(type);
        }
    });
});

async function init() {
  try {
    challengeArray = await getChallengeList();
    sortOutTopRated(challengeArray);
    putTopRatedInDOM();
  } catch (err) {
    console.error('Initialization failed', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  void init();
}
