export function initArcRotation(arc, gameArea) {
  const centerX = gameArea.clientWidth / 2;
  const centerY = gameArea.clientHeight / 2;

  document.addEventListener('mousemove', (e) => {
    const rect = gameArea.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - centerX;
    const dy = mouseY - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    arc.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  });
}
