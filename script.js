const startGameBtn = document.getElementById("start_btn");
const newCardBtn = document.getElementById("newCard_el");
const cards = document.getElementById("cards_el");
const sum = document.getElementById("sum_el");
const messageEl = document.getElementById("message_el");
const confettiEl = document.getElementById("confetti_el");
const playerNameInput = document.getElementById("player_name");
const chipsEl = document.getElementById("chips_el");
const gameMessage = document.getElementById("out_message");

let deckId;
let currentSum = 0; // Initialize the sum of drawn cards
let chips = 200; // Initial chips amount
playerNameInput.value = "";

startGameBtn.addEventListener("click", () => {
  if (!playerNameInput.value.trim()) {
    gameMessage.innerText = "Please enter your name to start the game.";
    return;
  }
  if (chips <= 0) {
    gameMessage.innerText = "You don't have enough chips to start the game.";
    return;
  }
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/")
    .then((res) => res.json())
    .then((data) => {
      deckId = data.deck_id; // Save deck ID for later use
      return fetch(
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`
      );
    })
    .then((res) => res.json())
    .then((data) => {
      cards.innerHTML = `
        <img class="cards-el" src="${data.cards[0].image}" />
        <img class="cards-el" src="${data.cards[1].image}" />
      `;

      const cardsValue = data.cards.map((card) => getCardsValue(card.value));
      currentSum = cardsValue.reduce((acc, val) => acc + val, 0); // Update current sum

      sum.textContent = `Sum: ${currentSum}`;
      updateMessage();
      updateChips(0); // No chip deduction on start

      gameMessage.innerText = "";
    });
});

function getNewCard() {
  if (!deckId) {
    gameMessage.innerText = "Please start the game first!";
    return;
  }
  if (currentSum >= 21) {
    return;
  }
  if (chips < 10) {
    gameMessage.innerText = "Not enough chips to draw a card.";
    return;
  }
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
    .then((res) => res.json())
    .then((data) => {
      cards.innerHTML += `
        <img class="cards-el" src="${data.cards[0].image}" />
      `;
      const cardValue = getCardsValue(data.cards[0].value);
      currentSum += cardValue; // Accumulate the sum correctly
      sum.textContent = `Sum: ${currentSum}`;
      updateMessage();
      updateChips(-10); // Deduct 10 chips per card

      gameMessage.innerText = "";
    });
}

newCardBtn.addEventListener("click", () => {
  getNewCard();
});

function updateMessage() {
  if (currentSum === 21) {
    messageEl.textContent = "You got BlackJack!!";
    confettiEl.classList.add("confetti-animation");
    newCardBtn.disabled = true;
    messageEl.style.color = "yellow";
    updateChips(50); // Reward 50 chips for Blackjack
  } else if (currentSum < 21) {
    messageEl.textContent = "Do you want to draw another card?";
    confettiEl.classList.remove("confetti-animation");
    newCardBtn.disabled = false;
    messageEl.style.color = "black";
  } else {
    messageEl.textContent = "You are out of the game!";
    messageEl.style.color = "rgb(10, 209, 227)";
    confettiEl.classList.remove("confetti-animation");
    newCardBtn.disabled = true;
    gameMessage.textContent = "You cannot draw more cards";
  }
}

function updateChips(amount) {
  chips += amount;
  chipsEl.textContent = `Chips: $${chips}`;
}

function getCardsValue(value) {
  if (["KING", "JACK", "QUEEN"].includes(value)) return 10;
  if ("ACE" === value) return 11;
  return parseInt(value);
}
