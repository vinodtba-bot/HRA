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

  // Contact and demo forms post JSON to the endpoint in data-endpoint (see src/config.mjs),
  // which emails the submission to the company inbox.
  document.querySelectorAll('form[data-endpoint]').forEach(function (form) {
    var done = document.getElementById(form.getAttribute('data-done'));
    var error = form.querySelector('.form__error');
    var button = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = value; });
      if (data._honey) return; // filled in by a bot
      error.hidden = true;
      button.disabled = true;
      button.textContent = 'Sending…';
      fetch(form.getAttribute('data-endpoint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || body.success === false || body.success === 'false') throw new Error(body.message || res.status);
          });
        })
        .then(function () {
          form.hidden = true;
          done.hidden = false;
          done.focus();
        })
        .catch(function () {
          error.hidden = false;
          button.disabled = false;
          button.textContent = button.getAttribute('data-label');
        });
    });
  });

  // Copy buttons for addresses shown as text.
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.textContent;
      var ok = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = label; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(ok, function () {});
    });
  });
})();
