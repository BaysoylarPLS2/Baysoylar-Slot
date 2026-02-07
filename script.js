const ROWS = 3;
const COLS = 5;
const symbols = ["🍒", "🍋", "🔔", "⭐", "🍀"];
const slot = document.getElementById("slot");
const result = document.getElementById("result");
const bonusArea = document.getElementById("bonusArea");
const jackpotArea = document.getElementById("jackpotArea");
const spinBtn = document.getElementById("spinBtn");

const spinSound = document.getElementById("spinSound");
const winSound = document.getElementById("winSound");
const bonusSound = document.getElementById("bonusSound");

let score = 1000;       // Başlangıç puanı
let bet = 50;           // Başlangıç bahis
const MIN_BET = 10;

let jackpotCounter = 0;
const JACKPOT_THRESHOLD = 10; // 10 spin sonrası jackpot

// Grid oluştur
function createGrid() {
  slot.innerHTML = "";
  for (let i = 0; i < ROWS * COLS; i++) {
    const div = document.createElement("div");
    div.className = "cell";
    slot.appendChild(div);
  }
}

// Rastgele sembol
function randomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)];
}

// Puanı ekranda güncelle
function updateScore() {
  document.getElementById("score").textContent = `Puan: ${score}`;
}

// Spin animasyonu (1.5 saniye, makaralar atlayarak)
function spin() {
  if(score < bet) {
    result.textContent = "⚠️ Puanın yetmiyor!";
    return;
  }

  score -= bet;
  updateScore();
  
  spinBtn.disabled = true;
  result.textContent = "";
  bonusArea.textContent = "";
  spinSound.currentTime = 0;
  spinSound.play();

  const cells = document.querySelectorAll(".cell");
  cells.forEach(c => c.classList.add("spinning"));

  // Her makara ayrı ayrı duracak
  for (let col = 0; col < COLS; col++) {
    const start = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - start >= 1500) {
        clearInterval(interval);
        for (let row = 0; row < ROWS; row++) {
          const cellIndex = row * COLS + col;
          cells[cellIndex].textContent = randomSymbol();
          cells[cellIndex].classList.remove("spinning");
        }
        if(col === COLS - 1) finishSpin();
        return;
      }
      for (let row = 0; row < ROWS; row++) {
        const cellIndex = row * COLS + col;
        cells[cellIndex].textContent = randomSymbol();
      }
    }, 100);
  }
}

// Spin bitişi: kazanç ve bonus
function finishSpin() {
  const cells = document.querySelectorAll(".cell");
  let grid = [];
  cells.forEach(cell => {
    grid.push(cell.textContent);
  });

  // Kazanç kontrolü: orta satır
  const middleRowStart = Math.floor(ROWS/2) * COLS;
  const middleRow = grid.slice(middleRowStart, middleRowStart + COLS);
  const first = middleRow[0];
  const win = middleRow.every(s => s === first);

  if(win) {
    const winPoints = bet * 4; // Orta satır eşleşirse 4x bahis
    score += winPoints;
    result.textContent = `🎉 KAZANDIN! +${winPoints} puan`;
    winSound.play();
  } else {
    result.textContent = "😢 Tekrar dene";
  }

  // Bonus mini oyun: 3 veya daha fazla ⭐
  const starCount = grid.filter(s => s === "⭐").length;
  if(starCount >= 3) {
    const bonusPoints = starCount * bet;
    score += bonusPoints;
    bonusArea.textContent = `🌟 BONUS! +${bonusPoints} puan (${starCount} yıldız)`;
    bonusSound.play();
  }

  // Jackpot sistemi
  jackpotCounter++;
  if(jackpotCounter >= JACKPOT_THRESHOLD) {
    const jackpotPoints = bet * 10;
    score += jackpotPoints;
    jackpotArea.textContent = `💰 JACKPOT! +${jackpotPoints} puan`;
    jackpotCounter = 0;
  } else {
    jackpotArea.textContent = `Jackpot sayaç: ${jackpotCounter}/${JACKPOT_THRESHOLD}`;
  }

  updateScore();
  spinBtn.disabled = false;
}

// Bahis butonları
const betAmount = document.getElementById("betAmount");
document.getElementById("increaseBet").addEventListener("click", () => {
  bet += 10;
  betAmount.textContent = bet;
});
document.getElementById("decreaseBet").addEventListener("click", () => {
  if(bet > MIN_BET) bet -= 10;
  betAmount.textContent = bet;
});

// Başlat
spinBtn.addEventListener("click", spin);
createGrid();
updateScore();
