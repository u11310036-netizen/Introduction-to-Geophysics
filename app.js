/**
 * 地球物理通論 (General Geophysics) - 課程綜整與學習探究報告
 * 互動功能邏輯庫 (Interactive Logic)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeAndLang();
  initNavigation();
  initRoadmapFilter();
  initTravelTimeCalculator();
  initCerCaseSelector();
  initClilSentenceBank();
  initPromptCopy();
  initExitTicketGenerator();
});

/* ==========================================================================
   1. 主題與語言切換系統 (Theme & Language Switching)
   ========================================================================== */
function initThemeAndLang() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const langPills = document.querySelectorAll('.lang-pill');

  // Theme Toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      themeToggleBtn.innerHTML = isLight ? '🌙' : '☀️';
      themeToggleBtn.title = isLight ? '切換至暗黑模式' : '切換至明亮模式';
    });
  }

  // Language Mode Switching
  langPills.forEach(pill => {
    pill.addEventListener('click', () => {
      langPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const mode = pill.dataset.lang; // 'bilingual', 'zh', 'en'
      document.body.setAttribute('data-lang-mode', mode);
      showToast(mode === 'zh' ? '已切換為中文模式' : (mode === 'en' ? 'Switched to English Mode' : '已切換為中英雙語對照模式 (Bilingual)'));
    });
  });
}

/* ==========================================================================
   2. 側邊欄導航與滾動監聽 (Navigation & Scrollspy)
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section-block');
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.querySelector('.app-sidebar');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Active Link on Scroll
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. 18 週學習路線圖篩選 (Roadmap Filtering)
   ========================================================================== */
function initRoadmapFilter() {
  const filterBtns = document.querySelectorAll('.roadmap-filter-btn');
  const weekItems = document.querySelectorAll('.week-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter; // 'all', 'p1', 'p2', 'milestone'

      weekItems.forEach(item => {
        const weekNum = parseInt(item.dataset.week, 10);
        const isMilestone = item.classList.contains('exam') || item.classList.contains('final') || item.classList.contains('field');

        let show = false;
        if (filter === 'all') show = true;
        else if (filter === 'p1' && weekNum <= 8) show = true;
        else if (filter === 'p2' && weekNum >= 9) show = true;
        else if (filter === 'milestone' && isMilestone) show = true;

        item.style.display = show ? 'flex' : 'none';
      });
    });
  });
}

/* ==========================================================================
   4. 地震波走時計算機 (Seismic Wave Travel-time Calculator)
   Formula: t = d / v
   ========================================================================== */
function initTravelTimeCalculator() {
  const distanceInput = document.getElementById('calcDistance');
  const velocityInput = document.getElementById('calcVelocity');
  const presetSelect = document.getElementById('calcPreset');
  const resultTime = document.getElementById('resultTravelTime');
  const resultEarthPercent = document.getElementById('resultEarthPercent');
  const resultExplain = document.getElementById('resultExplain');

  const presets = {
    'custom': null,
    'crust-p': 6.0,       // 地殼 P波 ~6.0 km/s
    'crust-s': 3.5,       // 地殼 S波 ~3.5 km/s
    'mantle-p': 8.0,      // 上部地函 P波 ~8.0 km/s
    'sediment-p': 2.0,    // 沉積層 P波 ~2.0 km/s
    'water-p': 1.5        // 水中聲速 ~1.5 km/s
  };

  function recalculate() {
    const dist = parseFloat(distanceInput.value) || 0;
    const vel = parseFloat(velocityInput.value) || 0.001;

    if (dist <= 0 || vel <= 0) {
      resultTime.textContent = '0.00';
      resultEarthPercent.textContent = '0.00%';
      resultExplain.textContent = '請輸入大於 0 的距離與速度。';
      return;
    }

    const t = dist / vel;
    const earthRadius = 6371; // km
    const percentOfRadius = ((dist / earthRadius) * 100).toFixed(2);

    resultTime.textContent = t.toFixed(2);
    resultEarthPercent.textContent = `${percentOfRadius}%`;

    let explainText = `走時公式：t = d / v = ${dist} km ÷ ${vel} km/s = ${t.toFixed(2)} 秒。`;
    if (dist <= 100) {
      explainText += ` 適合近地表或小規模折射震測探勘。`;
    } else if (dist <= 1000) {
      explainText += ` 涵蓋區域性地殼至莫氏不連續面 (Moho) 臨界折射波傳播。`;
    } else {
      explainText += ` 達到跨板塊或全球地震學震波傳遞尺度。`;
    }
    resultExplain.textContent = explainText;
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (presets[val]) {
        velocityInput.value = presets[val];
      }
      recalculate();
    });
  }

  if (distanceInput && velocityInput) {
    distanceInput.addEventListener('input', recalculate);
    velocityInput.addEventListener('input', () => {
      presetSelect.value = 'custom';
      recalculate();
    });
    recalculate();
  }
}

/* ==========================================================================
   5. CER 探究論證案例切換 (CER Argumentation Studio)
   ========================================================================== */
function initCerCaseSelector() {
  const caseButtons = document.querySelectorAll('.case-btn');
  const claimZh = document.getElementById('cerClaimZh');
  const claimEn = document.getElementById('cerClaimEn');
  const evidenceZh = document.getElementById('cerEvidenceZh');
  const evidenceEn = document.getElementById('cerEvidenceEn');
  const reasoningZh = document.getElementById('cerReasoningZh');
  const reasoningEn = document.getElementById('cerReasoningEn');

  const cerData = {
    'taiwan': {
      claimZh: '台灣周圍頻繁的地震活動與聚合型板塊交界密切相關。',
      claimEn: 'Our claim is that earthquake activity around Taiwan is closely related to convergent plate interactions.',
      evidenceZh: '觀測地震分布圖，地震高度集中於東部花東縱谷、琉球海溝與馬尼拉海溝一帶，並非隨機散布。',
      evidenceEn: 'The earthquake map shows that earthquakes are concentrated in specific belts rather than being randomly distributed.',
      reasoningZh: '若地震是由板塊擠壓造成，其震源分布應沿著造山帶與隱沒界面形成條帶狀排列，觀測資料完全吻合此預期。',
      reasoningEn: 'If earthquakes are caused by plate interactions, their locations should follow tectonic structures rather than occurring randomly.'
    },
    'japan': {
      claimZh: '日本東側海域存在板塊隱沒作用，太平洋板塊向北美/歐亞板塊下方隱沒。',
      claimEn: 'Plate subduction occurs east of Japan where the Pacific Plate subducts beneath the overriding plate.',
      evidenceZh: '日本東側發育深海溝，震源深度由海溝向陸地內陸方向由淺逐漸加深，形成傾斜震源帶 (Wadati-Benioff zone)。',
      evidenceEn: 'A deep oceanic trench lies to the east, and earthquake depths increase systematically inland from shallow to deep.',
      reasoningZh: '板塊隱沒時，剛性海洋板塊向下俯衝至高溫地函，破裂地震沿傾斜板塊界面發生，造成深度漸變特徵。',
      reasoningEn: 'Because earthquakes occur along the inclined interface of the descending slab, a dipping seismic zone forms.'
    },
    'refraction': {
      claimZh: '地下介質存在兩層構造，且下層地層的地震波波速高於上層。',
      claimEn: 'The subsurface consists of two layers, and the lower layer has a higher seismic velocity (v2 > v1).',
      evidenceZh: '野外量測走時圖包含兩條不同斜率的折線，在交叉距離 (crossover distance) 之後由第二條線成為初達波。',
      evidenceEn: 'The travel-time graph contains two line segments with different slopes, and the second line arrives first at greater distances.',
      reasoningZh: '走時線斜率倒數代表震波速度。當下層速度較大時，臨界折射波在遠距離會超越直達波提早到達檢波器。',
      reasoningEn: 'Because travel-time slope is inversely related to velocity, a higher velocity layer produces a gentler slope that overtakes the direct wave.'
    },
    'gravity': {
      claimZh: '研究區域地下深處存在高密度地質體（如基性侵入岩體或緻密基盤）。',
      claimEn: 'A high-density body exists in the subsurface beneath the survey area.',
      evidenceZh: '布格重力異常圖在研究區域中央出現顯著的正異常高值峰 (Positive Gravity Anomaly)。',
      evidenceEn: 'A clear positive gravity anomaly peak is observed in the central part of the study area.',
      reasoningZh: '根據萬有引力定律，地下高密度物質具有較大引力吸引效應，導致地表測得之重力值高於區域平均值。',
      reasoningEn: 'Because higher density material produces greater gravitational pull, a subsurface dense body causes a positive anomaly.'
    }
  };

  caseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      caseButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const c = cerData[btn.dataset.case];
      if (c) {
        claimZh.textContent = c.claimZh;
        claimEn.textContent = c.claimEn;
        evidenceZh.textContent = c.evidenceZh;
        evidenceEn.textContent = c.evidenceEn;
        reasoningZh.textContent = c.reasoningZh;
        reasoningEn.textContent = c.reasoningEn;
      }
    });
  });
}

/* ==========================================================================
   6. CLIL 雙語句型庫搜尋與展開 (CLIL Sentence Bank)
   ========================================================================== */
function initClilSentenceBank() {
  const searchInput = document.getElementById('clilSearch');
  const levelBtns = document.querySelectorAll('.level-btn');
  const sentenceCards = document.querySelectorAll('.sentence-card');

  // Filter function
  function filterSentences() {
    const term = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const activeLevelBtn = document.querySelector('.level-btn.active');
    const selectedLevel = activeLevelBtn ? activeLevelBtn.dataset.level : 'all';

    sentenceCards.forEach(card => {
      const cardLevel = card.dataset.level;
      const textContent = card.textContent.toLowerCase();

      const matchesLevel = (selectedLevel === 'all' || cardLevel === selectedLevel);
      const matchesSearch = (!term || textContent.includes(term));

      card.style.display = (matchesLevel && matchesSearch) ? 'block' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterSentences);
  }

  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterSentences();
    });
  });

  // Example expanders
  document.querySelectorAll('.examples-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.nextElementSibling;
      if (container) {
        container.classList.toggle('show');
        const isShown = container.classList.contains('show');
        btn.innerHTML = isShown ? '收合實例 ▲' : '展開三例詳解 ▼';
      }
    });
  });
}

/* ==========================================================================
   7. AI Prompt 一鍵複製 (Prompt Matrix Copy)
   ========================================================================== */
function initPromptCopy() {
  document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.prompt-card').querySelector('.prompt-pre');
      if (pre) {
        navigator.clipboard.writeText(pre.innerText.trim()).then(() => {
          showToast('Prompt 已成功複製到剪貼簿！可直接貼至 Gemini');
        }).catch(() => {
          showToast('複製失敗，請手動全選複製。');
        });
      }
    });
  });
}

/* ==========================================================================
   8. 出門票與作業 Markdown 生成器 (Exit Ticket Generator)
   ========================================================================== */
function initExitTicketGenerator() {
  const nameInput = document.getElementById('ticketName');
  const groupInput = document.getElementById('ticketGroup');
  const learnInput = document.getElementById('ticketLearn');
  const toolInput = document.getElementById('ticketTool');
  const questionInput = document.getElementById('ticketQuestion');
  const outputPre = document.getElementById('ticketOutputPre');
  const copyBtn = document.getElementById('copyTicketBtn');

  function updatePreview() {
    const name = nameInput.value || '姓名';
    const group = groupInput.value || '第 X 組';
    const learn = learnInput.value || '地球物理是透過地表物理量推論地下看不見的構造';
    const tool = toolInput.value || 'Google Colab / PyGMT / Gemini';
    const question = questionInput.value || '如何從走時圖的斜率計算出第二層介質的折射波速？';

    const md = `# Week 01 Exit Ticket & Learning Record

- **學生姓名**：${name}
- **所屬組別**：${group}
- **繳交時間**：${new Date().toLocaleDateString('zh-TW')}

## 今日出門票三句回饋
1. **Today I learned that geophysics is** ${learn}.
2. **One digital tool I used today was** ${tool}.
3. **One question I still have is** ${question}.

## 核心反思 (Reflection)
- **AI 協助之處**：AI 扮演假說生成者 (Hypothesis Generator)，提供了板塊隱沒與地震波傳遞的可能解釋。
- **我的查證與批判**：我沒有直接全盤接受 AI 的結論，而是透過比對台灣地震深度資料與走時公式 $t = d/v$ 來驗證合理性。
- **下週展望**：在 Colab 中安裝 PyGMT 0.17 並親手繪製全球地形與台灣板塊邊界圖。`;

    if (outputPre) {
      outputPre.textContent = md;
    }
  }

  [nameInput, groupInput, learnInput, toolInput, questionInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updatePreview);
  });

  if (copyBtn && outputPre) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(outputPre.textContent).then(() => {
        showToast('Exit Ticket Markdown 已複製！可直接貼入 GitHub README');
      });
    });
  }

  updatePreview();
}

/* ==========================================================================
   工具函數：Toast 提示訊息 (Toast Notification)
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}
