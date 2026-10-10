// Mobile menu, dropdown toggles, the HRA gap calculator and the demo form.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.nav__expand').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.nav__item');
      var open = !item.classList.contains('is-open');
      document.querySelectorAll('.nav__item.is-open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.nav__expand').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.nav__item.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      item.querySelector('.nav__expand').setAttribute('aria-expanded', 'false');
    });
  });

  // HRA gap calculator: how many members fall short of a completion target.
  var calc = document.getElementById('gap-calc');
  if (calc) {
    var fmt = new Intl.NumberFormat('en-US');
    var update = function () {
      var n = Math.max(0, Number(calc.querySelector('#calc-members').value) || 0);
      var cur = Math.min(100, Math.max(0, Number(calc.querySelector('#calc-current').value) || 0));
      var target = Math.min(100, Math.max(0, Number(calc.querySelector('#calc-target').value) || 0));
      var short = Math.max(0, Math.round((n * (target - cur)) / 100));
      calc.querySelector('#calc-short').textContent = fmt.format(short);
      calc.querySelector('#calc-done').textContent = fmt.format(Math.round((n * cur) / 100));
      calc.querySelector('#calc-need').textContent = fmt.format(Math.round((n * target) / 100));
      calc.querySelector('#calc-msg').textContent =
        short === 0
          ? 'You are at or above the target. The question becomes how early in the window members finish, and what happens with their answers.'
          : 'members a year who need to finish an HRA they are not finishing today.';
    };
    calc.addEventListener('input', update);
    update();
  }

  // Demo request form. No backend is wired up yet: see website/README.md.
  var form = document.getElementById('demo-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.hidden = true;
      document.getElementById('demo-done').hidden = false;
    });
  }
})();
