document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.btn-menu');
  const navigation = document.querySelector('.site-nav');
  const navLinks = document.querySelectorAll('.site-nav a');

  if (!menuButton || !navigation) {
    return;
  }

  const closeMenu = () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navigation.classList.contains('is-open')) {
        closeMenu();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920) {
      closeMenu();
    }
  });
});

