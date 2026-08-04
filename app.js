// Minimal pass-and-play Ludo-like demo (2 players).
// - Circular track: 52 positions
// - Two players (red, blue), one token each (starter).
// - Roll dice, enter on 6, move, capture opponent.
// - This is a starter: expand for full rules/4 players/AI/multiplayer.

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;
const center = {x: W/2, y: H/2};
const radius = 220;
const POS_COUNT = 52;
const posCoords = [];
const tokenRadius = 12;

const rollBtn = document.getElementById('rollBtn');
const endBtn = document.getElementById('endBtn');
const diceEl = document.getElementById('dice');
const statusEl = document.getElementById('status');

let currentPlayer = 0; // 0 = red, 1 = blue
const players = [
  {name: 'Red', color: '#d23', startIndex: 0},
  {name: 'Blue', color: '#18a', startIndex: 13}
];

const tokens = [
  {player:0, pos:-1}, // -1 = home
  {player:1, pos:-1}
];

let lastRoll = null;

// Precompute circular track coordinates
for(let i=0;i<POS_COUNT;i++){
  const angle = (i / POS_COUNT) * Math.PI * 2 - Math.PI/2;
  const x = center.x + Math.cos(angle) * radius;
  const y = center.y + Math.sin(angle) * radius;
  posCoords.push({x,y});
}

function drawBoard(){
  ctx.clearRect(0,0,W,H);
  // draw track dots
  for(let i=0;i<POS_COUNT;i++){
    const p = posCoords[i];
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#d8e2ff';
    ctx.lineWidth = 2;
    ctx.arc(p.x,p.y,14,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
  }
  // draw start markers
  players.forEach(pl=>{
    const s = posCoords[pl.startIndex];
    ctx.beginPath();
    ctx.fillStyle = pl.color;
    ctx.arc(s.x,s.y,8,0,Math.PI*2);
    ctx.fill();
  });
  // draw tokens
  tokens.forEach((t, idx)=>{
    if(t.pos === -1){
      // draw at home area near corner
      const offsetX = idx===0 ? -120 : 120;
      const homeX = center.x + offsetX;
      const homeY = center.y + (idx===0 ? -120 : 120);
      drawToken(homeX, homeY, players[t.player].color, idx);
    } else {
      const p = posCoords[t.pos % POS_COUNT];
      drawToken(p.x, p.y, players[t.player].color, idx);
    }
  });
}

function drawToken(x,y,color,idx){
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x,y, tokenRadius,0,Math.PI*2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fff';
  ctx.stroke();
  // draw small index
  ctx.fillStyle = '#fff';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(idx+1), x, y);
}

function setStatus(txt){ statusEl.textContent = txt; }

function rollDice(){
  lastRoll = Math.floor(Math.random()*6)+1;
  diceEl.textContent = lastRoll;
  setStatus(`${players[currentPlayer].name} rolled ${lastRoll}. Click your token to move if valid.`);
}

function moveToken(tokenIndex){
  const t = tokens[tokenIndex];
  if(t.player !== currentPlayer){
    setStatus("It's not that token's player's turn.");
    return;
  }
  if(lastRoll == null){
    setStatus('Roll the dice first.');
    return;
  }
  // If at home (-1), can only enter on 6
  if(t.pos === -1){
    if(lastRoll === 6){
      t.pos = players[currentPlayer].startIndex;
      setStatus(`${players[currentPlayer].name} enters the board!`);
      // check capture
      captureIfAny(tokenIndex);
      lastRoll = null;
      drawBoard();
      return;
    } else {
      setStatus('Need a 6 to enter from home.');
      return;
    }
  }
  // normal move
  t.pos = (t.pos + lastRoll) % POS_COUNT;
  setStatus(`${players[currentPlayer].name} moved ${lastRoll} steps.`);
  // capture if landing on opponent
  captureIfAny(tokenIndex);
  lastRoll = null;
  drawBoard();
}

function captureIfAny(movedIdx){
  const mover = tokens[movedIdx];
  tokens.forEach((other, idx)=>{
    if(idx === movedIdx) return;
    if(other.pos !== -1 && mover.pos === other.pos){
      // capture!
      other.pos = -1;
      setStatus(`${players[mover.player].name} captured ${players[other.player].name}!`);
    }
  });
}

function endTurn(){
  lastRoll = null;
  diceEl.textContent = '—';
  currentPlayer = (currentPlayer + 1) % players.length;
  setStatus(`${players[currentPlayer].name}'s turn.`);
}

canvas.addEventListener('click', (e) => {
  // find nearest token to click
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  let clickedToken = null;
  for(let i=0;i<tokens.length;i++){
    const t = tokens[i];
    let tx,ty;
    if(t.pos === -1){
      const offsetX = i===0 ? -120 : 120;
      tx = center.x + offsetX;
      ty = center.y + (i===0 ? -120 : 120);
    } else {
      const p = posCoords[t.pos % POS_COUNT];
      tx = p.x; ty = p.y;
    }
    const dx = tx-x, dy = ty-y;
    if(Math.hypot(dx,dy) <= tokenRadius+6){
      clickedToken = i;
      break;
    }
  }
  if(clickedToken !== null){
    moveToken(clickedToken);
  }
});

rollBtn.addEventListener('click', rollDice);
endBtn.addEventListener('click', endTurn);

// initial draw
setStatus(`${players[currentPlayer].name}'s turn. Roll the dice.`);
drawBoard();
