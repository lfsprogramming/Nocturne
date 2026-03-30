(function() {
  const path = window.location.pathname;
  const inSubfolder = path.includes('/ladders/') || path.includes('/drills/');
  const root = inSubfolder ? '../' : '';

  const nav = `
    <nav>
      <span class="nav-title"><a href="${root}index.html" style="text-decoration:none;color:inherit">Nocturne</a></span>
      <ul class="nav-links">
        <li><a href="${root}index.html">home</a></li>
        <li><a href="${root}drills.html">drills</a></li>
        <li><a href="${root}ladders.html">ladders</a></li>
      </ul>
    </nav>
  `;

  document.addEventListener('DOMContentLoaded', function() {
    document.body.insertAdjacentHTML('afterbegin', nav);
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
      if (link.href === window.location.href) {
        link.classList.add('active');
      }
    });
  });
})();