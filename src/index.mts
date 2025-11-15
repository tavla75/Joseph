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
            bookRoonModal(targetId);
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
    // Directly attach click/keyboard handlers so the button opens the booking modal
    card_button.addEventListener("click", () => openBookingModal("" + element.id));
    card_button.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBookingModal("" + element.id);
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

function getChallengeTitleById(id: string): string {
  try {
    const saved = localStorage.getItem("savedChallenges");
    if (saved) {
      const arr = JSON.parse(saved) as Array<any>;
      const found = arr.find((c) => String(c.id) === String(id));
      return found?.title ?? "Room";
    }
  } catch (_) {
  
  }
  return "Room";
}

function getChallengeById(id: string): Partial<oneChallenge> | null {
  try {
    const saved = localStorage.getItem("savedChallenges");
    if (saved) {
      const arr = JSON.parse(saved) as Array<oneChallenge>;
      const found = arr.find((c) => String(c.id) === String(id));
      return found ?? null;
    }
  } catch (_) {
    // ignore
  }
  return null;
}

function openBookingModal(challengeId: string) {
  if (document.getElementById("booking-modal-overlay")) return;

  const overlay: HTMLDivElement = document.createElement("div");
  overlay.id = "booking-modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.className = "booking-overlay";

  const modal: HTMLDivElement = document.createElement("div");
  modal.id = "booking-modal";
  modal.className = "booking-modal";

  
  const heading = document.createElement("h3");
  const roomTitle = getChallengeTitleById(challengeId);
  heading.innerText = `Book room “${roomTitle}” (step 1)`;

  const stepContainer = document.createElement("div");
  stepContainer.id = "booking-steps";

  const step1 = document.createElement("div");
  step1.id = "booking-step-1";

  const intro = document.createElement("p");
  intro.className = "booking-intro";
  intro.innerText = "What date would you like to come?";

  const label = document.createElement("label");
  label.htmlFor = "booking-date";
  label.innerText = "Date";
  
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "booking-date";
  dateInput.name = "booking-date";

  const findButton = document.createElement("button");
  findButton.innerText = "Search available times";
  findButton.className = "card__button";
  findButton.type = "button";
  step1.appendChild(intro);
  step1.appendChild(label);
  step1.appendChild(dateInput);

  const step2 = document.createElement("div");
  step2.id = "booking-step-2";
  step2.classList.add("is-hidden");

  const status = document.createElement("div");
  status.id = "booking-status";
  status.className = "booking-status";

  findButton.addEventListener("click", async () => {
    const dateVal = (dateInput as HTMLInputElement).value;
    if (!dateVal) {
      status.innerText = "Please choose a date first.";
      return;
    }
    status.innerText = "Looking for available times...";
    try {
      const slots = await fetchAvailableTimes(dateVal, challengeId);
      buildBookingForm(step2, slots, dateVal, challengeId, overlay, (payload) => {
        const modalEl = document.getElementById("booking-modal");
        if (modalEl) showThankYou(modalEl, overlay);
      });
      step1.classList.add("is-hidden");
      step2.classList.remove("is-hidden");
      heading.innerText = `Book room “${roomTitle}” (step 2)`;
      status.innerText = "";
      btnRow.innerHTML = "";
    } catch (err: any) {
      status.innerText = "Could not load available times.";
      console.error(err);
    }
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeBookingModal(overlay);
  });
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeBookingModal(overlay);
  };
  document.addEventListener("keydown", escHandler);
  modal.appendChild(heading);
  modal.appendChild(stepContainer);
  stepContainer.appendChild(step1);
  stepContainer.appendChild(step2);
  modal.appendChild(status);
  const btnRow = document.createElement("div");
  btnRow.className = "booking-actions booking-actions--end";
  btnRow.appendChild(findButton);
  modal.appendChild(btnRow);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  setTimeout(() => dateInput.focus(), 50);

  (overlay as any)._escHandler = escHandler;
}
function closeBookingModal(overlay: HTMLElement) {
  if (!overlay) return;
  const escHandler = (overlay as any)._escHandler as ((e: KeyboardEvent) => void) | undefined;
  if (escHandler) document.removeEventListener("keydown", escHandler);
  overlay.remove();
}
async function fetchAvailableTimes(date: string, challengeId: string): Promise<Array<string>> {

  const url = `https://lernia-sjj-assignments.vercel.app/api/booking/available-times?date=${encodeURIComponent(
    date
  )}&challenge=${encodeURIComponent(challengeId)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Status ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.slots) ? data.slots : [];
}
function buildBookingForm(
  container: HTMLElement,
  slots: Array<string>,
  date: string,
  challengeId: string,
  overlay: HTMLElement,
  onSuccess: (payload: any) => void
) {
  container.innerHTML = "";

  const form = document.createElement("form");
  form.id = "booking-form";
  form.className = "booking-form";

  
  const nameLabel = document.createElement("label");
  nameLabel.htmlFor = "booking-name";
  nameLabel.innerText = "Name";
  const nameInput = document.createElement("input");
  nameInput.id = "booking-name";
  nameInput.name = "name";
  nameInput.type = "text";
  nameInput.required = true;

  
  const emailLabel = document.createElement("label");
  emailLabel.htmlFor = "booking-email";
  emailLabel.innerText = "E-mail";
  const emailInput = document.createElement("input");
  emailInput.id = "booking-email";
  emailInput.name = "email";
  emailInput.type = "email";
  emailInput.required = true;

  
  const timeLabel = document.createElement("label");
  timeLabel.htmlFor = "booking-time";
  timeLabel.innerText = "What time?";
  const timeSelect = document.createElement("select");
  timeSelect.id = "booking-time";
  timeSelect.name = "time";
  if (!slots || slots.length === 0) {
    const opt = document.createElement("option");
    opt.disabled = true;
    opt.selected = true;
    opt.innerText = "No available times";
    timeSelect.appendChild(opt);
    timeSelect.disabled = true;
  } else {
    slots.forEach((slot, idx) => {
      const opt = document.createElement("option");
      opt.value = slot;
      opt.innerText = slot;
      if (idx === 0) opt.selected = true;
      timeSelect.appendChild(opt);
    });
  }

  const participantsLabel = document.createElement("label");
  participantsLabel.htmlFor = "booking-participants";
  participantsLabel.innerText = "How many participants?";
  const participantsInput = document.createElement("select") as HTMLSelectElement;
  participantsInput.id = "booking-participants";
  participantsInput.name = "participants";
  let minP = 1;
  let maxP = 20;
  const chall = getChallengeById(challengeId);
  if (chall && typeof chall.minParticipants === "number") minP = Math.max(1, chall.minParticipants);
  if (chall && typeof chall.maxParticipants === "number") maxP = Math.max(minP, chall.maxParticipants);

  for (let i = minP; i <= maxP; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.innerText = `${i} participant${i > 1 ? "s" : ""}`;
    if (i === minP) opt.selected = true;
    participantsInput.appendChild(opt);
  }

  const actions = document.createElement("div");
  actions.className = "booking-actions booking-actions--end";
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "card__button";
  submitBtn.innerText = "Submit booking";
  actions.appendChild(submitBtn);

  const status = document.createElement("div");
  status.id = "booking-submit-status";
  status.className = "booking-submit-status";

  form.appendChild(nameLabel);
  form.appendChild(nameInput);
  form.appendChild(emailLabel);
  form.appendChild(emailInput);
  form.appendChild(timeLabel);
  form.appendChild(timeSelect);
  form.appendChild(participantsLabel);
  form.appendChild(participantsInput);
  form.appendChild(actions);
  form.appendChild(status);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    status.innerText = "Submitting booking...";

    const payload = {
      challengeId,
      date,
      time: timeSelect.value,
      name: nameInput.value,
      email: emailInput.value,
      participants: participantsInput.value,
    };

    try {
      const res = await fetch('https://lernia-sjj-assignments.vercel.app/api/booking/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challenge: Number(challengeId),
          name: nameInput.value,
          email: emailInput.value,
          date: date,
          time: timeSelect.value,
          participants: Number(participantsInput.value),
        }),
      });
      if (!res.ok) {
        throw new Error(`Booking failed: ${res.status}`);
      }
      const data = await res.json();
      console.log('Booking response:', data);
      status.innerText = "Booking confirmed.";
      onSuccess(data);
    } catch (err: any) {
      console.error(err);
      status.innerText = "Failed to submit booking.";
      submitBtn.disabled = false;
    }
  });

  container.appendChild(form);
}

function showThankYou(modalEl: HTMLElement, overlay: HTMLElement) {
  modalEl.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "booking-thanks";

  const heading = document.createElement("h3");
  heading.innerText = "Thank you!";

  const link = document.createElement("a");
  link.href = "./challenges.html";
  link.innerText = "Back to challenges";
  link.className = "booking-thanks__back";

  wrap.appendChild(heading);
  wrap.appendChild(link);
  modalEl.appendChild(wrap);
}

function openThankYouWindow(payload: { challengeId: string; date: string; time: string; name?: string; email?: string; participants?: string | number; note?: string; }) {

  const newWin = window.open("", "_blank", "noopener");
  const message = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Booking confirmed</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <style>
          body{font-family:Roboto,system-ui,-apple-system,Segoe UI,Arial;margin:2rem;color:#011827}
          .btn{display:inline-block;padding:.6rem 1rem;background:#e3170a;color:#fff;border-radius:.3rem;text-decoration:none}
        </style>
      </head>
      <body>
        <h1>Thank you!</h1>
        <p>Your booking is confirmed (simulated).</p>
        <p><strong>Challenge:</strong> ${payload.challengeId} <br /><strong>Date:</strong> ${payload.date} <br /><strong>Time:</strong> ${payload.time}</p>
        <p>We've sent a confirmation to: ${payload.email ? payload.email : "(no email provided)"}</p>
        <p><a class="btn" href="./challenges.html">Back to challenges</a></p>
      </body>
    </html>
  `;

  if (!newWin) {
    const modalEl = document.getElementById("booking-modal");
    if (modalEl) showThankYou(modalEl, document.getElementById("booking-modal-overlay") as HTMLElement);
    return;
  }
  newWin.document.open();
  newWin.document.write(message);
  newWin.document.close();
}
