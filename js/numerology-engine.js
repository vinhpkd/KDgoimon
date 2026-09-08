/**
 * Numerology Engine (Thần Số Học Phương Tây & Pythagorean Vibration)
 * Tính toán Chỉ số ngày cá nhân (Personal Day), Universal Day, Tần số rung động số học.
 */

(function(root, factory) {
    var exp = factory();
    if (typeof define === 'function' && define.amd) {
        define([], function() { return exp; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = exp;
    }
    if (typeof root !== 'undefined' && root) root.NumerologyEngine = exp;
    if (typeof window !== 'undefined') window.NumerologyEngine = exp;
    if (typeof globalThis !== 'undefined') globalThis.NumerologyEngine = exp;
    if (typeof self !== 'undefined') self.NumerologyEngine = exp;
}(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function() {
    'use strict';

    const NUMBER_VIBRATIONS = {
        1: {
            title: 'Năng Lượng Tiên Phong & Khởi Tạo',
            keywords: 'Lãnh đạo, Quyết đoán, Tự chủ, Đột phá',
            desc: 'Con số số 1 mang tần số của Mặt Trời, khởi nguyên vạn vật, kích hoạt năng lượng hành động dứt khoát và làm chủ cơ hội.'
        },
        2: {
            title: 'Năng Lượng Kết Nối & Trực Giác',
            keywords: 'Hòa hợp, Ngoại giao, Thấu hiểu, Đồng hành',
            desc: 'Con số 2 gắn liền với Mặt Trăng, mở rộng trực giác nhạy bén, thu hút quý nhân và sự trợ lực từ các mối quan hệ.'
        },
        3: {
            title: 'Năng Lượng May Mắn & Tỏa Sáng',
            keywords: 'Sáng tạo, Lạc quan, May mắn, Giao tiếp',
            desc: 'Con số 3 đại diện cho Mộc Tinh (Sao Mộc), ngôi sao của đại phúc đại cát, mang lại niềm vui, sự tự tin và tiếng vang lớn.'
        },
        4: {
            title: 'Năng Lượng Vững Chắc & Căn Cơ',
            keywords: 'Kỷ luật, Thực tế, Bền vững, An toàn',
            desc: 'Con số 4 tạo lập nền tảng tài chính kiên cố, thu hút những giao dịch an toàn và các thỏa thuận bền lâu.'
        },
        5: {
            title: 'Năng Lượng Đột Phá & Biến Chuyển',
            keywords: 'Tự do, Đổi mới, Cơ hội vàng, Phiêu lưu',
            desc: 'Con số 5 biểu trưng cho Sao Thủy, đem lại sự linh hoạt kỳ diệu, mở ra những cơ hội tài lộc và bước ngoặt bất ngờ.'
        },
        6: {
            title: 'Năng Lượng Thịnh Vượng & Bình An',
            keywords: 'Yêu thương, Gia đạo, Tài lộc, Trọn vẹn',
            desc: 'Con số 6 chịu sự bảo hộ của Sao Kim, kích hoạt dòng tiền dồi dào, thu hút sự ái mộ và gia đạo êm ấm viên mãn.'
        },
        7: {
            title: 'Năng Lượng Trí Tuệ & Chiêm Nghiệm',
            keywords: 'Tâm linh, Giác ngộ, Tri thức, May mắn ngầm',
            desc: 'Con số 7 kết nối với chiều sâu vũ trụ, giúp bạn nhìn thấu bản chất vấn đề, tránh được rủi ro và nhận phúc lộc vô hình.'
        },
        8: {
            title: 'Năng Lượng Tài Lộc Cực Đại & Quyền Uy',
            keywords: 'Thịnh vượng, Tiền tài, Thành tựu, Vô hạn (∞)',
            desc: 'Con số 8 là biểu tượng của sự giàu có, quyền lực và vòng lặp vô tận của may mắn vật chất lẫn danh vọng.'
        },
        9: {
            title: 'Năng Lượng Viên Mãn & Đỉnh Cao',
            keywords: 'Hoàn hảo, Nhân ái, Thành quả lớn, Khép lại đại thắng',
            desc: 'Con số 9 tổng kết toàn bộ tinh hoa, mang lại thành quả lớn sau thời gian ấp ủ, chuẩn bị cho chu kỳ thăng hoa mới.'
        },
        11: {
            title: 'Master Number 11: Trực Giác Thấu Thị',
            keywords: 'Soi sáng, Giác ngộ, Thần giao cách cảm',
            desc: 'Con số bậc thầy 11 mở ra trực giác siêu nhiên và khả năng nắm bắt thời cơ xuất chúng.'
        },
        22: {
            title: 'Master Number 22: Kiến Tạo Vĩ Đại',
            keywords: 'Xây dựng đế chế, Hiện thực hóa ước mơ',
            desc: 'Con số bậc thầy 22 biến mọi ý tưởng và dự định lớn thành hiện thực vật chất rực rỡ.'
        },
        33: {
            title: 'Master Number 33: Tình Yêu & Phước Lành Vô Lượng',
            keywords: 'Chữa lành, Phước đức vô hạn, Cứu giúp',
            desc: 'Con số bậc thầy 33 đem lại bình an tuyệt đối và sự che chở tối cao từ trời cao.'
        }
    };

    /**
     * Rút gọn một số thành 1 chữ số (hoặc giữ lại Master Number 11, 22, 33 nếu muốn)
     */
    function reduceToSingleDigit(num, keepMaster = false) {
        let n = parseInt(num, 10);
        if (isNaN(n) || n <= 0) return 1;

        while (n > 9) {
            if (keepMaster && (n === 11 || n === 22 || n === 33)) {
                return n;
            }
            let sum = 0;
            for (let digit of String(n)) {
                sum += parseInt(digit, 10);
            }
            n = sum;
        }
        return n;
    }

    /**
     * Tính Chỉ số Năm Sinh (Birth Year Number / Life Path Base)
     */
    function calculateBirthYearNumber(birthYear) {
        return reduceToSingleDigit(birthYear);
    }

    /**
     * Tính Chỉ số Ngày Toàn Cầu (Universal Day Number)
     */
    function calculateUniversalDayNumber(day, month, year) {
        const sum = parseInt(day, 10) + parseInt(month, 10) + parseInt(year, 10);
        return reduceToSingleDigit(sum, true);
    }

    /**
     * Tính Chỉ số Ngày Cá Nhân (Personal Day Number)
     * Personal Year = reduce(BirthYear + CurrentYear)
     * Personal Day = reduce(Personal Year + CurrentMonth + CurrentDay)
     */
    function calculatePersonalDayNumber(birthYear, day, month, currentYear) {
        const birthYearNum = reduceToSingleDigit(birthYear);
        const currentYearNum = reduceToSingleDigit(currentYear);
        const personalYear = reduceToSingleDigit(birthYearNum + currentYearNum);
        const personalDay = reduceToSingleDigit(personalYear + parseInt(month, 10) + parseInt(day, 10));

        return {
            birthYearNum,
            personalYear,
            personalDay,
            info: NUMBER_VIBRATIONS[personalDay] || NUMBER_VIBRATIONS[1]
        };
    }

    /**
     * Phân tích tổng thể Thần Số Học cho ngày tra cứu
     */
    function analyzeNumerology(birthYear, day, month, year) {
        const universalDay = calculateUniversalDayNumber(day, month, year);
        const personal = calculatePersonalDayNumber(birthYear, day, month, year);

        // Các cặp số cộng hưởng rung động mạnh mẽ trong ngày
        const base = personal.personalDay;
        const resonanceNumbers = [
            base,
            base * 10 + ((base * 3) % 10),
            reduceToSingleDigit(base + (typeof universalDay === 'number' ? universalDay : 9)),
            ((base * 11) % 90) + 10
        ];

        return {
            universalDay,
            universalInfo: NUMBER_VIBRATIONS[universalDay] || NUMBER_VIBRATIONS[1],
            personalDay: personal.personalDay,
            personalYear: personal.personalYear,
            personalInfo: personal.info,
            resonanceNumbers,
            birthYearNum: personal.birthYearNum
        };
    }

    return {
        NUMBER_VIBRATIONS,
        reduceToSingleDigit,
        calculateBirthYearNumber,
        calculateUniversalDayNumber,
        calculatePersonalDayNumber,
        analyzeNumerology
    };
}));
