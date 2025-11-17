// Constant and variables for handling lists of challenges
const maxFetchIntervall = 30000;
let challengeArray;
let topRatedChalls = new Array(3).fill({});
// DOM-pointers
const navigation = document.querySelector(".navigation");
const mainSection = document.querySelector("main");
const card_section = document.querySelector(".card-container");
navigation.addEventListener("click", (event) => {
    event.preventDefault();
    const target = event.target;
    console.log(target.tagName);
    if (target.tagName === "A") {
        const action = target.dataset.action;
        const targetId = target.dataset.id;
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
    const target = event.target;
    console.log(target.tagName);
    if (target.tagName === "BUTTON") {
        const action = target.dataset.action;
        const targetId = target.dataset.id;
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
        const url = "https://lernia-sjj-assignments.vercel.app/api/challenges";
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        const challengesList = data.challenges;
        localStorage.clear();
        localStorage.setItem("savedChallenges", JSON.stringify(challengesList));
        localStorage.setItem("lastFetch", JSON.stringify(Date.now()));
        return challengesList;
    }
    catch (error) {
        console.error(error.message);
    }
}
function getChallengeList() {
    let tempChallengeArray;
    if (localStorage.getItem("savedChallenges") && checkIntervall()) {
        const tempStorage = localStorage.getItem("savedChallenges");
        if (tempStorage) {
            tempChallengeArray = JSON.parse(tempStorage);
        }
        else {
            throw new Error("Problem has arised with challenges saved in localStorage.");
        }
    }
    else {
        const tempArray = fetchChallengesAndSaveToLocal();
        tempChallengeArray = tempArray;
    }
    return tempChallengeArray;
}
const checkIntervall = () => {
    let lastFetchString = localStorage.getItem("lastFetch");
    let lastFetchTime = 0;
    if (lastFetchString) {
        lastFetchTime = +lastFetchString;
    }
    const timeNow = Date.now();
    return timeNow - lastFetchTime < maxFetchIntervall;
};
function sortOutTopRated(inputArray) {
    if (localStorage.getItem("savedTopThree") && checkIntervall()) {
        const tempTopThree = localStorage.getItem("savedTopThree");
        if (tempTopThree) {
            topRatedChalls = JSON.parse(tempTopThree);
        }
        else {
            throw new Error("Problem has arised with top three list saved in localStorage");
        }
    }
    else {
        const sortedArray = [...inputArray].sort((a, b) => b.rating - a.rating);
        const newTopThree = sortedArray.slice(0, 3);
        topRatedChalls = newTopThree;
        localStorage.setItem("savedTopThree", JSON.stringify(newTopThree));
    }
}
// Function that inserts top three challenge-cards in the startpage
const putTopRatedInDOM = () => {
    if (!card_section) {
        console.error("putTopRatedInDOM: .card-container not found in DOM");
        return;
    }
    topRatedChalls.forEach((element) => {
        const cardImg = document.createElement("img");
        cardImg.setAttribute("src", element.image);
        cardImg.setAttribute("class", "card__image");
        const card_title = document.createElement("h4");
        card_title.setAttribute("class", "card__title");
        card_title.innerText = element.title;
        const rating_container = document.createElement("div");
        const rating = document.createElement("span");
        const rating_real = element.rating;
        const rating_rounded = Math.ceil(element.rating);
        for (let index = 1; index <= rating_rounded; index++) {
            const rating_star = document.createElement("img");
            if (0 < index - rating_real && index - rating_real < 1) {
                rating_star.setAttribute("src", "resources/Star 3 half.svg");
                rating_star.setAttribute("class", "rating__star--half");
                rating.appendChild(rating_star);
            }
            else {
                rating_star.setAttribute("src", "resources/Star 3.svg");
                rating_star.setAttribute("class", "rating__star");
                rating.appendChild(rating_star);
            }
        }
        if (5 - rating_rounded > 0) {
            for (let index = 0; index < 5 - rating_rounded; index++) {
                const rating_star = document.createElement("img");
                rating_star.setAttribute("src", "resources/Star 3 hollow.svg");
                rating_star.setAttribute("class", "rating__star--empty");
                rating.appendChild(rating_star);
            }
        }
        rating_container.appendChild(rating);
        rating_container.setAttribute("class", "rating-container");
        const room_participants = document.createElement("span");
        room_participants.innerText =
            element.minParticipants +
                " - " +
                element.maxParticipants +
                " participants";
        room_participants.setAttribute("class", "card__room-participants");
        rating_container.appendChild(room_participants);
        const card_description = document.createElement("div");
        card_description.setAttribute("class", "card__description");
        card_description.innerText = element.description;
        const card_button = document.createElement("button");
        card_button.setAttribute("class", "card__button");
        card_button.setAttribute("data-action", "booking");
        card_button.setAttribute("data-id", "" + element.id);
        card_button.innerText = "Book this room";
        // Directly attach click/keyboard handlers so the button opens the booking modal
        card_button.addEventListener("click", () => {
            import("./" + "booking.js").then((m) => m.openBookingModal("" + element.id));
        });
        card_button.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                import("./" + "booking.js").then((m) => m.openBookingModal("" + element.id));
            }
        });
        const card = document.createElement("article");
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
function goToChallengePage(type) {
    window.location.assign(`./challenges.html?type=${encodeURIComponent(type)}`);
}
//Hämtar alla knappar för navigering till challenge sidan
const challengeNavButtons = document.querySelectorAll('.js-challenge-nav');
//Lägger till event listeners för varje knapp
challengeNavButtons.forEach(btn => {
    const type = btn.dataset.type || '';
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
    }
    catch (err) {
        console.error('Initialization failed', err);
    }
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    void init();
}
export {};

