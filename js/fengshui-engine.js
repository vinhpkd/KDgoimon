/**
 * Feng Shui & Eastern Metaphysics Engine (Bát Tự, Bát Trạch, Cung Phi Nam/Nữ)
 * Phân tích chuyên sâu tương quan Ngũ Hành, Tam Hợp, Lục Hợp, Cung Mạng Nam/Nữ và Sinh Khắc.
 */

(function(root, factory) {
    var exp = factory();
    if (typeof define === 'function' && define.amd) {
        define(['./lunar-calendar'], function() { return exp; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = exp;
    }
    if (typeof root !== 'undefined' && root) root.FengShuiEngine = exp;
    if (typeof window !== 'undefined') window.FengShuiEngine = exp;
    if (typeof globalThis !== 'undefined') globalThis.FengShuiEngine = exp;
    if (typeof self !== 'undefined') self.FengShuiEngine = exp;
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

    // Ngũ Hành Sinh & Khắc
    const SINH_CYCLE = {
        'Mộc': 'Hỏa',
        'Hỏa': 'Thổ',
        'Thổ': 'Kim',
        'Kim': 'Thủy',
        'Thủy': 'Mộc'
    };

    const KHAC_CYCLE = {
        'Mộc': 'Thổ',
        'Thổ': 'Thủy',
        'Thủy': 'Hỏa',
        'Hỏa': 'Kim',
        'Kim': 'Mộc'
    };

    const SINH_ME_CYCLE = {
        'Hỏa': 'Mộc',
        'Thổ': 'Hỏa',
        'Kim': 'Thổ',
        'Thủy': 'Kim',
        'Mộc': 'Thủy'
    };

    // Số may mắn cơ bản theo Ngũ Hành
    const NGU_HANH_NUMBERS = {
        'Thủy': [1, 6],
        'Hỏa': [2, 7],
        'Mộc': [3, 8],
        'Kim': [4, 9],
        'Thổ': [0, 5]
    };

    // Màu sắc theo Ngũ Hành
    const NGU_HANH_COLORS = {
        'Kim': { main: 'Trắng, Ánh Kim, Bạc, Vàng nhạt', avoid: 'Đỏ, Hồng, Tím' },
        'Mộc': { main: 'Xanh lục, Xanh lá cây, Xanh ngọc', avoid: 'Trắng, Ánh bạc, Xám kim' },
        'Thủy': { main: 'Đen, Xanh dương, Xanh nước biển', avoid: 'Vàng đất, Nâu đất' },
        'Hỏa': { main: 'Đỏ, Hồng, Cam, Tím', avoid: 'Đen, Xanh nước biển' },
        'Thổ': { main: 'Vàng, Nâu đất, Cam đất', avoid: 'Xanh lục, Xanh lá cây' }
    };

    // Cung Phi Bát Trạch & Quái Số
    const CUNG_PHI_INFO = {
        1: { name: 'Khảm', element: 'Thủy', quaiSo: 1, huongCat: 'Đông Nam (Sinh Khí), Đông (Thiên Y), Nam (Diên Niên), Bắc (Phục Vị)' },
        2: { name: 'Khôn', element: 'Thổ', quaiSo: 2, huongCat: 'Đông Bắc (Sinh Khí), Tây (Thiên Y), Tây Bắc (Diên Niên), Tây Nam (Phục Vị)' },
        3: { name: 'Chấn', element: 'Mộc', quaiSo: 3, huongCat: 'Nam (Sinh Khí), Bắc (Thiên Y), Đông Nam (Diên Niên), Đông (Phục Vị)' },
        4: { name: 'Tốn', element: 'Mộc', quaiSo: 4, huongCat: 'Bắc (Sinh Khí), Nam (Thiên Y), Đông (Diên Niên), Đông Nam (Phục Vị)' },
        5: { name: 'Khôn (Nam) / Cấn (Nữ)', element: 'Thổ', quaiSo: 5, huongCat: 'Tây Nam / Đông Bắc' },
        6: { name: 'Càn', element: 'Kim', quaiSo: 6, huongCat: 'Tây (Sinh Khí), Đông Bắc (Thiên Y), Tây Nam (Diên Niên), Tây Bắc (Phục Vị)' },
        7: { name: 'Đoài', element: 'Kim', quaiSo: 7, huongCat: 'Tây Bắc (Sinh Khí), Tây Nam (Thiên Y), Đông Bắc (Diên Niên), Tây (Phục Vị)' },
        8: { name: 'Cấn', element: 'Thổ', quaiSo: 8, huongCat: 'Tây Nam (Sinh Khí), Tây Bắc (Thiên Y), Tây (Diên Niên), Đông Bắc (Phục Vị)' },
        9: { name: 'Ly', element: 'Hỏa', quaiSo: 9, huongCat: 'Đông (Sinh Khí), Đông Nam (Thiên Y), Bắc (Diên Niên), Nam (Phục Vị)' }
    };

    // Tam Hợp & Lục Hợp
    const TAM_HOP = {
        'Thân': ['Tý', 'Thìn'], 'Tý': ['Thân', 'Thìn'], 'Thìn': ['Thân', 'Tý'],
        'Dần': ['Ngọ', 'Tuất'], 'Ngọ': ['Dần', 'Tuất'], 'Tuất': ['Dần', 'Ngọ'],
        'Tỵ': ['Dậu', 'Sửu'], 'Dậu': ['Tỵ', 'Sửu'], 'Sửu': ['Tỵ', 'Dậu'],
        'Hợi': ['Mão', 'Mùi'], 'Mão': ['Hợi', 'Mùi'], 'Mùi': ['Hợi', 'Mão']
    };

    const LUC_HOP = {
        'Tý': 'Sửu', 'Sửu': 'Tý',
        'Dần': 'Hợi', 'Hợi': 'Dần',
        'Mão': 'Tuất', 'Tuất': 'Mão',
        'Thìn': 'Dậu', 'Dậu': 'Thìn',
        'Tỵ': 'Thân', 'Thân': 'Tỵ',
        'Ngọ': 'Mùi', 'Mùi': 'Ngọ'
    };

    const LUC_XUNG = {
        'Tý': 'Ngọ', 'Ngọ': 'Tý',
        'Sửu': 'Mùi', 'Mùi': 'Sửu',
        'Dần': 'Thân', 'Thân': 'Dần',
        'Mão': 'Dậu', 'Dậu': 'Mão',
        'Thìn': 'Tuất', 'Tuất': 'Thìn',
        'Tỵ': 'Hợi', 'Hợi': 'Tỵ'
    };

    /**
     * Tính tổng các chữ số của năm sinh đến khi còn 1 chữ số
     */
    function sumDigits(num) {
        let sum = 0;
        let str = String(num);
        for (let ch of str) {
            sum += parseInt(ch, 10);
        }
        while (sum >= 10) {
            let tmp = 0;
            for (let ch of String(sum)) {
                tmp += parseInt(ch, 10);
            }
            sum = tmp;
        }
        return sum;
    }

    /**
     * Tính Cung Phi Bát Trạch & Quái Số cho Nam và Nữ
     */
    function calculateCungPhi(year) {
        const y = parseInt(year, 10);
        const lastTwo = y % 100;
        let sum = (Math.floor(lastTwo / 10) + (lastTwo % 10));
        while (sum >= 10) {
            sum = Math.floor(sum / 10) + (sum % 10);
        }

        let maleNumber, femaleNumber;
        if (y < 2000) {
            // Sinh trước năm 2000: Nam = 10 - sum; Nữ = sum + 5
            maleNumber = 10 - sum;
            femaleNumber = sum + 5;
        } else {
            // Sinh từ năm 2000: Nam = 9 - sum; Nữ = sum + 6
            maleNumber = 9 - sum;
            if (maleNumber <= 0) maleNumber += 9;
            femaleNumber = sum + 6;
        }

        while (femaleNumber > 9) {
            femaleNumber -= 9;
        }
        while (maleNumber > 9) {
            maleNumber -= 9;
        }
        if (maleNumber <= 0) maleNumber = 9;
        if (femaleNumber <= 0) femaleNumber = 9;

        // Nếu Nam ra 5 -> Cung Khôn (2); Nữ ra 5 -> Cung Cấn (8)
        let maleCungIndex = maleNumber === 5 ? 2 : maleNumber;
        let femaleCungIndex = femaleNumber === 5 ? 8 : femaleNumber;

        const maleInfo = CUNG_PHI_INFO[maleCungIndex];
        const femaleInfo = CUNG_PHI_INFO[femaleCungIndex];

        return {
            male: {
                cung: maleInfo.name,
                element: maleInfo.element,
                quaiSo: maleInfo.quaiSo,
                huongCat: maleInfo.huongCat,
                luckyNumbers: NGU_HANH_NUMBERS[maleInfo.element] || [1, 6]
            },
            female: {
                cung: femaleInfo.name,
                element: femaleInfo.element,
                quaiSo: femaleInfo.quaiSo,
                huongCat: femaleInfo.huongCat,
                luckyNumbers: NGU_HANH_NUMBERS[femaleInfo.element] || [2, 8]
            }
        };
    }

    /**
     * Phân tích tương quan Ngũ Hành giữa Ngày và Mệnh Năm Sinh
     */
    function analyzeElementRelationship(personElement, dayElement) {
        if (personElement === dayElement) {
            return {
                type: 'TỶ HÒA',
                score: 85,
                relationText: `Bình hòa (${personElement} với ${dayElement})`,
                interpretation: `Năng lượng ngày cùng hành ${personElement} với bản mệnh, tạo sự ổn định, cân bằng tâm trí, tiến trình công việc diễn ra thuận buồm xuôi gió.`
            };
        } else if (SINH_CYCLE[dayElement] === personElement) {
            return {
                type: 'SINH NHẬP (ĐẠI CÁT)',
                score: 100,
                relationText: `Ngày ${dayElement} tương sinh Mệnh ${personElement}`,
                interpretation: `Năng lượng ngày nuôi dưỡng và tiếp thêm sinh khí cực mạnh cho bản mệnh. Đây là ngày Đại Cát, có quý nhân phù trợ, cầu tài đắc tài, khai mở vận may rực rỡ.`
            };
        } else if (SINH_CYCLE[personElement] === dayElement) {
            return {
                type: 'SINH XUẤT',
                score: 75,
                relationText: `Mệnh ${personElement} sinh Ngày ${dayElement}`,
                interpretation: `Bản mệnh xuất hao năng lượng để tạo dựng thành quả. Hôm nay là ngày bạn cần cống hiến, giúp đỡ người khác hoặc chi tiêu đầu tư để gặt hái phúc đức về sau.`
            };
        } else if (KHAC_CYCLE[personElement] === dayElement) {
            return {
                type: 'KHẮC XUẤT (CÁT)',
                score: 80,
                relationText: `Mệnh ${personElement} khắc chế Ngày ${dayElement}`,
                interpretation: `Bản mệnh làm chủ hoàn cảnh, nắm quyền kiểm soát tài lộc và công việc. Bạn dễ dàng vượt qua trở ngại để giành phần thắng về mình.`
            };
        } else {
            return {
                type: 'KHẮC NHẬP (CẨN TRỌNG)',
                score: 60,
                relationText: `Ngày ${dayElement} khắc Mệnh ${personElement}`,
                interpretation: `Năng lượng ngày tạo ra thử thách và áp lực. Bạn nên hành sự cẩn trọng, dĩ hòa vi quý, không nên vội vàng mạo hiểm, chú trọng bảo toàn tài sản.`
            };
        }
    }

    /**
     * Phân tích tương quan Địa Chi giữa Chi Ngày và Chi Năm
     */
    function analyzeChiRelationship(personChi, dayChi) {
        if (personChi === dayChi) {
            return { type: 'ĐỒNG CHI', isLucky: true, desc: `Ngày Trực Thái Tuế (cùng tuổi ${personChi}), năng lượng cá nhân tăng cao.` };
        }
        if (TAM_HOP[personChi] && TAM_HOP[personChi].includes(dayChi)) {
            return { type: 'TAM HỢP', isLucky: true, desc: `Tuổi ${personChi} gặp ngày ${dayChi} nằm trong cục Tam Hợp đại cát, tài vận hanh thông, quý nhân nâng đỡ.` };
        }
        if (LUC_HOP[personChi] === dayChi) {
            return { type: 'LỤC HỢP', isLucky: true, desc: `Tuổi ${personChi} gặp ngày ${dayChi} đạt thế Lục Hợp hoàn hảo, muôn sự thuận hòa, dễ có tin vui bất ngờ.` };
        }
        if (LUC_XUNG[personChi] === dayChi) {
            return { type: 'LỤC XUNG', isLucky: false, desc: `Tuổi ${personChi} xung khắc với ngày ${dayChi}, cần điềm đạm, tránh tranh chấp khẩu thiệt, cẩn thận đi lại.` };
        }
        return { type: 'BÌNH HÒA', isLucky: true, desc: `Chi ngày ${dayChi} và năm sinh ${personChi} bình hòa, vận trình êm ả thuận lợi.` };
    }

    /**
     * Tổng hợp phân tích Phong Thủy đầy đủ
     */
    function analyzeFengShui(year, dayCanChi) {
        const lunar = getLunar();
        const yearInfo = lunar.getYearCanChi(year);
        const cungPhi = calculateCungPhi(year);
        const elementRel = analyzeElementRelationship(yearInfo.element, dayCanChi.element);
        const chiRel = analyzeChiRelationship(yearInfo.chi, dayCanChi.chi);

        // Số hợp mệnh cơ bản
        const baseLuckyNumbers = NGU_HANH_NUMBERS[yearInfo.element] || [0, 5];
        // Số tương sinh bổ trợ
        const sinhElement = SINH_ME_CYCLE[yearInfo.element];
        const supportLuckyNumbers = NGU_HANH_NUMBERS[sinhElement] || [1, 6];

        const colors = NGU_HANH_COLORS[yearInfo.element] || NGU_HANH_COLORS['Thổ'];

        return {
            yearInfo,
            dayCanChi,
            cungPhi,
            elementRel,
            chiRel,
            baseLuckyNumbers,
            supportLuckyNumbers,
            colors,
            allLuckyNumbers: [...baseLuckyNumbers, ...supportLuckyNumbers]
        };
    }

    return {
        NGU_HANH_NUMBERS,
        NGU_HANH_COLORS,
        CUNG_PHI_INFO,
        sumDigits,
        calculateCungPhi,
        analyzeElementRelationship,
        analyzeChiRelationship,
        analyzeFengShui
    };
}));
