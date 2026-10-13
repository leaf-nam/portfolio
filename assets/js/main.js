// 진행률 + 도트 + 리빌 리플레이 + 구현 탭 + 용지 맞춤(fit)
(function () {
  const scroller = document.getElementById("scroller");
  const bar = document.getElementById("progress-bar");

  scroller.addEventListener(
    "scroll",
    () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      const p = max > 0 ? (scroller.scrollTop / max) * 100 : 0;
      bar.style.width = p + "%";
    },
    { passive: true },
  );

  // 섹션 표시: 도트 + .visible (떠나면 제거 → 돌아오면 애니메이션 리플레이)
  const dots = [...document.querySelectorAll("[data-dot]")];
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          dots.forEach((d) =>
            d.classList.toggle("active", d.dataset.dot === e.target.id),
          );
          e.target.classList.remove("visible");
          void e.target.offsetWidth;
          e.target.classList.add("visible");
        } else {
          e.target.classList.remove("visible");
        }
      });
    },
    { root: scroller, threshold: 0.3 },
  );
  document.querySelectorAll(".screen").forEach((s) => {
    s.classList.add("reveal");
    io.observe(s);
  });

  // PDF 버튼
  document
    .getElementById("btn-print")
    .addEventListener("click", () => window.print());

  // mermaid: .mmd 파일을 SVG로 인라인 렌더 (실패 시 플레이스홀더 유지)
  function loadMermaid() {
    return new Promise((resolve, reject) => {
      if (window.mermaid) return resolve(window.mermaid);
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
      s.onload = () => resolve(window.mermaid);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  async function renderMermaids() {
    const slots = [...document.querySelectorAll(".mermaid-slot[data-mmd]")];
    if (!slots.length) return;
    let mm;
    try {
      mm = await loadMermaid();
    } catch {
      return;
    }
    mm.initialize({
      startOnLoad: false,
      theme: "neutral",
      themeVariables: {
        fontFamily: '"Pretendard Variable", Pretendard, sans-serif',
      },
    });
    for (const [i, slot] of slots.entries()) {
      try {
        const res = await fetch(slot.dataset.mmd);
        if (!res.ok) continue;
        const text = await res.text();
        const { svg } = await mm.render("mmd-" + i, text);
        slot.innerHTML = svg;
      } catch {
        /* 플레이스홀더 유지 */
      }
    }
    fitPapers();
    setTimeout(fitPapers, 800);
    setTimeout(fitPapers, 2000);
  }
  renderMermaids();

  // 용지 맞춤: 내용이 고정비율 용지를 넘치면 Web에서만 축소 (인쇄 CSS는 별도 검증됨)
  function fitOne(inner) {
    const fit = inner.querySelector(":scope > .fit");
    if (!fit) return;
    if (window.matchMedia("(print)").matches || window.innerWidth < 861) {
      if (fit.style.zoom) fit.style.zoom = "";
      return;
    }
    fit.style.zoom = "";
    const cs = getComputedStyle(inner);
    const avail =
      inner.clientHeight -
      parseFloat(cs.paddingTop) -
      parseFloat(cs.paddingBottom);
    const need = fit.scrollHeight;
    if (need > avail && avail > 0) {
      fit.style.zoom = String((avail * 0.94) / need);
    }
  }
  function fitPapers() {
    document.querySelectorAll(".screen-inner").forEach(fitOne);
  }

  // h1~h3 제외 직계 자식에 .rise 자동 부여 (반드시 .fit 감싸기보다 먼저)
  document.querySelectorAll(".screen-inner").forEach((inner) => {
    let i = 0;
    inner
      .querySelectorAll(":scope > *:not(h1):not(h2):not(h3)")
      .forEach((el) => {
        el.classList.add("rise");
        if (!el.style.getPropertyValue("--d")) {
          el.style.setProperty("--d", `${Math.min(0.05 + i * 0.05, 0.5)}s`);
        }
        i++;
      });
  });

  // .screen-inner 자식들을 .fit 하나로 감싸기 (용지 박스는 그대로, 내용만 스케일)
  document.querySelectorAll(".screen-inner").forEach((inner) => {
    const fit = document.createElement("div");
    fit.className = "fit";
    while (inner.firstChild) fit.appendChild(inner.firstChild);
    inner.appendChild(fit);
  });

  // 펼침형 구현 패널 3개를 가로 그리드로 묶기 (데스크탑만 3단, 인쇄·모바일은 쌓기)
  document.querySelectorAll(".screen-inner .fit").forEach((fit) => {
    const panels = fit.querySelectorAll(":scope > .impl-panel");
    if (panels.length > 1) {
      const grid = document.createElement("div");
      grid.className = "impl-grid";
      fit.insertBefore(grid, panels[0]);
      panels.forEach((p) => grid.appendChild(p));
    }
  });

  let raf = 0;
  const scheduleFit = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fitPapers);
  };
  window.addEventListener("resize", scheduleFit);
  window.addEventListener("load", fitPapers);
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(fitPapers);
  // 웹폰트 교체 등 늦은 레이아웃 변화를 따라가도록 추가 재측정
  if (document.fonts && document.fonts.addEventListener)
    document.fonts.addEventListener("loadingdone", scheduleFit);
  setTimeout(fitPapers, 600);
  setTimeout(fitPapers, 1500);
  setTimeout(fitPapers, 4000);
  // 용지 크기 변화를 감지해 늦게 바뀌는 내용(웹폰트 등)에도 맞춤 유지
  if ("ResizeObserver" in window) {
    const ros = new ResizeObserver(scheduleFit);
    document
      .querySelectorAll(".screen-inner")
      .forEach((inner) => ros.observe(inner));
  }
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll(".screen-inner .fit").forEach((f) => {
      f.style.zoom = "";
    });
  });
  window.addEventListener("afterprint", fitPapers);
  window.matchMedia("(print)").addEventListener("change", (e) => {
    if (e.matches) {
      document.querySelectorAll(".screen-inner .fit").forEach((f) => {
        f.style.zoom = "";
      });
    } else fitPapers();
  });
})();
