/**
 * Master Lucky Synthesizer Engine (Vận Số Cát Tường - Ma Trận Tổng Hợp Số May Mắn)
 * Tích hợp đa chiều: Phong Thủy Bát Tự + Thần Số Học + Chiêm Tinh Học + Năng Lượng Tarot.
 * Cập nhật chuẩn xác mỗi 0h GMT+7.
 */

(function(root, factory) {
    var exp = factory();
    if (typeof define === 'function' && define.amd) {
        define(['./lunar-calendar', './fengshui-engine', './numerology-engine', './tarot-astrology'], function() { return exp; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = exp;
    }
    if (typeof root !== 'undefined' && root) root.LuckySynthesizer = exp;
    if (typeof window !== 'undefined') window.LuckySynthesizer = exp;
    if (typeof globalThis !== 'undefined') globalThis.LuckySynthesizer = exp;
    if (typeof self !== 'undefined') self.LuckySynthesizer = exp;
}(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function() {
    'use strict';

    function getLunar() {
        if (typeof window !== 'undefined' && window.LunarCalendar) return window.LunarCalendar;
        if (typeof globalThis !== 'undefined' && globalThis.LunarCalendar) return globalThis.LunarCalendar;
        if (typeof require === 'function') {
            try { return require('./lunar-calendar'); } catch (e) {}
        }
        return null;
    }
    function getFengShui() {
        if (typeof window !== 'undefined' && window.FengShuiEngine) return window.FengShuiEngine;
        if (typeof globalThis !== 'undefined' && globalThis.FengShuiEngine) return globalThis.FengShuiEngine;
        if (typeof require === 'function') {
            try { return require('./fengshui-engine'); } catch (e) {}
        }
        return null;
    }
    function getNumerology() {
        if (typeof window !== 'undefined' && window.NumerologyEngine) return window.NumerologyEngine;
        if (typeof globalThis !== 'undefined' && globalThis.NumerologyEngine) return globalThis.NumerologyEngine;
        if (typeof require === 'function') {
            try { return require('./numerology-engine'); } catch (e) {}
        }
        return null;
    }
    function getTarotAstro() {
        if (typeof window !== 'undefined' && window.TarotAstrologyEngine) return window.TarotAstrologyEngine;
        if (typeof globalThis !== 'undefined' && globalThis.TarotAstrologyEngine) return globalThis.TarotAstrologyEngine;
        if (typeof require === 'function') {
            try { return require('./tarot-astrology'); } catch (e) {}
        }
        return null;
    }

    // Ý nghĩa các con số phong thủy và cát tường truyền thống
    const AUSPICIOUS_PAIRS = {
        '68': { title: 'Lộc Phát Toàn Diện', meaning: 'Khai thông tài lộ, dòng tiền sinh sôi nảy nở.' },
        '86': { title: 'Phát Lộc Thịnh Vượng', meaning: 'Thu hút cơ hội đầu tư, gặt hái thành quả vững chắc.' },
        '79': { title: 'Đại Thần Tài', meaning: 'Phù trợ của cải bất ngờ, vận may kinh doanh vượt bậc.' },
        '39': { title: 'Tiểu Thần Tài', meaning: 'Thu hút lộc nhỏ đều đặn, quý nhân giúp đỡ chuyện tiền bạc.' },
        '88': { title: 'Song Phát Vô Hạn', meaning: 'Năng lượng kép của sự thịnh vượng, quyền uy và thăng tiến.' },
        '99': { title: 'Trường Cửu Viên Mãn', meaning: 'Thành tựu bền lâu, đỉnh cao danh vọng và phước đức tròn đầy.' },
        '36': { title: 'Tài Lộc Hài Hòa', meaning: 'Ý tưởng sinh ra tiền tài, giao tiếp gặp gỡ quý nhân.' },
        '63': { title: 'Lộc Tài Sung Túc', meaning: 'Tài chính ổn định, công việc hanh thông thuận lợi.' },
        '18': { title: 'Nhất Phát Sinh Sôi', meaning: 'Khởi đầu rực rỡ, phát triển nhanh chóng và vững vàng.' },
        '81': { title: 'Đỉnh Cao Khởi Sắc', meaning: 'Vạn sự khởi đầu hanh thông, danh lợi vẹn toàn.' },
        '28': { title: 'Mãi Phát Trường Tồn', meaning: 'Hợp tác phát tài, các mối quan hệ đem lại lợi ích lớn.' },
        '82': { title: 'Phát Đạt Song Hành', meaning: 'Sự nghiệp và tình cảm cùng lúc thăng hoa.' },
        '26': { title: 'Mãi Lộc Hạnh Phúc', meaning: 'Gia đạo bình an, tiền bạc tích lũy êm ấm.' },
        '62': { title: 'Lộc Bền Vững', meaning: 'Dòng tiền ổn định, giảm thiểu tối đa hao hụt.' },
        '58': { title: 'Phúc Lộc Sinh Tài', meaning: 'Phúc khí chuyển hóa thành của cải, đổi mới thành công.' },
        '85': { title: 'Phát Vinh Hiển', meaning: 'Đột phá ngoạn mục, tạo dấu ấn cá nhân mạnh mẽ.' },
        '09': { title: 'Cực Đại Hưng Vượng', meaning: 'Hoàn hảo từ gốc rễ, đón nhận phước lành cao quý.' },
        '90': { title: 'Trường Thọ Vững Bền', meaning: 'Sức khỏe dồi dào, phúc lộc tích tụ lâu dài.' }
    };

    /**
     * Thuật toán sinh giả ngẫu nhiên có hạt giống (Deterministic PRNG)
     * Đảm bảo cùng ngày + năm sinh sẽ cho kết quả 100% nhất quán trong ngày đó.
     */
    function seedRandom(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    /**
     * Tính toán và tổng hợp toàn diện vận số trong ngày
     * @param {number|string} birthYear Năm sinh (e.g. 1990)
     * @param {object} dateInfo Thông tin ngày (hoặc mặc định ngày hôm nay GMT+7)
     * @param {string} gender 'all' | 'male' | 'female'
     */
    function synthesizeDailyLuck(birthYear, dateInfo = null, gender = 'all') {
        const year = parseInt(birthYear, 10);
        if (isNaN(year) || year < 1900 || year > 2100) {
            throw new Error('Năm sinh không hợp lệ (hỗ trợ từ 1900 - 2100).');
        }

        const lunar = getLunar();
        const fengshuiEngine = getFengShui();
        const numEngine = getNumerology();
        const tarotEngine = getTarotAstro();

        const missing = [];
        if (!lunar) missing.push('LunarCalendar');
        if (!fengshuiEngine) missing.push('FengShuiEngine');
        if (!numEngine) missing.push('NumerologyEngine');
        if (!tarotEngine) missing.push('TarotAstrologyEngine');
        if (missing.length > 0) {
            throw new Error('Chưa nạp được: ' + missing.join(', '));
        }

        // 1. Xác định thông tin ngày GMT+7
        let current;
        if (dateInfo && dateInfo.day && dateInfo.month && dateInfo.year) {
            const d = parseInt(dateInfo.day, 10);
            const m = parseInt(dateInfo.month, 10);
            const y = parseInt(dateInfo.year, 10);
            current = {
                day: d,
                month: m,
                year: y,
                dateObj: new Date(y, m - 1, d, 12, 0, 0),
                dateKey: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            };
        } else {
            current = lunar.getGMT7CurrentDate();
        }

        // 2. Phân tích Phong Thủy & Bát Tự
        const dayCanChi = lunar.getDayCanChi(current.day, current.month, current.year);
        const fengShui = fengshuiEngine.analyzeFengShui(year, dayCanChi);

        // 3. Phân tích Thần Số Học
        const numerology = numEngine.analyzeNumerology(year, current.day, current.month, current.year);

        // 4. Phân tích Chiêm Tinh & Tarot
        const tarotAstro = tarotEngine.analyzeTarotAndAstrology(
            year,
            current.dateObj,
            current.day,
            current.month,
            current.year
        );

        // 5. Tổng hợp Trọng Số và Tạo Bộ Số May Mắn
        const candidateMap = new Map();

        function addScore(num, score, source) {
            const n = parseInt(num, 10);
            if (isNaN(n) || n < 0 || n > 99) return;
            const strNum = String(n).padStart(2, '0');
            
            if (!candidateMap.has(strNum)) {
                candidateMap.set(strNum, {
                    number: strNum,
                    rawVal: n,
                    score: 0,
                    sources: []
                });
            }
            const item = candidateMap.get(strNum);
            item.score += score;
            if (!item.sources.includes(source)) {
                item.sources.push(source);
            }
        }

        // Điểm từ Phong thủy cơ bản
        fengShui.baseLuckyNumbers.forEach(n => {
            addScore(n, 30, 'Ngũ Hành Bản Mệnh');
            // Cặp số 2 chữ số tương ứng
            addScore(n * 10 + n, 25, 'Cát Tinh Song Hành');
            addScore(n * 10 + 8, 20, 'Lục Hợp Tài Số');
            addScore(n * 10 + 9, 20, 'Trường Cửu Tài Số');
        });

        // Điểm từ Ngũ hành ngày tương sinh
        fengShui.supportLuckyNumbers.forEach(n => {
            addScore(n, 25, 'Ngũ Hành Tương Sinh');
            addScore(n * 10 + 6, 20, 'Lộc Phát Bổ Trợ');
        });

        // Điểm từ Cung Phi Nam / Nữ
        addScore(fengShui.cungPhi.male.quaiSo, 28, 'Cung Phi Nam (Quái Số)');
        addScore(fengShui.cungPhi.female.quaiSo, 28, 'Cung Phi Nữ (Quái Số)');
        addScore(fengShui.cungPhi.male.quaiSo * 10 + fengShui.cungPhi.female.quaiSo, 22, 'Âm Dương Hòa Hợp');
        addScore(fengShui.cungPhi.female.quaiSo * 10 + fengShui.cungPhi.male.quaiSo, 22, 'Giao Thoa Cung Mạng');

        // Điểm từ Thần Số Học
        addScore(numerology.personalDay, 35, 'Chỉ Số Ngày Cá Nhân');
        addScore(numerology.universalDay, 25, 'Universal Day');
        numerology.resonanceNumbers.forEach(n => {
            addScore(n, 20, 'Cộng Hưởng Thần Số');
        });

        // Điểm từ Chiêm Tinh Học
        tarotAstro.astrologyNumbers.forEach(n => {
            addScore(n, 22, 'Hành Tinh Chủ Quản');
        });

        // Điểm từ Tarot
        tarotAstro.tarotNumbers.forEach(n => {
            addScore(n, 20, 'Lá Bài Tarot Hộ Mệnh');
        });
        addScore(tarotAstro.tarotCard.number, 18, 'Ẩn Số Tarot');

        // Điểm từ các cặp số Đại Cát truyền thống
        Object.keys(AUSPICIOUS_PAIRS).forEach(pair => {
            const d1 = parseInt(pair[0], 10);
            const d2 = parseInt(pair[1], 10);
            if (
                fengShui.allLuckyNumbers.includes(d1) ||
                fengShui.allLuckyNumbers.includes(d2) ||
                d1 === numerology.personalDay ||
                d2 === numerology.personalDay
            ) {
                addScore(parseInt(pair, 10), 18, 'Cát Tinh Dân Gian');
            }
        });

        // Hạt giống điều biến nhẹ theo ngày và năm để tạo độ phong phú và nhịp điệu tự nhiên
        const daySeed = year * 10000 + current.month * 100 + current.day;
        candidateMap.forEach((item, key) => {
            const noise = Math.floor(seedRandom(daySeed + item.rawVal * 31) * 15);
            item.score += noise;
        });

        // Sắp xếp các ứng viên theo điểm số giảm dần
        const sortedCandidates = Array.from(candidateMap.values())
            .sort((a, b) => b.score - a.score);

        // Lấy Top 3 con số độc nhất (tránh trùng lặp rawVal)
        const top3List = [];
        const seenValues = new Set();

        for (const cand of sortedCandidates) {
            if (!seenValues.has(cand.number)) {
                seenValues.add(cand.number);
                
                let title = 'Số May Mắn';
                let category = 'Hanh Thông';
                let explanation = '';

                if (top3List.length === 0) {
                    title = 'Số Đại Cát (Ngôi Sao May Mắn Nhất)';
                    category = 'Tài Lộc Cực Đại';
                } else if (top3List.length === 1) {
                    title = 'Số Thịnh Vượng & Sinh Tài';
                    category = 'Kinh Doanh & Tiền Bạc';
                } else if (top3List.length === 2) {
                    title = 'Số Quý Nhân & Hòa Hợp';
                    category = 'Quan Hệ & Cơ Hội';
                }

                const pairInfo = AUSPICIOUS_PAIRS[cand.number];
                if (pairInfo) {
                    explanation = `${pairInfo.title}: ${pairInfo.meaning}`;
                } else {
                    explanation = `Mang tần số rung động mạnh mẽ kết hợp giữa ${cand.sources.slice(0, 2).join(' và ')}.`;
                }

                // Tính % năng lượng (chuẩn hóa 85% - 99%)
                const energyPercent = Math.min(99, Math.max(85, 88 + Math.floor((cand.score % 12))));

                top3List.push({
                    rank: top3List.length + 1,
                    number: cand.number,
                    rawNumber: cand.rawVal,
                    title,
                    category,
                    energyPercent,
                    explanation,
                    sources: cand.sources
                });

                if (top3List.length >= 3) break;
            }
        }

        // 6. Phân tích Chuyên Sâu cho Con Số #1 Đại Cát Nhất
        const starNumber = top3List[0];
        const deepStarAnalysis = generateDeepStarExplanation(
            starNumber,
            year,
            fengShui,
            numerology,
            tarotAstro,
            dayCanChi,
            current
        );

        // 7. Phân tích Chuyên Biệt Giới Tính Nam / Nữ
        const genderAnalysis = generateGenderDeepDive(
            year,
            gender,
            fengShui,
            numerology,
            dayCanChi,
            tarotAstro
        );

        // 8. Khung Giờ Cát Lành & Lời Khuyên Hành Động
        const auspiciousHours = formatAuspiciousHours(dayCanChi.hoangDaoHours);

        return {
            query: {
                birthYear: year,
                gender,
                date: current.dateKey,
                day: current.day,
                month: current.month,
                year: current.year,
                refreshedAtGMT7: '00:00:00 (GMT+7 Mỗi Ngày)'
            },
            summary: {
                starNumber: starNumber.number,
                starTitle: starNumber.title,
                starCategory: starNumber.category,
                starEnergyPercent: starNumber.energyPercent,
                starExplanation: starNumber.explanation,
                deepStarRationale: deepStarAnalysis
            },
            top3Numbers: top3List,
            fengShuiAnalysis: {
                yearInfo: fengShui.yearInfo,
                dayInfo: dayCanChi,
                elementRelation: fengShui.elementRel,
                chiRelation: fengShui.chiRel,
                cungPhi: fengShui.cungPhi,
                colors: fengShui.colors,
                luckyDirections: fengShui.cungPhi.male.huongCat
            },
            numerologyAnalysis: {
                universalDay: numerology.universalDay,
                universalInfo: numerology.universalInfo,
                personalDay: numerology.personalDay,
                personalYear: numerology.personalYear,
                personalInfo: numerology.personalInfo,
                resonanceNumbers: numerology.resonanceNumbers
            },
            astrologyAnalysis: {
                planet: tarotAstro.planet,
                luckyNumbers: tarotAstro.astrologyNumbers
            },
            tarotAnalysis: {
                card: tarotAstro.tarotCard,
                luckyNumbers: tarotAstro.tarotNumbers
            },
            genderAnalysis,
            auspiciousHours
        };
    }

    /**
     * Tạo luận giải chuyên sâu cho con số #1 Đại Cát Nhất
     */
    function generateDeepStarExplanation(star, birthYear, fengShui, numerology, tarotAstro, dayCanChi, current) {
        const num = star.number;
        const yearName = fengShui.yearInfo.fullName;
        const yearElement = fengShui.yearInfo.element;
        const dayName = dayCanChi.fullName;
        const dayElement = dayCanChi.element;
        const planetName = tarotAstro.planet.name;
        const cardName = tarotAstro.tarotCard.vietnameseName;
        const pDay = numerology.personalDay;

        return {
            highlight: `Con số ${num} được Hội đồng Cát tinh tuyển chọn là "Ngôi Sao Đại Cát Nhất" trong ngày ${current.day}/${current.month}/${current.year} cho người sinh năm ${birthYear} (${yearName} - Mệnh ${fengShui.yearInfo.napAm}).`,
            reasons: [
                {
                    domain: '🔮 Phong Thủy & Bát Tự',
                    content: `Số ${num} tương hợp tuyệt đối với tương quan ${yearElement} và ${dayElement} của ngày ${dayName}. Năng lượng của số này giúp dung hòa sinh khí, chuyển hóa áp lực thành động lực và mở rộng cung Tài Bạch.`
                },
                {
                    domain: '🔢 Thần Số Học (Numerology)',
                    content: `Trùng khớp với tần số rung động Ngày Cá Nhân số ${pDay} và Universal Day ${numerology.universalDay}. Số ${num} kích hoạt đỉnh cao của sự sáng tạo, thu hút cơ hội đột phá và đưa các quyết định tài chính đi đúng hướng.`
                },
                {
                    domain: '🪐 Chiêm Tinh Học & Tinh Tú',
                    content: `Chịu sự bảo bọc trực tiếp từ ${planetName}. Năng lượng vũ trụ hôm nay khuếch đại uy lực của số ${num}, mang lại phong thái tự tin, khả năng thuyết phục vượt trội và hào quang thu hút quý nhân.`
                },
                {
                    domain: '🃏 Thông Điệp Tarot Ngày',
                    content: `Được chỉ dẫn bởi lá bài ẩn chính "${cardName}". Con số ${num} đại diện cho bước ngoặt cát lành, nhắc nhở bạn tự tin hành động để biến mục tiêu thành kết quả rực rỡ.`
                }
            ],
            bestUsage: `Nên ứng dụng số ${num} vào: chọn giờ làm việc/giao dịch (ví dụ phút thứ ${num} hoặc các khung giờ tương hợp), số thứ tự may mắn, quyết định quan trọng trong ngày hoặc làm số hộ mệnh tinh thần.`
        };
    }

    /**
     * Phân tích chi tiết dành riêng cho Nam và Nữ
     */
    function generateGenderDeepDive(birthYear, selectedGender, fengShui, numerology, dayCanChi, tarotAstro) {
        const maleCung = fengShui.cungPhi.male;
        const femaleCung = fengShui.cungPhi.female;

        const male = {
            genderTitle: 'Dành Cho Nam Giới',
            cungPhi: `${maleCung.cung} (${maleCung.element})`,
            quaiSo: maleCung.quaiSo,
            energyTrend: 'Quyết đoán, Tiên phong, Bứt phá công danh & Mở rộng kinh doanh',
            luckyFocus: `Nam tuổi ${fengShui.yearInfo.fullName} hôm nay nên tập trung vào các quyết định đầu tư, thương thảo hợp đồng lớn hoặc dẫn dắt đội ngũ. Quái số ${maleCung.quaiSo} mang lại sự dũng mãnh và tầm nhìn chiến lược.`,
            recommendedDirections: maleCung.huongCat,
            specialNumbers: [maleCung.quaiSo, (maleCung.quaiSo * 10 + 8) % 100, (maleCung.quaiSo * 11) % 100],
            advice: 'Giữ vững sự điềm tĩnh và quyết đoán. Đừng ngại nhận trách nhiệm lớn vì cát tinh đang soi chiếu cung sự nghiệp.'
        };

        const female = {
            genderTitle: 'Dành Cho Nữ Giới',
            cungPhi: `${femaleCung.cung} (${femaleCung.element})`,
            quaiSo: femaleCung.quaiSo,
            energyTrend: 'Trực giác thấu suốt, Tài chính thông minh, Bình an & Tình cảm viên mãn',
            luckyFocus: `Nữ tuổi ${fengShui.yearInfo.fullName} hôm nay sở hữu trực giác tài chính cực kỳ nhạy bén. Quái số ${femaleCung.quaiSo} hỗ trợ quản lý dòng tiền khéo léo, củng cố sự hòa hợp trong quan hệ gia đình và đối tác.`,
            recommendedDirections: femaleCung.huongCat,
            specialNumbers: [femaleCung.quaiSo, (femaleCung.quaiSo * 10 + 6) % 100, (femaleCung.quaiSo * 11) % 100],
            advice: 'Lắng nghe trực giác bên trong. Sự dịu dàng và tinh tế sẽ là chìa khóa mở ra những cánh cửa tài lộc bất ngờ.'
        };

        return {
            selectedGender,
            male,
            female,
            comparisonSummary: `Cùng sinh năm ${birthYear} nhưng Nam thuộc Cung ${maleCung.cung} (Quái số ${maleCung.quaiSo}) còn Nữ thuộc Cung ${femaleCung.cung} (Quái số ${femaleCung.quaiSo}). Do đó, Nam có xu hướng đại lợi ở các con số mang tính dương cương, hành động; trong khi Nữ phát huy tối đa vận may từ các con số hòa hợp, bảo toàn và sinh sôi tài lộc.`
        };
    }

    /**
     * Định dạng danh sách giờ Hoàng Đạo kèm gợi ý hành động
     */
    function formatAuspiciousHours(hoursList) {
        const actionSuggestions = [
            'Rất tốt để xuất hành, gặp gỡ đối tác, ký hợp đồng',
            'Thích hợp nộp hồ sơ, bắt đầu công việc quan trọng, khai trương',
            'Thời điểm vàng để cầu tài lộc, giao dịch chuyển khoản, đầu tư',
            'Tốt cho việc thảo luận, thương lượng, giải quyết vướng mắc',
            'Thích hợp làm việc thiện, tĩnh tâm, lên kế hoạch chiến lược',
            'Thời khắc thuận lợi để kết nối tình cảm, gia đạo êm ấm'
        ];

        return hoursList.map((hr, idx) => ({
            timeFrame: hr,
            isAuspicious: true,
            suggestion: actionSuggestions[idx % actionSuggestions.length]
        }));
    }

    return {
        AUSPICIOUS_PAIRS,
        synthesizeDailyLuck,
        generateDeepStarExplanation,
        generateGenderDeepDive,
        formatAuspiciousHours
    };
}));
