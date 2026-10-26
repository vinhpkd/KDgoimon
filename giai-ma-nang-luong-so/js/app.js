(function () {
  'use strict';

  const DB = window.NANG_LUONG_SO_DATA || {};
  const TABLE_999 = DB.TABLE_999 || {};
  const PAIRS_100 = DB.PAIRS_100 || {};
  const EIGHT_FIELDS = DB.EIGHT_FIELDS || {};
  const SUMMARY_CASES = DB.SUMMARY_CASES || {};
  const TRANSFORMATIONS = DB.TRANSFORMATIONS || [];
  const LINH_SO = DB.LINH_SO || {};

  // Extra metadata for the 8 Magnetic Fields (from Sheet 6: BẢNG TỪ TRƯỜNG & Sheet 9: Setup (Đ))
  const FIELD_EXTRA = {
    'THIÊN Y': {
      subtitle: 'Tình, tiền - Quà của trời (Đại Tài)',
      isCat: true,
      pairs: ['13', '31', '68', '86', '49', '94', '27', '72'],
      an0: ['103', '301', '608', '806', '409', '904', '207', '702'],
      kich5: ['153', '351', '658', '856', '459', '954', '257', '752'],
      keywords:
        '• Bát phương tài - Tài phú Trời sinh, thông minh, thiện lương, hào phóng, trí tuệ\n• Chính tình, chính tài, vượng hôn nhân\n• Từ trường phúc báo, khai mở trí tuệ',
      shortKey: 'Chính tài, chính tình, thông minh, thiện lương, phúc báo'
    },
    'SINH KHÍ': {
      subtitle: 'Đại Quý Nhân - Vui vẻ, Hanh thông',
      isCat: true,
      pairs: ['14', '41', '67', '76', '39', '93', '28', '82'],
      an0: ['104', '401', '607', '706', '309', '903', '208', '802'],
      kich5: ['154', '451', '657', '756', '359', '953', '258', '852'],
      keywords:
        '• Lạc quan, vui vẻ tích cực, bình tĩnh\n• Trí tuệ, hào phóng, cho đi, hòa giải kết nối\n• Tùy ngộ mà an, may mắn, Quý nhân xuất hiện\n• Từ trường vượng đinh',
      shortKey: 'Đại quý nhân, lạc quan, vui vẻ, nhân duyên tốt, may mắn'
    },
    'DIÊN NIÊN': {
      subtitle: 'Nam tử hán - Đại trượng phu (Quan vận, Năng lực)',
      isCat: true,
      pairs: ['19', '91', '78', '87', '34', '43', '26', '62'],
      an0: ['109', '901', '708', '807', '304', '403', '206', '602'],
      kich5: ['159', '951', '758', '857', '354', '453', '256', '652'],
      keywords:
        '• Năng lực, lãnh đạo, chính kiến, trách nhiệm, uy tín, chính nghĩa\n• Bản lĩnh, chịu được áp lực, thà thiếu không ẩu\n• Khổ tài, bảo thủ, gia trưởng\n• Sức khỏe: xương khớp, cổ vai gáy',
      shortKey: 'Lãnh đạo, bản lĩnh, trách nhiệm, uy tín, chịu áp lực'
    },
    'PHỤC VỊ': {
      subtitle: 'Đi với tốt thành tốt, đi với xấu thành xấu',
      isCat: true,
      pairs: ['11', '22', '88', '99', '77', '66', '44', '33', '00'],
      an0: ['101', '202', '808', '909', '707', '606', '404', '303'],
      kich5: ['151', '252', '858', '959', '757', '656', '454', '353'],
      keywords:
        '• Ẩn nhẫn chờ thời, kiên trì, ngọa hổ tàng long\n• Cẩn trọng, an toàn, ngại thay đổi, lập trường vững vàng\n• Thiếu quyết đoán, độ ỳ cao, bảo thủ, chờ đợi dễ mất cơ hội\n• Khổ tài, giỏi chịu đựng',
      shortKey: 'Kiên trì, cẩn trọng, ổn định, ẩn nhẫn chờ thời'
    },
    'LỤC SÁT': {
      subtitle: 'Cái đẹp, Đào hoa, Dịch vụ & Cảm xúc',
      isCat: false,
      pairs: ['16', '61', '74', '47', '38', '83', '92', '29'],
      an0: ['106', '601', '704', '407', '308', '803', '902', '209'],
      kich5: ['156', '651', '754', '457', '358', '853', '952', '259'],
      keywords:
        '• Tinh tế, khéo léo, thẩm mỹ, giao tế & kết nối đỉnh cao\n• Trọng tình, sống tình cảm, nhạy cảm, đào hoa, mị lực\n• Suy nghĩ, lo lắng, do dự thiếu quyết đoán, quản trị cảm xúc kém\n• Tỷ lệ chiêu cảm ngoại tình, ly hôn cao; lưu ý sức khỏe đường sinh sản',
      shortKey: 'Tinh tế, khéo léo, đào hoa, nhạy cảm, dễ u sầu'
    },
    'TUYỆT MỆNH': {
      subtitle: 'Đầu tư mạo hiểm - Đại phát hoặc Đại phá',
      isCat: false,
      pairs: ['12', '21', '69', '96', '37', '73', '84', '48'],
      an0: ['102', '201', '609', '906', '307', '703', '804', '408'],
      kich5: ['152', '251', '659', '956', '357', '753', '854', '458'],
      keywords:
        '• Quân tử, thẳng tính, rõ ràng, nhanh nhạy, quyết đoán, ý chí\n• Thích đầu tư, ưa mạo hiểm: Đại phát hoặc Đại phá\n• Chịu áp lực tốt, chăm chỉ\n• Chiêu cảm bệnh tật (gan, thận, tiểu đường), tai nạn, họa huyết quang',
      shortKey: 'Quyết đoán, dám nghĩ dám làm, ưa mạo hiểm, dễ hao tài'
    },
    'HỌA HẠI': {
      subtitle: 'Cái miệng - Khẩu tài & Thị phi',
      isCat: false,
      pairs: ['17', '71', '98', '89', '46', '64', '23', '32'],
      an0: ['107', '701', '908', '809', '406', '604', '203', '302'],
      kich5: ['157', '751', '958', '859', '456', '654', '253', '352'],
      keywords:
        '• Khẩu tài ăn nói, lấy miệng làm nghiệp (giáo viên, tư vấn, sales)\n• Hào phóng, nóng tính, thẳng tính, cái tôi cao, hiếu thắng\n• Hút thị phi, tiểu nhân, khắc khẩu xung đột gia đình\n• Mạnh miệng nhưng tâm yếu; lưu ý sức khỏe đường hô hấp',
      shortKey: 'Khẩu tài ăn nói, thẳng tính, dễ vướng thị phi, khắc khẩu'
    },
    'NGŨ QUỶ': {
      subtitle: 'Quân tử / Ngụy Quân Tử - Trí tuệ & Biến động',
      isCat: false,
      pairs: ['18', '81', '79', '97', '36', '63', '24', '42'],
      an0: ['108', '801', '709', '907', '306', '603', '204', '402'],
      kich5: ['158', '851', '759', '957', '356', '653', '254', '452'],
      keywords:
        '• Biến động, thông minh, linh hoạt, sáng tạo, túc trí đa mưu\n• Thông linh, giác quan thứ 6 mạnh mẽ, đa tài - đa nghi\n• Ám tài, tiền đến nhanh - đi nhanh\n• Lưu ý bệnh tim mạch, huyết áp, mất ngủ, họa huyết quang',
      shortKey: 'Thông minh, sáng tạo, đa mưu, nhiều biến động, thức khuya'
    }
  };

  const AGE_BRACKETS = [
    '0-10',
    '10-15',
    '15-20',
    '20-25',
    '25-30',
    '30-35',
    '35-40',
    '40-45',
    '45-50',
    '50-55',
    '55-70'
  ];

  const PRESETS = {
    tra_so: {
      name: 'Phạm Thị Phướn',
      phone: '0378673514',
      cccd: '034173017102',
      years: '1',
      job: 'Chuyên gia'
    },
    dien_thoai: {
      name: 'Khách hàng Chiến Compass',
      phone: '0826918681',
      cccd: '034095002034',
      years: '',
      job: ''
    }
  };

  let currentModalPair = '86';
  let currentLinhSoFilter = 'ALL';
  let currentAnalysisState = null;

  // ==================== HELPERS ====================
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function getNatureBadgeClass(nature) {
    if (!nature) return 'badge-phuc-vi';
    const norm = nature.trim().toLowerCase();
    if (norm === 'tốt' || norm === 'cát tinh') return 'badge-tot';
    if (norm === 'chưa tốt') return 'badge-chua-tot';
    if (norm === 'rất xấu') return 'badge-rat-xau';
    if (norm === 'xấu' || norm === 'hung tinh') return 'badge-xau';
    return 'badge-phuc-vi';
  }

  function getFallbackMeaningFor3Digit(entry) {
    if (!entry) return '';
    if (entry.meaning && entry.meaning !== '#N/A') return entry.meaning;
    if (entry.clusterName === 'TỔ HỢP PHỤC VỊ') {
      return 'Tổ hợp số này có thực sự tốt hay không còn phụ thuộc nhiều vào các cặp số đứng trước nó là tốt hay xấu. Đứng trước nó là tổ hợp số tốt thì nó sẽ đi theo chiều hướng tốt. Còn đứng trước nó là tổ hợp số xấu thì nó cũng đi theo chiều hướng xấu. Thường thì nó sẽ mang đến sự trì trệ, thụ động, khó bứt phá.';
    }
    const found = TRANSFORMATIONS.find(
      (t) =>
        t.finalTransform === entry.clusterName ||
        t.originTransform === entry.clusterName
    );
    return found ? found.meaning : '';
  }

  // ==================== CORE ANALYSIS ENGINE (MIRRORS SHEET A ĐẠT) ====================
  function analyzeCustomerData(rawName, rawPhone, rawCCCD, rawYears, rawJob, showAllMeanings) {
    const cleanPhone = (rawPhone || '').replace(/\D/g, '');
    let normPhone = cleanPhone;
    if (normPhone.length === 9 && !normPhone.startsWith('0')) {
      normPhone = '0' + normPhone;
    }

    // In Excel Sheet A ĐẠT: C10:K10 takes characters 2..10 of the 10-digit phone number
    const activeDigitsStr = normPhone.startsWith('0') && normPhone.length >= 10
      ? normPhone.slice(1, 10)
      : normPhone.slice(0, 9);
    const activeDigits = activeDigitsStr.split('');

    // 1. Build 7 clusters of 3 digits (B20:B26 in A ĐẠT)
    const clusters3 = [];
    for (let i = 0; i <= activeDigits.length - 3; i++) {
      const code = activeDigits[i] + activeDigits[i + 1] + activeDigits[i + 2];
      const row999 = TABLE_999[code] || {
        code,
        p1: code.slice(0, 2),
        p2: code.slice(1, 3),
        f1: '',
        f2: '',
        clusterName: 'CHƯA XÁC ĐỊNH',
        dataName: 'CHƯA XÁC ĐỊNH',
        meaning: '',
        nature: '',
        showMid: '0',
        hidden0: code.includes('0') ? 'Có' : ''
      };

      const isLastRow = i === activeDigits.length - 3;
      const excelDisplaysMeaning = isLastRow || row999.showMid !== '';
      const resolvedMeaning = getFallbackMeaningFor3Digit(row999);
      const displayedMeaning = showAllMeanings
        ? resolvedMeaning
        : excelDisplaysMeaning
        ? resolvedMeaning
        : '';

      const natureStr = row999.nature || '';
      const isRatXau = natureStr.trim().toLowerCase() === 'rất xấu';
      const hasHidden0 = (row999.hidden0 && row999.hidden0.trim() !== '') || code.includes('0');
      const hasKich5 = code.includes('5');

      clusters3.push({
        index: i + 1,
        code,
        p1: row999.p1 || code.slice(0, 2),
        p2: row999.p2 || code.slice(1, 3),
        fieldCluster: row999.dataName || row999.clusterName,
        nature: natureStr,
        meaning: displayedMeaning,
        fullMeaning: resolvedMeaning,
        hasHidden0,
        hasKich5,
        isRatXau,
        isLastRow
      });
    }

    // 2. Build 8 pairs of 2 digits (F40:F47 in A ĐẠT)
    const pairs2 = [];
    for (let i = 0; i <= activeDigits.length - 2; i++) {
      const pair = activeDigits[i] + activeDigits[i + 1];
      const pInfo = PAIRS_100[pair] || { pair, field: 'PHỤC VỊ', advice: '' };
      const fieldInfo = EIGHT_FIELDS[pInfo.field] || { type: 'CÁT TINH' };
      const extra = FIELD_EXTRA[pInfo.field] || {};
      pairs2.push({
        index: i + 1,
        pair,
        field: pInfo.field,
        type: fieldInfo.type || (extra.isCat ? 'CÁT TINH' : 'HUNG TINH'),
        shortKey: extra.shortKey || ''
      });
    }

    // 3. Summary Evaluation (Mirrors G27, H27, I27, B35 in Sheet A ĐẠT)
    const countHidden0 = clusters3.filter((c) => c.hasHidden0).length; // G27
    const countHungTuTap = clusters3.filter((c) => c.isRatXau).length; // H27
    const lastCluster = clusters3[clusters3.length - 1];
    const lastNatureLower = lastCluster ? (lastCluster.nature || '').trim().toLowerCase() : '';
    const isEndHung = lastNatureLower === 'rất xấu' || lastNatureLower === 'xấu' ? 1 : 0; // I27

    let summaryCaseId = 1;
    if (countHidden0 + countHungTuTap + isEndHung === 0) {
      summaryCaseId = 1;
    } else if (countHidden0 === 0 && countHungTuTap === 0 && isEndHung > 0) {
      summaryCaseId = 2;
    } else if (countHidden0 === 0 && isEndHung === 0 && countHungTuTap > 0) {
      summaryCaseId = 3;
    } else if (countHungTuTap > 0 && isEndHung > 0 && countHidden0 === 0) {
      summaryCaseId = 4;
    } else if (countHidden0 > 0 && countHungTuTap === 0 && isEndHung === 0) {
      summaryCaseId = 5;
    } else if (countHidden0 > 0 && countHungTuTap === 0 && isEndHung > 0) {
      summaryCaseId = 6;
    } else if (countHidden0 > 0 && countHungTuTap > 0 && isEndHung === 0) {
      summaryCaseId = 7;
    } else {
      summaryCaseId = 8;
    }

    const summaryCase = SUMMARY_CASES[String(summaryCaseId)] || {
      id: summaryCaseId,
      title: 'Tổng kết',
      content: ''
    };

    // 4. CCCD Analysis (Mirrors A40:D50 in Sheet A ĐẠT)
    const cleanCCCD = (rawCCCD || '').replace(/\D/g, '');
    let normCCCD = cleanCCCD;
    if (normCCCD.length === 11) {
      normCCCD = '0' + normCCCD;
    }

    const cccdStages = [];
    for (let i = 0; i < AGE_BRACKETS.length; i++) {
      const pair = normCCCD.length >= i + 2 ? normCCCD.slice(i, i + 2) : '--';
      const pInfo = PAIRS_100[pair];
      const field = pInfo ? pInfo.field : '--';
      const fieldMeta = EIGHT_FIELDS[field] || {};
      const fullAdvice = pInfo ? pInfo.advice : '';
      const displayedAdvice = showAllMeanings || i >= 3 ? fullAdvice : '';

      cccdStages.push({
        age: AGE_BRACKETS[i],
        pair,
        field,
        type: fieldMeta.type || '--',
        advice: displayedAdvice,
        fullAdvice
      });
    }

    return {
      name: rawName || 'Khách hàng',
      rawPhone,
      normPhone,
      activeDigits,
      rawCCCD,
      normCCCD,
      years: rawYears || '',
      job: rawJob || '',
      clusters3,
      pairs2,
      countHidden0,
      countHungTuTap,
      isEndHung,
      summaryCaseId,
      summaryCase,
      cccdStages
    };
  }

  // ==================== RENDER TAB 1: ANALYZER ====================
  function renderAnalyzer() {
    const rawName = document.getElementById('inpName').value.trim();
    const rawPhone = document.getElementById('inpPhone').value.trim();
    const rawCCCD = document.getElementById('inpCCCD').value.trim();
    const rawYears = document.getElementById('inpYears').value.trim();
    const rawJob = document.getElementById('inpJob').value.trim();
    const showAllMeanings = document.getElementById('chkShowAllMeanings').checked;

    const state = analyzeCustomerData(rawName, rawPhone, rawCCCD, rawYears, rawJob, showAllMeanings);
    currentAnalysisState = state;

    // Customer summary strip
    document.getElementById('outCustomerName').textContent = state.name || 'Chưa nhập tên';
    document.getElementById('outCustomerPhone').textContent = state.normPhone || 'Chưa nhập SĐT';
    document.getElementById('outCustomerCCCD').textContent = state.normCCCD || 'Chưa nhập CCCD';

    const metaParts = [];
    if (state.years) metaParts.push(`${state.years} năm`);
    if (state.job) metaParts.push(state.job);
    document.getElementById('outCustomerMeta').textContent =
      metaParts.length > 0 ? metaParts.join(' • ') : 'Chưa cập nhật';

    // Digits visual breakdown
    const digitsContainer = document.getElementById('phoneDigitsBoxes');
    if (state.normPhone.length > 0) {
      const allDigits = state.normPhone.split('');
      digitsContainer.innerHTML = allDigits
        .map((d, idx) => {
          const isLeadingZero = idx === 0 && d === '0' && allDigits.length >= 10;
          let cls = 'digit-box';
          if (isLeadingZero) cls += ' digit-ignored';
          else if (d === '0') cls += ' digit-zero';
          else if (d === '5') cls += ' digit-five';
          return `<div class="${cls}" title="${isLeadingZero ? 'Số 0 đầu mã vùng' : 'Số tính từ trường'}">${escapeHtml(d)}</div>`;
        })
        .join('');
    } else {
      digitsContainer.innerHTML = '<span class="text-muted">Vui lòng nhập số điện thoại</span>';
    }

    const tail4 = state.normPhone.slice(-4);
    const lastCluster = state.clusters3[state.clusters3.length - 1];
    document.getElementById('phoneDominantTail').innerHTML = tail4
      ? `4 số cuối: <strong>${escapeHtml(tail4)}</strong> • Từ trường kết đuôi: <strong>${escapeHtml(
          lastCluster ? lastCluster.fieldCluster : '--'
        )}</strong>`
      : '4 số cuối: --';

    // Energy Flags Row
    const flagsRow = document.getElementById('energyFlagsRow');
    const countXauChuaTot = state.clusters3.filter((c) => {
      const n = (c.nature || '').trim().toLowerCase();
      return n === 'xấu' || n === 'chưa tốt' || n === 'rất xấu';
    }).length;

    const flagItems = [
      {
        label: `Ẩn 0: ${state.countHidden0 > 0 ? 'Có (' + state.countHidden0 + ')' : 'Không (0)'}`,
        cls: state.countHidden0 > 0 ? 'danger' : 'ok',
        icon: state.countHidden0 > 0 ? '⚠️' : '✅'
      },
      {
        label: `Hung tinh tụ tập (Rất xấu): ${state.countHungTuTap > 0 ? 'Có (' + state.countHungTuTap + ')' : 'Không (0)'}`,
        cls: state.countHungTuTap > 0 ? 'danger' : 'ok',
        icon: state.countHungTuTap > 0 ? '🔥' : '✅'
      },
      {
        label: `Cụm Xấu / Chưa tốt: ${countXauChuaTot > 0 ? countXauChuaTot + ' cụm' : '0 cụm'}`,
        cls: countXauChuaTot > 0 ? 'warning' : 'ok',
        icon: countXauChuaTot > 0 ? '⚡' : '✅'
      },
      {
        label: `Kết cuối (3 số đuôi): ${state.isEndHung > 0 ? 'Kết Hung' : 'Kết Tốt'}`,
        cls: state.isEndHung > 0 ? 'danger' : 'ok',
        icon: state.isEndHung > 0 ? '🛑' : '✅'
      }
    ];
    flagsRow.innerHTML = flagItems
      .map((f) => `<span class="flag-chip ${f.cls}">${f.icon} ${escapeHtml(f.label)}</span>`)
      .join('');

    // Render Table 1: 3-Digit Combinations
    const tbody3 = document.getElementById('tbodyPhone3Digits');
    if (state.clusters3.length === 0) {
      tbody3.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#718096;">Nhập ít nhất 4 chữ số điện thoại để phân tích tổ hợp 3 số.</td></tr>`;
    } else {
      const goodCount = state.clusters3.filter((c) => c.nature.toLowerCase() === 'tốt').length;
      document.getElementById('badge3DigitSummary').textContent = `${goodCount}/${state.clusters3.length} cụm Tốt`;

      tbody3.innerHTML = state.clusters3
        .map((c) => {
          const badgeCls = getNatureBadgeClass(c.nature);
          const extraTags = [];
          if (c.hasHidden0) extraTags.push(`<span class="sub-tag an0">Ẩn 0</span>`);
          if (c.hasKich5) extraTags.push(`<span class="sub-tag kich5">Kích 5</span>`);

          return `
            <tr>
              <td><strong>#${c.index}</strong></td>
              <td><span class="num-pill">${escapeHtml(c.code)}</span></td>
              <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap;">
                  <button type="button" class="pair-btn" data-open-pair="${escapeHtml(c.p1)}" title="Xem nghiệm lý cặp số ${escapeHtml(c.p1)}">${escapeHtml(c.p1)}</button>
                  <button type="button" class="pair-btn" data-open-pair="${escapeHtml(c.p2)}" title="Xem nghiệm lý cặp số ${escapeHtml(c.p2)}">${escapeHtml(c.p2)}</button>
                </div>
              </td>
              <td>
                <div style="font-weight:700;color:var(--primary-900);margin-bottom:4px;">
                  ${escapeHtml(c.fieldCluster)}
                </div>
                <span class="badge-nature ${badgeCls}">=> ${escapeHtml(c.nature || 'Chưa rõ')}</span>
                ${extraTags.join('')}
              </td>
              <td>
                ${
                  c.meaning
                    ? `<div>${escapeHtml(c.meaning)}</div>`
                    : `<span style="color:#94a3b8;font-style:italic;">(Ẩn diễn giải giữa theo công thức Excel — Bật "Hiện đầy đủ" để xem)</span>`
                }
              </td>
            </tr>
          `;
        })
        .join('');
    }

    // Render Table 2: 2-Digit Pairs
    const tbody2 = document.getElementById('tbodyPhone2Digits');
    if (state.pairs2.length === 0) {
      tbody2.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#718096;">Chưa có dữ liệu cặp số.</td></tr>`;
    } else {
      const catCount = state.pairs2.filter((p) => p.type === 'CÁT TINH').length;
      const hungCount = state.pairs2.length - catCount;
      document.getElementById('badge2DigitSummary').textContent = `${catCount} Cát Tinh • ${hungCount} Hung Tinh`;

      tbody2.innerHTML = state.pairs2
        .map((p) => {
          const badgeCls = p.type === 'CÁT TINH' ? 'badge-cat' : 'badge-hung';
          const linhSoEntry = LINH_SO[p.pair];
          const linhSoTitle = linhSoEntry ? linhSoEntry.title : `Từ trường ${p.field}`;
          return `
            <tr>
              <td><strong>Cặp ${p.index}</strong></td>
              <td><span class="num-pill">${escapeHtml(p.pair)}</span></td>
              <td><strong style="color:var(--primary-900);">${escapeHtml(p.field)}</strong></td>
              <td><span class="badge-nature ${badgeCls}">${escapeHtml(p.type)}</span></td>
              <td>
                <div style="font-weight:600;color:var(--primary-800);font-size:13px;">${escapeHtml(linhSoTitle)}</div>
                <div style="font-size:12.5px;color:var(--text-secondary);">${escapeHtml(p.shortKey)}</div>
              </td>
              <td class="no-print">
                <button type="button" class="btn btn-outline-primary btn-sm" data-open-pair="${escapeHtml(p.pair)}">
                  📖 Nghiệm lý số ${escapeHtml(p.pair)}
                </button>
              </td>
            </tr>
          `;
        })
        .join('');
    }

    // Render Summary Box
    const selOverride = document.getElementById('selOverrideSummaryCase');
    const overrideVal = selOverride ? selOverride.value : 'AUTO';
    let effectiveCaseId = state.summaryCaseId;

    if (overrideVal === 'EXCEL_BUG') {
      // In Excel Sheet A ĐẠT, COUNTA(G20:G26) was 7 (>0), so G27>0 was always true
      if (state.countHungTuTap === 0 && state.isEndHung === 0) effectiveCaseId = 5;
      else if (state.countHungTuTap === 0 && state.isEndHung > 0) effectiveCaseId = 6;
      else if (state.countHungTuTap > 0 && state.isEndHung === 0) effectiveCaseId = 7;
      else effectiveCaseId = 8;
    } else if (overrideVal !== 'AUTO' && SUMMARY_CASES[overrideVal]) {
      effectiveCaseId = parseInt(overrideVal, 10);
    }

    const effectiveCase = SUMMARY_CASES[String(effectiveCaseId)] || state.summaryCase;
    state.effectiveSummaryCase = effectiveCase;

    const summaryCardBox = document.getElementById('summaryCardBox');
    const summaryStatusPill = document.getElementById('summaryStatusPill');
    const summaryCaseTag = document.getElementById('summaryCaseTag');
    const summaryMainText = document.getElementById('summaryMainText');

    if (effectiveCaseId === 1) {
      summaryCardBox.classList.remove('is-danger');
      summaryCardBox.classList.add('is-good');
      summaryStatusPill.className = 'status-pill badge-tot';
      summaryStatusPill.textContent = '✅ Sơ bộ Năng lượng Tốt';
    } else {
      summaryCardBox.classList.remove('is-good');
      summaryCardBox.classList.add('is-danger');
      summaryStatusPill.className = 'status-pill badge-xau';
      summaryStatusPill.textContent = '⚠️ Cảnh báo Cấu trúc Số';
    }

    summaryCaseTag.textContent = `Trường hợp #${effectiveCaseId}: ${effectiveCase.title || ''}`;
    summaryMainText.textContent = (effectiveCase.content || '').trim();

    // Render CCCD Timeline & Table
    document.getElementById('badgeCCCDNumber').textContent = `CCCD: ${state.normCCCD || '--'}`;
    const timelineStrip = document.getElementById('cccdTimelineStrip');
    timelineStrip.innerHTML = state.cccdStages
      .map((st) => {
        let nodeCls = 'phuc';
        if (st.field === 'PHỤC VỊ') nodeCls = 'phuc';
        else if (st.type === 'CÁT TINH') nodeCls = 'cat';
        else if (st.type === 'HUNG TINH') nodeCls = 'hung';

        return `
          <div class="timeline-node ${nodeCls}" data-open-pair="${escapeHtml(st.pair)}" title="Bấm để xem nghiệm lý cặp số ${escapeHtml(st.pair)} (Tuổi ${st.age})">
            <div class="tn-age">${escapeHtml(st.age)} tuổi</div>
            <div class="tn-pair">${escapeHtml(st.pair)}</div>
            <div class="tn-field">${escapeHtml(st.field)}</div>
          </div>
        `;
      })
      .join('');

    const tbodyCCCD = document.getElementById('tbodyCCCD');
    tbodyCCCD.innerHTML = state.cccdStages
      .map((st) => {
        const badgeCls =
          st.field === 'PHỤC VỊ'
            ? 'badge-phuc-vi'
            : st.type === 'CÁT TINH'
            ? 'badge-cat'
            : 'badge-hung';
        return `
          <tr>
            <td><strong>${escapeHtml(st.age)} tuổi</strong></td>
            <td><span class="num-pill">${escapeHtml(st.pair)}</span></td>
            <td><strong style="color:var(--primary-900);">${escapeHtml(st.field)}</strong></td>
            <td><span class="badge-nature ${badgeCls}">${escapeHtml(st.type)}</span></td>
            <td>
              ${
                st.advice
                  ? `<div>${escapeHtml(st.advice)}</div>`
                  : `<span style="color:#94a3b8;font-style:italic;">(Đang ẩn theo mẫu Sheet TRA SỐ — Bật "Hiện đầy đủ" để xem)</span>`
              }
            </td>
            <td class="no-print">
              ${
                st.pair !== '--'
                  ? `<button type="button" class="pair-btn" data-open-pair="${escapeHtml(st.pair)}">📖 Số ${escapeHtml(st.pair)}</button>`
                  : ''
              }
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // ==================== RENDER TAB 2: LINH SỐ BÁT PHÁP (00-99) ====================
  function buildLinhSoDetailHTML(pair) {
    const normPair = String(pair || '00').padStart(2, '0');
    const pInfo = PAIRS_100[normPair] || { pair: normPair, field: 'PHỤC VỊ', advice: '' };
    const fInfo = EIGHT_FIELDS[pInfo.field] || { type: 'CÁT TINH', cccdAdvice: '' };
    const extra = FIELD_EXTRA[pInfo.field] || {};
    const entry = LINH_SO[normPair];

    const typeBadgeCls = fInfo.type === 'CÁT TINH' ? 'badge-cat' : 'badge-hung';

    if (entry) {
      const sectionsHtml = (entry.sections || [])
        .map((sec) => {
          const isStory = sec.heading.toLowerCase().includes('câu chuyện');
          const icon = isStory
            ? '💡'
            : sec.heading.toLowerCase().includes('sức khỏe')
            ? '🩺'
            : sec.heading.toLowerCase().includes('tai nạn')
            ? '⚠️'
            : sec.heading.toLowerCase().includes('tài vận')
            ? '💰'
            : '📌';
          return `
            <div class="ls-section-card ${isStory ? 'story-card' : ''}">
              <div class="ls-sec-heading">${icon} ${escapeHtml(sec.heading)}</div>
              <div class="ls-sec-content">${escapeHtml(sec.content)}</div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="linh-so-header-banner">
          <div class="lsh-number">${escapeHtml(normPair)}</div>
          <div class="lsh-info">
            <div>
              <span class="badge-nature ${typeBadgeCls}">Từ trường: ${escapeHtml(pInfo.field)} (${escapeHtml(fInfo.type)})</span>
            </div>
            <h3 class="lsh-title">${escapeHtml(entry.title || 'SỐ ' + normPair)}</h3>
          </div>
        </div>
        <div class="linh-so-sections-grid">
          ${sectionsHtml}
          <div class="ls-section-card">
            <div class="ls-sec-heading">🧭 Năng lượng Đại Vận CCCD khi gặp cặp số ${escapeHtml(normPair)} (${escapeHtml(pInfo.field)})</div>
            <div class="ls-sec-content">${escapeHtml(pInfo.advice || fInfo.cccdAdvice)}</div>
          </div>
        </div>
      `;
    }

    // Fallback for pairs containing 5 or 0 (e.g., 15, 20, 25, 30, 35, 44, 50..59) not in the 74-entry Linh so impore sheet
    return `
      <div class="linh-so-header-banner">
        <div class="lsh-number">${escapeHtml(normPair)}</div>
        <div class="lsh-info">
          <div>
            <span class="badge-nature ${typeBadgeCls}">Từ trường: ${escapeHtml(pInfo.field)} (${escapeHtml(fInfo.type)})</span>
          </div>
          <h3 class="lsh-title">SỐ ${escapeHtml(normPair)} – NĂNG LƯỢNG ${escapeHtml(pInfo.field)} ${
      normPair.includes('0') ? '(ẨN 0)' : normPair.includes('5') ? '(KÍCH 5 / PHỤC VỊ 5)' : ''
    }</h3>
        </div>
      </div>
      <div class="linh-so-sections-grid">
        <div class="ls-section-card">
          <div class="ls-sec-heading">📌 Bản chất từ trường ${escapeHtml(pInfo.field)}</div>
          <div class="ls-sec-content">${escapeHtml(extra.keywords || '')}</div>
        </div>
        <div class="ls-section-card">
          <div class="ls-sec-heading">🧭 Luận giải Đại Vận &amp; Lời khuyên Chấn Hóa</div>
          <div class="ls-sec-content">${escapeHtml(pInfo.advice || fInfo.cccdAdvice)}</div>
        </div>
        ${
          normPair.includes('0') && normPair !== '00'
            ? `<div class="ls-section-card story-card">
                <div class="ls-sec-heading">🔍 Gợi ý tra cứu thêm</div>
                <div class="ls-sec-content">Cặp số <strong>${escapeHtml(
                  normPair
                )}</strong> chứa số 0 (Phục vị 0 / Ẩn 0). Bạn cũng có thể xem nghiệm lý của số đảo <button type="button" class="pair-btn" data-open-pair="${escapeHtml(
                normPair.split('').reverse().join('')
              )}">Số ${escapeHtml(normPair.split('').reverse().join(''))}</button> hoặc số <button type="button" class="pair-btn" data-open-pair="00">Số 00</button>.</div>
              </div>`
            : ''
        }
      </div>
    `;
  }

  function renderLinhSoGrid(selectedPair) {
    const grid = document.getElementById('linhSoGrid100');
    const normSelected = String(selectedPair || '86').padStart(2, '0');
    const cells = [];

    for (let i = 0; i < 100; i++) {
      const p = String(i).padStart(2, '0');
      const pInfo = PAIRS_100[p] || { field: 'PHỤC VỊ' };
      const fInfo = EIGHT_FIELDS[pInfo.field] || { type: 'CÁT TINH' };

      if (currentLinhSoFilter !== 'ALL' && pInfo.field !== currentLinhSoFilter) {
        continue;
      }

      let cellCls = 'phuc-cell';
      if (pInfo.field === 'PHỤC VỊ') cellCls = 'phuc-cell';
      else if (fInfo.type === 'CÁT TINH') cellCls = 'cat-cell';
      else cellCls = 'hung-cell';

      if (p === normSelected) cellCls += ' active';

      cells.push(`
        <div class="num-cell-100 ${cellCls}" data-select-linh-so="${p}">
          <span class="nc-num">${p}</span>
          <span class="nc-sub">${escapeHtml(pInfo.field)}</span>
        </div>
      `);
    }

    grid.innerHTML = cells.join('');
    document.getElementById('linhSoDetailContainer').innerHTML = buildLinhSoDetailHTML(normSelected);
  }

  function openLinhSoModal(pair) {
    const normPair = String(pair || '86').replace(/\D/g, '').padStart(2, '0').slice(-2);
    currentModalPair = normPair;
    const modal = document.getElementById('modalLinhSo');
    document.getElementById('modalLinhSoTitle').textContent = `Nghiệm Lý Linh Số Bát Pháp – Cặp Số ${normPair}`;
    document.getElementById('modalLinhSoBody').innerHTML = buildLinhSoDetailHTML(normPair);
    modal.classList.add('open');
  }

  // ==================== RENDER TAB 3: 8 TỪ TRƯỜNG & BẢNG CHUYỂN HÓA ====================
  function renderEightFieldsAndTransformations() {
    const grid = document.getElementById('eightFieldsGrid');
    const order = [
      'THIÊN Y',
      'SINH KHÍ',
      'DIÊN NIÊN',
      'PHỤC VỊ',
      'LỤC SÁT',
      'TUYỆT MỆNH',
      'HỌA HẠI',
      'NGŨ QUỶ'
    ];

    grid.innerHTML = order
      .map((fName) => {
        const meta = FIELD_EXTRA[fName];
        const dbField = EIGHT_FIELDS[fName] || {};
        const typeBadge = meta.isCat ? 'badge-cat' : 'badge-hung';
        const cardCls = meta.isCat ? 'is-cat' : 'is-hung';

        const pairButtons = meta.pairs
          .map(
            (p) =>
              `<button type="button" class="pair-btn" data-open-pair="${p}" title="Xem nghiệm lý số ${p}">${p}</button>`
          )
          .join('');

        return `
          <div class="field-card ${cardCls}">
            <div class="fc-header">
              <div>
                <div class="fc-title">${escapeHtml(fName)}</div>
                <div class="fc-sub">${escapeHtml(meta.subtitle)}</div>
              </div>
              <span class="badge-nature ${typeBadge}">${meta.isCat ? 'CÁT TINH' : 'HUNG TINH'}</span>
            </div>
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:4px;">CÁC CẶP SỐ GỐC (Bấm để xem nghiệm lý):</div>
              <div class="fc-pairs">${pairButtons}</div>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);">
              <strong>Biến thể Ẩn 0:</strong> ${meta.an0.join(', ')}<br/>
              <strong>Biến thể Kích 5:</strong> ${meta.kich5.join(', ')}
            </div>
            <div class="fc-keywords">${escapeHtml(meta.keywords)}</div>
            <div style="font-size:12.5px;color:var(--text-secondary);border-top:1px dashed var(--border-color);padding-top:8px;">
              <strong>Khi vào Đại Vận CCCD:</strong> ${escapeHtml(dbField.cccdAdvice || '')}
            </div>
          </div>
        `;
      })
      .join('');

    renderTransformationsTable();
  }

  function renderTransformationsTable() {
    const f1Filter = document.getElementById('selTransField1').value.trim().toUpperCase();
    const natureFilter = document.getElementById('selTransNature').value.trim().toLowerCase();
    const keyword = document.getElementById('inpTransSearch').value.trim().toLowerCase();

    const filtered = TRANSFORMATIONS.filter((t) => {
      if (f1Filter && (t.fromField || '').toUpperCase() !== f1Filter && !(t.originTransform || '').toUpperCase().startsWith(f1Filter)) {
        return false;
      }
      if (natureFilter && (t.nature || '').trim().toLowerCase() !== natureFilter) {
        return false;
      }
      if (keyword) {
        const hay = `${t.originTransform} ${t.finalTransform} ${t.meaning} ${t.sourceDoc} ${t.shortSummary}`.toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      return true;
    });

    const tbody = document.getElementById('tbodyTransformations');
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#718096;">Không tìm thấy cách cục chuyển hóa phù hợp.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map((t, idx) => {
        const badgeCls = getNatureBadgeClass(t.nature);
        return `
          <tr>
            <td><strong>${idx + 1}</strong></td>
            <td><strong>${escapeHtml(t.originTransform || `${t.fromField} + ${t.toField}`)}</strong></td>
            <td><span style="font-weight:700;color:var(--primary-800);">${escapeHtml(t.finalTransform)}</span></td>
            <td><span class="badge-nature ${badgeCls}">${escapeHtml(t.nature)}</span></td>
            <td>
              <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(t.meaning)}</div>
              ${
                t.sourceDoc
                  ? `<div style="font-size:12.5px;color:var(--text-secondary);"><em>Tài liệu gốc:</em> ${escapeHtml(t.sourceDoc)}</div>`
                  : ''
              }
            </td>
          </tr>
        `;
      })
      .join('');
  }

  // ==================== RENDER TAB 4: BẢNG TRA 1000 SỐ (000-999) ====================
  function renderTable999() {
    const query = document.getElementById('inpSearch999').value.trim().toLowerCase();
    const natureFilter = document.getElementById('selNature999').value.trim().toLowerCase();
    const specialFilter = document.getElementById('selSpecial999').value;

    const allRows = Object.values(TABLE_999);
    const filtered = allRows.filter((r) => {
      if (natureFilter && (r.nature || '').trim().toLowerCase() !== natureFilter) {
        return false;
      }
      if (specialFilter === 'hidden0' && !(r.hidden0 === 'Có' || r.code.includes('0'))) {
        return false;
      }
      if (specialFilter === 'kich5' && !r.code.includes('5')) {
        return false;
      }
      if (query) {
        const hay = `${r.code} ${r.clusterName} ${r.combo12} ${r.meaning}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    document.getElementById('count999Bar').textContent = `Đang hiển thị ${filtered.length} / ${allRows.length} tổ hợp 3 số`;

    const tbody = document.getElementById('tbody999');
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#718096;">Không tìm thấy tổ hợp 3 số nào khớp điều kiện.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered
      .map((r) => {
        const badgeCls = getNatureBadgeClass(r.nature);
        const meaning = getFallbackMeaningFor3Digit(r);
        return `
          <tr>
            <td><span class="num-pill">${escapeHtml(r.code)}</span></td>
            <td>
              <button type="button" class="pair-btn" data-open-pair="${escapeHtml(r.p1)}">${escapeHtml(r.p1)}</button>
              <button type="button" class="pair-btn" data-open-pair="${escapeHtml(r.p2)}">${escapeHtml(r.p2)}</button>
            </td>
            <td style="font-size:13px;">${escapeHtml(r.combo12)}</td>
            <td><strong style="color:var(--primary-900);">${escapeHtml(r.clusterName)}</strong></td>
            <td><span class="badge-nature ${badgeCls}">${escapeHtml(r.nature)}</span></td>
            <td>${r.hidden0 === 'Có' ? '<span class="sub-tag an0">Có Ẩn 0</span>' : '—'}</td>
            <td>${escapeHtml(meaning)}</td>
          </tr>
        `;
      })
      .join('');
  }

  // ==================== EXPERT CONFIG & EXPORT (ZALO / PRINT) ====================
  function loadExpertInfo() {
    try {
      const saved = JSON.parse(localStorage.getItem('NLS_EXPERT_INFO') || 'null');
      if (saved && saved.name) return saved;
    } catch (e) {
      // ignore
    }
    return {
      name: 'Kim Hạ • Chiến Compass',
      phone: '0828.139.131',
      email: 'Kimha.thinhvuong@gmail.com'
    };
  }

  function applyExpertInfo(info) {
    document.getElementById('headerExpertName').textContent = info.name;
    document.getElementById('outExpertName').textContent = info.name;
    document.getElementById('outExpertPhone').textContent = info.phone || 'Đang cập nhật';
    document.getElementById('outExpertEmail').textContent = info.email || 'Đang cập nhật';
    document.getElementById('printExpertHeader').textContent = `${info.name} • SĐT: ${info.phone} • Email: ${info.email}`;
  }

  function buildZaloReportText() {
    if (!currentAnalysisState) return '';
    const st = currentAnalysisState;
    const expert = loadExpertInfo();

    const lines = [];
    lines.push('🧭 BÁO CÁO PHÂN TÍCH NĂNG LƯỢNG SỐ (SĐT & CCCD)');
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`👤 Họ tên: ${st.name}`);
    lines.push(`📱 Số điện thoại: ${st.normPhone}`);
    if (st.normCCCD) lines.push(`🪪 Số CCCD: ${st.normCCCD}`);
    if (st.years || st.job) {
      lines.push(`📌 Thông tin thêm: ${[st.years ? st.years + ' năm sử dụng' : '', st.job].filter(Boolean).join(' - ')}`);
    }
    lines.push('');
    lines.push('I. PHÂN TÍCH SĐT THEO TỔ HỢP 3 SỐ:');
    st.clusters3.forEach((c) => {
      lines.push(`• [${c.code}] ${c.fieldCluster} => ${c.nature}`);
      if (c.fullMeaning) {
        lines.push(`  ↳ ${c.fullMeaning.trim()}`);
      }
    });

    lines.push('');
    lines.push('II. PHÂN TÍCH SĐT THEO CẶP SỐ:');
    lines.push(
      st.pairs2.map((p) => `• ${p.pair}: ${p.field} (${p.type})`).join('\n')
    );

    if (st.normCCCD && st.cccdStages.length > 0) {
      lines.push('');
      lines.push('III. ĐẠI VẬN CĂN CƯỚC CÔNG DÂN (0–70 TUỔI):');
      st.cccdStages.forEach((c) => {
        lines.push(`• Tuổi ${c.age} [${c.pair}]: ${c.field} (${c.type})`);
      });
    }

    lines.push('');
    lines.push('IV. TỔNG KẾT ĐÁNH GIÁ SỐ ĐIỆN THOẠI:');
    const effSummary = st.effectiveSummaryCase || st.summaryCase;
    lines.push((effSummary.content || '').trim());
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━━━━━━');
    lines.push(`🌟 Chuyên gia tư vấn: ${expert.name}`);
    if (expert.phone) lines.push(`📞 SĐT/Zalo: ${expert.phone}`);
    if (expert.email) lines.push(`✉️ Email: ${expert.email}`);

    return lines.join('\n');
  }

  // ==================== INITIALIZATION & EVENT LISTENERS ====================
  function init() {
    // 1. Apply Expert Info
    const expert = loadExpertInfo();
    applyExpertInfo(expert);

    // 2. Initial renders
    renderAnalyzer();
    renderLinhSoGrid('86');
    renderEightFieldsAndTransformations();
    renderTable999();

    // 3. Tab Switching
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        document.querySelectorAll('.nav-tab').forEach((b) => {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
        });
        document.querySelectorAll('.tab-panel').forEach((panel) => {
          panel.classList.toggle('active', panel.id === targetId);
        });
      });
    });

    // 4. Analyzer Inputs Live Update
    ['inpName', 'inpPhone', 'inpCCCD', 'inpYears', 'inpJob'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
          renderAnalyzer();
        });
      }
    });

    document.getElementById('chkShowAllMeanings').addEventListener('change', renderAnalyzer);
    const selOverrideSummaryCase = document.getElementById('selOverrideSummaryCase');
    if (selOverrideSummaryCase) {
      selOverrideSummaryCase.addEventListener('change', renderAnalyzer);
    }

    // Presets
    document.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-preset');
        const p = PRESETS[key];
        if (!p) return;
        document.querySelectorAll('[data-preset]').forEach((b) => b.classList.toggle('active', b === btn));
        document.getElementById('inpName').value = p.name;
        document.getElementById('inpPhone').value = p.phone;
        document.getElementById('inpCCCD').value = p.cccd;
        document.getElementById('inpYears').value = p.years;
        document.getElementById('inpJob').value = p.job;
        renderAnalyzer();
        showToast(`Đã nạp dữ liệu mẫu: ${p.name}`);
      });
    });

    document.getElementById('btnClearInputs').addEventListener('click', () => {
      document.querySelectorAll('[data-preset]').forEach((b) => b.classList.remove('active'));
      document.getElementById('inpName').value = '';
      document.getElementById('inpPhone').value = '';
      document.getElementById('inpCCCD').value = '';
      document.getElementById('inpYears').value = '';
      document.getElementById('inpJob').value = '';
      document.getElementById('inpPhone').focus();
      renderAnalyzer();
    });

    // 5. Delegated click for opening Linh Số Bát Pháp modal or selecting in grid
    document.body.addEventListener('click', (e) => {
      const openPairBtn = e.target.closest('[data-open-pair]');
      if (openPairBtn) {
        const pair = openPairBtn.getAttribute('data-open-pair');
        if (pair && pair !== '--') {
          openLinhSoModal(pair);
        }
        return;
      }

      const selectCell = e.target.closest('[data-select-linh-so]');
      if (selectCell) {
        const pair = selectCell.getAttribute('data-select-linh-so');
        document.getElementById('inpLinhSoPair').value = pair;
        renderLinhSoGrid(pair);
      }
    });

    // 6. Linh Số Tab input & filters
    const inpLinhSoPair = document.getElementById('inpLinhSoPair');
    inpLinhSoPair.addEventListener('input', () => {
      const val = inpLinhSoPair.value.replace(/\D/g, '');
      if (val.length > 0) {
        renderLinhSoGrid(val.padStart(2, '0'));
      }
    });

    document.querySelectorAll('#linhSoFieldFilters .btn-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#linhSoFieldFilters .btn-filter').forEach((b) => b.classList.toggle('active', b === btn));
        currentLinhSoFilter = btn.getAttribute('data-field');
        renderLinhSoGrid(document.getElementById('inpLinhSoPair').value || '86');
      });
    });

    // 7. Tab 3 & Tab 4 Filters
    ['selTransField1', 'selTransNature', 'inpTransSearch'].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('input', renderTransformationsTable);
      el.addEventListener('change', renderTransformationsTable);
    });

    ['inpSearch999', 'selNature999', 'selSpecial999'].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('input', renderTable999);
      el.addEventListener('change', renderTable999);
    });

    // 8. Modals
    const closeLinhSoModal = () => document.getElementById('modalLinhSo').classList.remove('open');
    document.getElementById('btnCloseLinhSoModal').addEventListener('click', closeLinhSoModal);
    document.getElementById('btnCloseLinhSoModalFooter').addEventListener('click', closeLinhSoModal);
    document.getElementById('modalLinhSo').addEventListener('click', (e) => {
      if (e.target.id === 'modalLinhSo') closeLinhSoModal();
    });

    document.getElementById('btnSwitchToLinhSoTab').addEventListener('click', () => {
      closeLinhSoModal();
      const tabBtn = document.querySelector('.nav-tab[data-tab="tab-linh-so"]');
      if (tabBtn) tabBtn.click();
      document.getElementById('inpLinhSoPair').value = currentModalPair;
      currentLinhSoFilter = 'ALL';
      document.querySelectorAll('#linhSoFieldFilters .btn-filter').forEach((b, i) => b.classList.toggle('active', i === 0));
      renderLinhSoGrid(currentModalPair);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Expert Modal
    const openExpertModal = () => {
      const info = loadExpertInfo();
      document.getElementById('inpExpertName').value = info.name;
      document.getElementById('inpExpertPhone').value = info.phone;
      document.getElementById('inpExpertEmail').value = info.email;
      document.getElementById('modalExpert').classList.add('open');
    };
    const closeExpertModal = () => document.getElementById('modalExpert').classList.remove('open');

    document.getElementById('btnOpenExpertModal').addEventListener('click', openExpertModal);
    document.getElementById('btnEditExpertFooter').addEventListener('click', openExpertModal);
    document.getElementById('btnCloseExpertModal').addEventListener('click', closeExpertModal);
    document.getElementById('modalExpert').addEventListener('click', (e) => {
      if (e.target.id === 'modalExpert') closeExpertModal();
    });

    document.getElementById('btnExpertPresetKimHa').addEventListener('click', () => {
      document.getElementById('inpExpertName').value = 'Kim Hạ';
      document.getElementById('inpExpertPhone').value = '0828.139.131';
      document.getElementById('inpExpertEmail').value = 'Kimha.thinhvuong@gmail.com';
    });

    document.getElementById('btnExpertPresetChien').addEventListener('click', () => {
      document.getElementById('inpExpertName').value = 'Chiến Compass';
      document.getElementById('inpExpertPhone').value = '';
      document.getElementById('inpExpertEmail').value = '';
    });

    document.getElementById('btnSaveExpert').addEventListener('click', () => {
      const newInfo = {
        name: document.getElementById('inpExpertName').value.trim() || 'Chuyên gia Năng Lượng Số',
        phone: document.getElementById('inpExpertPhone').value.trim(),
        email: document.getElementById('inpExpertEmail').value.trim()
      };
      try {
        localStorage.setItem('NLS_EXPERT_INFO', JSON.stringify(newInfo));
      } catch (e) {
        // ignore
      }
      applyExpertInfo(newInfo);
      closeExpertModal();
      showToast('Đã cập nhật thông tin Chuyên gia!');
    });

    // 9. Copy Zalo & Print
    document.getElementById('btnCopyZalo').addEventListener('click', () => {
      const text = buildZaloReportText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          showToast('📋 Đã copy toàn bộ Báo cáo Phân tích để dán vào Zalo!');
        });
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('📋 Đã copy toàn bộ Báo cáo Phân tích!');
      }
    });

    document.getElementById('btnPrintReport').addEventListener('click', () => {
      window.print();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
