let currentPlayer = "Red";
const players = ["Red", "Green", "Yellow", "Blue"];
const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function rollDice() {
    let diceBtn = document.getElementById("dice-btn");
    diceBtn.disabled = true; // Block double clicking
    
    let rollCount = 0;
    // Animate the dice rolling
    let interval = setInterval(() => {
        let randomIdx = Math.floor(Math.random() * 6);
        document.getElementById("dice-result").innerText = diceFaces[randomIdx];
        rollCount++;
        
        if (rollCount > 8) {
            clearInterval(interval);
            let finalRoll = Math.floor(Math.random() * 6) + 1;
            document.getElementById("dice-result").innerText = diceFaces[finalRoll - 1];
            
            // Output message to players
            console.log(currentPlayer + " rolled a " + finalRoll);
            
            // Switch Turn
            setTimeout(nextTurn, 1000);
        }
    }, 80);
}

function nextTurn() {
    let nextIdx = (players.indexOf(currentPlayer) + 1) % players.length;
    currentPlayer = players[nextIdx];
    
    let indicator = document.getElementById("turn-indicator");
    indicator.innerText = currentPlayer + "'s Turn";
    
    let diceBtn = document.getElementById("dice-btn");
    diceBtn.disabled = false;
}
