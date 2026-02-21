const root = document.documentElement;
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  root.style.setProperty('--x', `${x}%`);
  root.style.setProperty('--y', `${y}%`);
});
