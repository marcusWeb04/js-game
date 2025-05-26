export function block(data) {
  const b = document.createElement('div');
  b.className = "block";

  const centerX = 300;
  const centerY = 300;

  const posX = centerX + data["position-x"] * 10;
  const posY = centerY + data["position-y"] * 10;

  b.style.left = `${posX}px`;
  b.style.top = `${posY}px`;

  document.getElementById('gameArea').appendChild(b);

  return b;
}
