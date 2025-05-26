import { readChat } from './chart.js';
import { block } from './block.js';

const blocks = [];
let chartData = null;
let startTime = null;

// Créer l'arc central
const arc = document.createElement('div');
arc.className = 'arc';
arc.id = 'arc';
document.getElementById('gameArea').appendChild(arc);

const audio = new Audio('../asset/song/promenade-remix.mp3');

// Charger le JSON
fetch('../asset/chart/promenade.json')
  .then(response => {
    if (!response.ok) throw new Error('Erreur réseau lors du chargement du JSON');
    return response.json();
  })
  .then(res => {
    chartData = res.chart.slice();
    chartData.sort((a, b) => a.time - b.time);
  })
  .catch(error => {
    console.error('Erreur lors du chargement du JSON:', error);
  });

// Fonction pour vérifier les collisions circulaires
function checkCollision(arc, block) {
  const arcRect = arc.getBoundingClientRect();
  const blockRect = block.getBoundingClientRect();

  const arcX = arcRect.left + arcRect.width / 2;
  const arcY = arcRect.top + arcRect.height / 2;

  const blockX = blockRect.left + blockRect.width / 2;
  const blockY = blockRect.top + blockRect.height / 2;

  const dx = arcX - blockX;
  const dy = arcY - blockY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const arcRadius = arcRect.width / 2;
  const blockRadius = blockRect.width / 2;

  return distance < arcRadius + blockRadius;
}

// Fonction principale de lecture des notes
function playChart(timestamp) {
  if (!startTime) startTime = timestamp;  // démarre le timer à 0 à la 1ère frame
  const currentTime = (timestamp - startTime) / 1000; // temps en secondes

  console.log(currentTime);

  // Faire apparaître les notes à leur temps
  while (chartData.length > 0 && chartData[0].time <= currentTime) {
    const note = chartData.shift();
    const b = block(note);
    blocks.push(b);
  }

  // Vérifier les collisions et nettoyer les blocs
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i];
    if (checkCollision(arc, b)) {
      b.remove();
      blocks.splice(i, 1);
    }
  }

  requestAnimationFrame(playChart);
}

// Bouton Start
const startBtn = document.createElement('button');
startBtn.textContent = 'Start';
document.body.appendChild(startBtn);

startBtn.addEventListener('click', () => {
  if (!chartData) {
    alert('Les données ne sont pas encore chargées, veuillez patienter...');
    return;
  }
  startBtn.disabled = true;
  audio.currentTime = 0;

  audio.play()
    .then(() => {
      startTime = null; // reset le timer pour démarrer à 0
      requestAnimationFrame(playChart);
    })
    .catch(e => {
      console.error('Erreur lors de la lecture audio:', e);
    });
});
