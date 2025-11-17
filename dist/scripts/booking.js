function getChallengeTitleById(id) {
    try {
        const saved = localStorage.getItem("savedChallenges");
        if (saved) {
            const arr = JSON.parse(saved);
            const found = arr.find((c) => String(c.id) === String(id));
            return (found && found.title) || "Room";
        }
    }
    catch (_) { }
    return "Room";
}
function getChallengeById(id) {
    try {
        const saved = localStorage.getItem("savedChallenges");
        if (saved) {
            const arr = JSON.parse(saved);
            const found = arr.find((c) => String(c.id) === String(id));
            return found || null;
        }
    }
    catch (_) { }
    return null;
}
export function openBookingModal(challengeId) {
    if (document.getElementById("booking-modal-overlay"))
        return;
    const overlay = document.createElement("div");
    overlay.id = "booking-modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.className = "booking-overlay";
    const modal = document.createElement("div");
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
        const dateVal = dateInput.value;
        if (!dateVal) {
            status.innerText = "Please choose a date first.";
            return;
        }
        status.innerText = "Looking for available times...";
        try {
            const slots = await fetchAvailableTimes(dateVal, challengeId);
            buildBookingForm(step2, slots, dateVal, challengeId, overlay, () => {
                const modalEl = document.getElementById("booking-modal");
                if (modalEl)
                    showThankYou(modalEl, overlay);
            });
            step1.classList.add("is-hidden");
            step2.classList.remove("is-hidden");
            heading.innerText = `Book room “${roomTitle}” (step 2)`;
            status.innerText = "";
            btnRow.innerHTML = "";
        }
        catch (err) {
            status.innerText = "Could not load available times.";
            console.error(err);
        }
    });
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay)
            closeBookingModal(overlay);
    });
    const escHandler = (e) => {
        if (e.key === "Escape")
            closeBookingModal(overlay);
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
    overlay._escHandler = escHandler;
}
function closeBookingModal(overlay) {
    if (!overlay)
        return;
    const escHandler = overlay._escHandler;
    if (escHandler)
        document.removeEventListener("keydown", escHandler);
    overlay.remove();
}
async function fetchAvailableTimes(date, challengeId) {
    const url = `https://lernia-sjj-assignments.vercel.app/api/booking/available-times?date=${encodeURIComponent(date)}&challenge=${encodeURIComponent(challengeId)}`;
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.slots) ? data.slots : [];
}
function buildBookingForm(container, slots, date, challengeId, overlay, onSuccess) {
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
    }
    else {
        slots.forEach((slot, idx) => {
            const opt = document.createElement("option");
            opt.value = slot;
            opt.innerText = slot;
            if (idx === 0)
                opt.selected = true;
            timeSelect.appendChild(opt);
        });
    }
    const participantsLabel = document.createElement("label");
    participantsLabel.htmlFor = "booking-participants";
    participantsLabel.innerText = "How many participants?";
    const participantsInput = document.createElement("select");
    participantsInput.id = "booking-participants";
    participantsInput.name = "participants";
    let minP = 1;
    let maxP = 20;
    const chall = getChallengeById(challengeId);
    if (chall && typeof chall.minParticipants === "number")
        minP = Math.max(1, chall.minParticipants);
    if (chall && typeof chall.maxParticipants === "number")
        maxP = Math.max(minP, chall.maxParticipants);
    for (let i = minP; i <= maxP; i++) {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.innerText = `${i} participant${i > 1 ? "s" : ""}`;
        if (i === minP)
            opt.selected = true;
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
        try {
            const res = await fetch('https://lernia-sjj-assignments.vercel.app/api/booking/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            if (typeof onSuccess === 'function')
                onSuccess({ challengeId, date, time: timeSelect.value, name: nameInput.value, email: emailInput.value, participants: participantsInput.value });
        }
        catch (err) {
            console.error(err);
            status.innerText = "Failed to submit booking.";
            submitBtn.disabled = false;
        }
    });
    container.appendChild(form);
}
function showThankYou(modalEl, overlay) {
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
export function openThankYouWindow(payload) {
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
        if (modalEl)
            showThankYou(modalEl, document.getElementById("booking-modal-overlay"));
        return;
    }
    newWin.document.open();
    newWin.document.write(message);
    newWin.document.close();
}
