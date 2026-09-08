/**
 * Lunar Calendar & Eastern Astrology Core (GMT+7)
 * Tính toán Âm lịch, Can Chi, Ngũ Hành Nạp Âm, Giờ Hoàng Đạo chuẩn xác theo múi giờ Việt Nam.
 */

(function(root, factory) {
    var exp = factory();
    if (typeof define === 'function' && define.amd) {
        define([], function() { return exp; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = exp;
    }
    if (typeof root !== 'undefined' && root) root.LunarCalendar = exp;
    if (typeof window !== 'undefined') window.LunarCalendar = exp;
    if (typeof globalThis !== 'undefined') globalThis.LunarCalendar = exp;
    if (typeof self !== 'undefined') self.LunarCalendar = exp;
}(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function() {
    'use strict';

    const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    const CON_GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Lợn'];

    const NGU_HANH_CAN = {
        'Giáp': 'Mộc', 'Ất': 'Mộc',
        'Bính': 'Hỏa', 'Đinh': 'Hỏa',
        'Mậu': 'Thổ', 'Kỷ': 'Thổ',
        'Canh': 'Kim', 'Tân': 'Kim',
        'Nhâm': 'Thủy', 'Quý': 'Thủy'
    };

    const NGU_HANH_CHI = {
        'Tý': 'Thủy', 'Hợi': 'Thủy',
        'Dần': 'Mộc', 'Mão': 'Mộc',
        'Tỵ': 'Hỏa', 'Ngọ': 'Hỏa',
        'Thân': 'Kim', 'Dậu': 'Kim',
        'Thìn': 'Thổ', 'Tuất': 'Thổ', 'Sửu': 'Thổ', 'Mùi': 'Thổ'
    };

    // 60 Hoa Giáp Ngũ Hành Nạp Âm
    const NAP_AM_60 = {
        'Giáp Tý': { element: 'Kim', name: 'Hải Trung Kim' },
        'Ất Sửu': { element: 'Kim', name: 'Hải Trung Kim' },
        'Bính Dần': { element: 'Hỏa', name: 'Lư Trung Hỏa' },
        'Đinh Mão': { element: 'Hỏa', name: 'Lư Trung Hỏa' },
        'Mậu Thìn': { element: 'Mộc', name: 'Đại Lâm Mộc' },
        'Kỷ Tỵ': { element: 'Mộc', name: 'Đại Lâm Mộc' },
        'Canh Ngọ': { element: 'Thổ', name: 'Lộ Bàng Thổ' },
        'Tân Mùi': { element: 'Thổ', name: 'Lộ Bàng Thổ' },
        'Nhâm Thân': { element: 'Kim', name: 'Kiếm Phong Kim' },
        'Quý Dậu': { element: 'Kim', name: 'Kiếm Phong Kim' },
        'Giáp Tuất': { element: 'Hỏa', name: 'Sơn Đầu Hỏa' },
        'Ất Hợi': { element: 'Hỏa', name: 'Sơn Đầu Hỏa' },
        'Bính Tý': { element: 'Thủy', name: 'Giản Hạ Thủy' },
        'Đinh Sửu': { element: 'Thủy', name: 'Giản Hạ Thủy' },
        'Mậu Dần': { element: 'Thổ', name: 'Thành Đầu Thổ' },
        'Kỷ Mão': { element: 'Thổ', name: 'Thành Đầu Thổ' },
        'Canh Thìn': { element: 'Kim', name: 'Bạch Lạp Kim' },
        'Tân Tỵ': { element: 'Kim', name: 'Bạch Lạp Kim' },
        'Nhâm Ngọ': { element: 'Mộc', name: 'Dương Liễu Mộc' },
        'Quý Mùi': { element: 'Mộc', name: 'Dương Liễu Mộc' },
        'Giáp Thân': { element: 'Thủy', name: 'Tuyền Trung Thủy' },
        'Ất Dậu': { element: 'Thủy', name: 'Tuyền Trung Thủy' },
        'Bính Tuất': { element: 'Thổ', name: 'Ốc Thượng Thổ' },
        'Đinh Hợi': { element: 'Thổ', name: 'Ốc Thượng Thổ' },
        'Mậu Tý': { element: 'Hỏa', name: 'Tích Lịch Hỏa' },
        'Kỷ Sửu': { element: 'Hỏa', name: 'Tích Lịch Hỏa' },
        'Canh Dần': { element: 'Mộc', name: 'Tùng Bách Mộc' },
        'Tân Mão': { element: 'Mộc', name: 'Tùng Bách Mộc' },
        'Nhâm Thìn': { element: 'Thủy', name: 'Trường Lưu Thủy' },
        'Quý Tỵ': { element: 'Thủy', name: 'Trường Lưu Thủy' },
        'Giáp Ngọ': { element: 'Kim', name: 'Sa Trung Kim' },
        'Ất Mùi': { element: 'Kim', name: 'Sa Trung Kim' },
        'Bính Thân': { element: 'Hỏa', name: 'Sơn Hạ Hỏa' },
        'Đinh Dậu': { element: 'Hỏa', name: 'Sơn Hạ Hỏa' },
        'Mậu Tuất': { element: 'Mộc', name: 'Bình Địa Mộc' },
        'Kỷ Hợi': { element: 'Mộc', name: 'Bình Địa Mộc' },
        'Canh Tý': { element: 'Thổ', name: 'Bích Thượng Thổ' },
        'Tân Sửu': { element: 'Thổ', name: 'Bích Thượng Thổ' },
        'Nhâm Dần': { element: 'Kim', name: 'Kim Bạch Kim' },
        'Quý Mão': { element: 'Kim', name: 'Kim Bạch Kim' },
        'Giáp Thìn': { element: 'Hỏa', name: 'Phúc Đăng Hỏa' },
        'Ất Tỵ': { element: 'Hỏa', name: 'Phúc Đăng Hỏa' },
        'Bính Ngọ': { element: 'Thủy', name: 'Thiên Hà Thủy' },
        'Đinh Mùi': { element: 'Thủy', name: 'Thiên Hà Thủy' },
        'Mậu Thân': { element: 'Thổ', name: 'Đại Trạch Thổ' },
        'Kỷ Dậu': { element: 'Thổ', name: 'Đại Trạch Thổ' },
        'Canh Tuất': { element: 'Kim', name: 'Thoa Xuyến Kim' },
        'Tân Hợi': { element: 'Kim', name: 'Thoa Xuyến Kim' },
        'Nhâm Tý': { element: 'Mộc', name: 'Tang Đố Mộc' },
        'Quý Sửu': { element: 'Mộc', name: 'Tang Đố Mộc' },
        'Giáp Dần': { element: 'Thủy', name: 'Đại Khê Thủy' },
        'Ất Mão': { element: 'Thủy', name: 'Đại Khê Thủy' },
        'Bính Thìn': { element: 'Thổ', name: 'Sa Trung Thổ' },
        'Đinh Tỵ': { element: 'Thổ', name: 'Sa Trung Thổ' },
        'Mậu Ngọ': { element: 'Hỏa', name: 'Thiên Thượng Hỏa' },
        'Kỷ Mùi': { element: 'Hỏa', name: 'Thiên Thượng Hỏa' },
        'Canh Thân': { element: 'Mộc', name: 'Thạch Lựu Mộc' },
        'Tân Dậu': { element: 'Mộc', name: 'Thạch Lựu Mộc' },
        'Nhâm Tuất': { element: 'Thủy', name: 'Đại Hải Thủy' },
        'Quý Hợi': { element: 'Thủy', name: 'Đại Hải Thủy' }
    };

    // 12 Trực
    const TRUC_12 = [
        { name: 'Kiến', good: 'Tốt cho khởi đầu, xuất hành, nhậm chức, cưới hỏi', nature: 'Cát' },
        { name: 'Trừ', good: 'Tốt cho trừ bỏ điềm xấu, chữa bệnh, giải trừ phong long', nature: 'Bình' },
        { name: 'Mãn', good: 'Tốt cho cầu tài, tích lũy, mở kho, cưới hỏi, tế tự', nature: 'Đại Cát' },
        { name: 'Bình', good: 'Mọi sự bình ổn, hòa hợp, tu sửa, giao dịch nhẹ nhàng', nature: 'Bình' },
        { name: 'Định', good: 'Tốt cho ký kết hợp đồng, giao dịch, gieo trồng, nhập học', nature: 'Cát' },
        { name: 'Chấp', good: 'Tốt cho xây dựng, tu tạo, giữ gìn tài sản', nature: 'Bình' },
        { name: 'Phá', good: 'Tránh việc lớn, chỉ nên phá dỡ, cải tạo cái cũ', nature: 'Hung' },
        { name: 'Nguy', good: 'Nên cẩn trọng, làm việc thiện, tĩnh tâm, không mạo hiểm', nature: 'Hung' },
        { name: 'Thành', good: 'Mọi sự đại thành, khai trương, xuất hành, kết hôn đại cát', nature: 'Đại Cát' },
        { name: 'Thâu', good: 'Tốt cho thu hoạch tài lộc, nhận tiền, cất giữ của cải', nature: 'Cát' },
        { name: 'Khai', good: 'Tốt cho khai trương, mở cửa hàng, bắt đầu dự án mới', nature: 'Đại Cát' },
        { name: 'Bế', good: 'Nên phòng thủ, đắp đập, bế quan, tránh xuất tiền lớn', nature: 'Hung' }
    ];

    // Giờ Hoàng Đạo theo 12 Chi của Ngày
    const HOANG_DAO_TABLE = {
        'Tý': ['Tý (23h-01h)', 'Sửu (01h-03h)', 'Mão (05h-07h)', 'Ngọ (11h-13h)', 'Thân (15h-17h)', 'Dậu (17h-19h)'],
        'Sửu': ['Dần (03h-05h)', 'Mão (05h-07h)', 'Tỵ (09h-11h)', 'Thân (15h-17h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'],
        'Dần': ['Tý (23h-01h)', 'Sửu (01h-03h)', 'Thìn (07h-09h)', 'Tỵ (09h-11h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)'],
        'Mão': ['Tý (23h-01h)', 'Dần (03h-05h)', 'Mão (05h-07h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Dậu (17h-19h)'],
        'Thìn': ['Dần (03h-05h)', 'Thìn (07h-09h)', 'Tỵ (09h-11h)', 'Thân (15h-17h)', 'Dậu (17h-19h)', 'Hợi (21h-23h)'],
        'Tỵ': ['Sửu (01h-03h)', 'Thìn (07h-09h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'],
        'Ngọ': ['Tý (23h-01h)', 'Sửu (01h-03h)', 'Mão (05h-07h)', 'Ngọ (11h-13h)', 'Thân (15h-17h)', 'Dậu (17h-19h)'],
        'Mùi': ['Dần (03h-05h)', 'Mão (05h-07h)', 'Tỵ (09h-11h)', 'Thân (15h-17h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'],
        'Thân': ['Tý (23h-01h)', 'Sửu (01h-03h)', 'Thìn (07h-09h)', 'Tỵ (09h-11h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)'],
        'Dậu': ['Tý (23h-01h)', 'Dần (03h-05h)', 'Mão (05h-07h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Dậu (17h-19h)'],
        'Tuất': ['Dần (03h-05h)', 'Thìn (07h-09h)', 'Tỵ (09h-11h)', 'Thân (15h-17h)', 'Dậu (17h-19h)', 'Hợi (21h-23h)'],
        'Hợi': ['Sửu (01h-03h)', 'Thìn (07h-09h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)']
    };

    /**
     * Tính Julian Day Number từ ngày/tháng/năm Dương Lịch
     */
    function jdFromDate(day, month, year) {
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        return jd;
    }

    /**
     * Tính Can Chi của năm sinh
     */
    function getYearCanChi(year) {
        const y = parseInt(year, 10);
        const canIndex = (y + 6) % 10;
        const chiIndex = (y + 8) % 12;
        const can = CAN[canIndex];
        const chi = CHI[chiIndex];
        const fullName = `${can} ${chi}`;
        const napAm = NAP_AM_60[fullName] || { element: 'Thổ', name: 'Lộ Bàng Thổ' };

        return {
            year: y,
            can,
            chi,
            conGiap: CON_GIAP[chiIndex],
            fullName,
            element: napAm.element,
            napAm: napAm.name
        };
    }

    /**
     * Tính Can Chi và Ngũ Hành của Ngày Dương lịch (GMT+7)
     */
    function getDayCanChi(day, month, year) {
        const d = parseInt(day, 10);
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);

        const jd = jdFromDate(d, m, y);
        const canIndex = (jd + 9) % 10;
        const chiIndex = (jd + 1) % 12;

        const can = CAN[canIndex];
        const chi = CHI[chiIndex];
        const fullName = `${can} ${chi}`;
        const napAm = NAP_AM_60[fullName] || { element: 'Kim', name: 'Hải Trung Kim' };
        
        // Tính Trực của ngày dựa vào chi ngày và tháng
        const trucIndex = ((chiIndex - m) % 12 + 12) % 12;
        const truc = TRUC_12[trucIndex] || TRUC_12[0];
        
        // Giờ hoàng đạo
        const hoangDao = HOANG_DAO_TABLE[chi] || HOANG_DAO_TABLE['Tý'];

        return {
            date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
            day: d,
            month: m,
            year: y,
            can,
            chi,
            conGiap: CON_GIAP[chiIndex],
            fullName,
            element: napAm.element,
            napAm: napAm.name,
            truc: truc.name,
            trucDesc: truc.good,
            trucNature: truc.nature,
            hoangDaoHours: hoangDao
        };
    }

    /**
     * Lấy ngày hiện tại theo chuẩn GMT+7 (Asia/Ho_Chi_Minh)
     */
    function getGMT7CurrentDate() {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const gmt7Date = new Date(utc + (3600000 * 7));
        return {
            dateObj: gmt7Date,
            day: gmt7Date.getDate(),
            month: gmt7Date.getMonth() + 1,
            year: gmt7Date.getFullYear(),
            hours: gmt7Date.getHours(),
            minutes: gmt7Date.getMinutes(),
            seconds: gmt7Date.getSeconds(),
            dateKey: `${gmt7Date.getFullYear()}-${String(gmt7Date.getMonth() + 1).padStart(2, '0')}-${String(gmt7Date.getDate()).padStart(2, '0')}`
        };
    }

    /**
     * Tính thời gian đếm ngược còn lại đến 00:00:00 GMT+7 ngày tiếp theo
     */
    function getCountdownToNext0hGMT7() {
        const current = getGMT7CurrentDate();
        const nextMidnight = new Date(current.dateObj);
        nextMidnight.setHours(24, 0, 0, 0);

        const diffMs = Math.max(0, nextMidnight.getTime() - current.dateObj.getTime());
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        return {
            diffMs,
            formatted: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            hours,
            minutes,
            seconds
        };
    }

    return {
        CAN,
        CHI,
        CON_GIAP,
        NAP_AM_60,
        TRUC_12,
        getYearCanChi,
        getDayCanChi,
        getGMT7CurrentDate,
        getCountdownToNext0hGMT7
    };
}));
