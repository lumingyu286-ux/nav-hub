/* 成人内容百科 入口页 --------------------------------------- */
(function () {
  'use strict';

  /* 第一件事：标记脚本已启动，把 HTML 里的 .boot 兜底块藏掉。
     app.js 被拦截时这行不会执行，兜底块就留在页面上，
     访客至少看到一句解释而不是一片空白。 */
  document.documentElement.className += ' js-ok';

  var GATE_KEY = 'crbk-hub-age-ok';

  /* data.js 没加载出来时也得有个去处，所以域名在这里也存了一份。
     换主站域名时，这里和 data.js 里的 SITE.base 都要改。
     README「域名改动清单」一节列了全部四处。 */
  var FALLBACK_BASE = 'https://chengrenbaike.com';

  var $ = function (id) { return document.getElementById(id); };

  /* base 漏写 https:// 时补上 —— 否则拼出来是相对网址，
     会变成 https://<当前域名>/chengrenbaike.com/ 而全部 404，
     偏偏域名那一行还显示得人模人样，属于静默误导。 */
  function normBase() {
    var base = (typeof SITE === 'undefined' || !SITE) ? '' : String(SITE.base || '').trim();
    base = base.replace(/\/+$/, '');
    if (!base) return '';
    if (!/^https?:\/\//i.test(base)) base = 'https://' + base.replace(/^\/+/, '');
    return base;
  }

  /* 第二列既可以是路径，也可以是别的站的完整网址 */
  function urlFor(target) {
    var t = String(target || '').trim();
    if (/^https?:\/\//i.test(t)) return t;
    var base = normBase();
    /* base 为空时绝不能返回 '/'：那会指到托管域名的根目录
       （项目站上是另一个站），而且 hostOf('/') 得到空字符串，
       域名那一行会一片空白 —— 比拼错更难发现。
       直接抛出去，由启动处转到兜底页。 */
    if (!base) throw new Error('SITE.base is empty');
    if (!t) return base + '/';
    return base + '/' + t.replace(/^\/+/, '');
  }

  function hostOf(url) {
    try { return new URL(url).hostname; }
    catch (e) { return String(url).replace(/^https?:\/\//, '').replace(/\/.*$/, ''); }
  }

  function siteName() {
    return (typeof SITE !== 'undefined' && SITE && SITE.name) ? SITE.name : '成人内容百科';
  }

  /* --- 报头与页脚 ---------------------------------------- */

  function paintChrome() {
    $('title').textContent = siteName();
    $('lede').textContent = SITE.tagline || '';
    document.title = siteName() + ' - 入口';

    $('foot-note').textContent = SITE.deployedOn
      ? '本页是 ' + SITE.deployedOn + ' 上的一份入口，正文都在主站。'
      : '本页只是入口，正文都在主站。';
  }

  /* --- 入口标识条 ----------------------------------------
     每条都把目标域名显示出来。四个入口去同一个地方时，
     这是访客唯一能看出来的地方，别省。                    */

  function paintBoard() {
    var board = $('board');
    var frag = document.createDocumentFragment();

    ENTRIES.forEach(function (row) {
      var name = row[0], target = row[1], note = row[2];
      var href = urlFor(target);

      var a = document.createElement('a');
      a.className = 'slot';
      a.href = href;

      var n = document.createElement('span');
      n.className = 'slot-name';
      n.textContent = name;
      a.appendChild(n);

      if (note) {
        var p = document.createElement('span');
        p.className = 'slot-note';
        p.textContent = note;
        a.appendChild(p);
      }

      var h = document.createElement('span');
      h.className = 'slot-host';
      h.textContent = hostOf(href);
      a.appendChild(h);

      frag.appendChild(a);
    });

    board.appendChild(frag);
  }

  /* --- 出问题时的兜底 ------------------------------------
     分清三种情况再说话：data.js 根本没到、base 填空了、
     数据格式不对。笼统报「data.js 被拦截了」会把人带偏。 */

  var EXCUSE = {
    data:   '页面数据没能加载。刷新一下通常就好；如果反复失败，说明 data.js 被拦截了。',
    base:   'data.js 里的 SITE.base 是空的，入口地址拼不出来。填上主站域名就能恢复。',
    render: 'data.js 的内容格式有问题。检查 ENTRIES 每一行是不是 [名称, 路径, 说明] 这三项。'
  };

  function paintDataError(kind) {
    $('title').textContent = siteName();
    $('lede').textContent = EXCUSE[kind] || EXCUSE.data;
    document.title = siteName() + ' - 入口';

    var board = $('board');
    board.textContent = '';

    var a = document.createElement('a');
    a.className = 'slot';
    a.href = FALLBACK_BASE + '/';

    var n = document.createElement('span');
    n.className = 'slot-name';
    n.textContent = '直接进主站';

    var h = document.createElement('span');
    h.className = 'slot-host';
    h.textContent = hostOf(FALLBACK_BASE);

    a.appendChild(n);
    a.appendChild(h);
    board.appendChild(a);

    $('foot-note').textContent = '本页只是入口，正文都在主站。';
  }

  /* --- 年龄确认 ------------------------------------------
     #page 在 HTML 里带 hidden，确认通过才撤掉。
     光靠不透明遮罩盖住不够：遮罩下面的链接仍在 Tab 顺序里，
     访客能一路 Tab 过去回车进主站，把确认整个绕开。
     aria-modal 只影响读屏器，管不了键盘焦点。             */

  function openPage() {
    $('gate').hidden = true;
    $('page').hidden = false;
    document.body.style.overflow = '';
  }

  function runGate() {
    var passed;
    try { passed = localStorage.getItem(GATE_KEY) === '1'; }
    catch (e) { passed = false; }

    if (passed) { openPage(); return; }

    $('gate').hidden = false;
    document.body.style.overflow = 'hidden';
    $('gate-ok').focus();

    $('gate-ok').addEventListener('click', function () {
      try { localStorage.setItem(GATE_KEY, '1'); } catch (e) {}
      openPage();
    });

    $('gate-no').addEventListener('click', function () {
      if (history.length > 1) { history.back(); }
      else { location.replace('about:blank'); }
    });
  }

  /* --- 启动 ----------------------------------------------
     渲染出任何问题，年龄确认都必须照跑：这段要是没兜住，
     runGate 就永远不执行 —— 门不弹，页面直接敞着。        */

  var problem = '';
  try {
    if (typeof SITE === 'undefined' || typeof ENTRIES === 'undefined') {
      problem = 'data';
    } else if (!normBase()) {
      problem = 'base';
    } else {
      paintChrome();
      paintBoard();
    }
  } catch (e) {
    problem = 'render';
  }

  if (problem) {
    try { paintDataError(problem); } catch (e2) {}
  }

  runGate();
})();
