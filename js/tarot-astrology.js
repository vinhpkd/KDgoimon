/**
 * Tarot & Western Astrology Engine (Chiêm Tinh Học & 22 Lá Bài Ẩn Chính Tarot)
 * Tính toán Hành tinh chủ quản ngày, Năng lượng vũ trụ và Lá bài Tarot hộ mệnh.
 */

(function(root, factory) {
    var exp = factory();
    if (typeof define === 'function' && define.amd) {
        define([], function() { return exp; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = exp;
    }
    if (typeof root !== 'undefined' && root) root.TarotAstrologyEngine = exp;
    if (typeof window !== 'undefined') window.TarotAstrologyEngine = exp;
    if (typeof globalThis !== 'undefined') globalThis.TarotAstrologyEngine = exp;
    if (typeof self !== 'undefined') self.TarotAstrologyEngine = exp;
}(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function() {
    'use strict';

    // 7 Hành tinh chủ quản 7 ngày trong tuần
    const PLANETARY_RULERS = [
        {
            dayOfWeek: 0,
            name: 'Mặt Trời (Sun)',
            icon: 'sun',
            element: 'Hỏa',
            number: 1,
            luckyNumbers: [1, 10, 19, 28, 91],
            energy: 'Tỏa sáng, quyền lực, nhiệt huyết và sự công nhận đỉnh cao',
            advice: 'Hôm nay là thời điểm vàng để thể hiện bản thân, chủ động nắm bắt cơ hội lớn và tự tin quyết định.'
        },
        {
            dayOfWeek: 1,
            name: 'Mặt Trăng (Moon)',
            icon: 'moon',
            element: 'Thủy',
            number: 2,
            luckyNumbers: [2, 11, 20, 29, 92],
            energy: 'Trực giác thấu suốt, sự hòa nhã và khả năng thu hút tài lộc mềm',
            advice: 'Hãy lắng nghe linh cảm của bạn. Những quyết định êm dịu, hợp tác chân thành sẽ mang lại quả ngọt.'
        },
        {
            dayOfWeek: 2,
            name: 'Hỏa Tinh (Mars)',
            icon: 'flame',
            element: 'Hỏa',
            number: 9,
            luckyNumbers: [9, 18, 27, 36, 99],
            energy: 'Hành động dũng mãnh, tinh thần tiên phong và khả năng bứt phá rào cản',
            advice: 'Đừng ngần ngại hành động. Sự quyết đoán trong công việc hôm nay sẽ giúp bạn đánh bật đối thủ.'
        },
        {
            dayOfWeek: 3,
            name: 'Thủy Tinh (Mercury)',
            icon: 'zap',
            element: 'Thủy/Kim',
            number: 5,
            luckyNumbers: [5, 14, 23, 32, 55],
            energy: 'Trí tuệ sắc bén, đàm phán thương mại trôi chảy và thông tin giá trị',
            advice: 'Thích hợp cho giao dịch, ký kết, đàm phán hợp đồng hoặc trao đổi ý tưởng kinh doanh mới.'
        },
        {
            dayOfWeek: 4,
            name: 'Mộc Tinh (Jupiter - Đại Phúc Tinh)',
            icon: 'sparkles',
            element: 'Mộc',
            number: 3,
            luckyNumbers: [3, 12, 21, 30, 39, 83],
            energy: 'May mắn tột đỉnh, cơ hội mở rộng tài chính và phúc đức che chở',
            advice: 'Hôm nay là ngày hoàng kim cho tài lộc. Hãy mở lòng đón nhận những cơ hội bất ngờ ập đến.'
        },
        {
            dayOfWeek: 5,
            name: 'Kim Tinh (Venus)',
            icon: 'heart',
            element: 'Kim',
            number: 6,
            luckyNumbers: [6, 15, 24, 33, 68],
            energy: 'Hài hòa, thu hút của cải, thăng hoa tình duyên và các mối quan hệ quý giá',
            advice: 'Thích hợp để vun đắp quan hệ đối tác, tạo ấn tượng tốt đẹp và đầu tư vào sự an khang.'
        },
        {
            dayOfWeek: 6,
            name: 'Thổ Tinh (Saturn)',
            icon: 'shield',
            element: 'Thổ',
            number: 8,
            luckyNumbers: [8, 17, 26, 35, 88],
            energy: 'Bền vững, thành quả tích lũy, trật tự và sức mạnh kiên định',
            advice: 'Tập trung vào những mục tiêu dài hạn, hoàn tất các cam kết và bảo vệ thành quả lao động.'
        }
    ];

    // 22 Lá Bài Ẩn Chính (Major Arcana)
    const MAJOR_ARCANA = [
        {
            number: 0,
            name: 'The Fool',
            vietnameseName: 'Kẻ Khờ Khạo (Khởi Đầu Mới)',
            imageSymbol: '🌟',
            tag: 'Khởi đầu vô hạn',
            luckyNumbers: [0, 10, 20, 100],
            meaning: 'Năng lượng mở ra một chương mới hoàn toàn trong cuộc sống. Hãy dũng cảm bước qua vùng an toàn.',
            advice: 'Đừng ngại thử những phương thức mới. Vận may mỉm cười với người dám bước đi.'
        },
        {
            number: 1,
            name: 'The Magician',
            vietnameseName: 'Nhà Ảo Thuật (Bậc Thầy Biến Hóa)',
            imageSymbol: '🪄',
            tag: 'Hiện thực hóa mục tiêu',
            luckyNumbers: [1, 11, 21, 51],
            meaning: 'Bạn đang nắm giữ đầy đủ mọi nguồn lực và tài năng để tạo ra sự thịnh vượng.',
            advice: 'Tập trung cao độ ý chí và hành động. Những gì bạn chạm vào hôm nay đều có cơ hội sinh lời.'
        },
        {
            number: 2,
            name: 'The High Priestess',
            vietnameseName: 'Nữ Tư Tế (Trực Giác Thần Thánh)',
            imageSymbol: '🔮',
            tag: 'Linh cảm chuẩn xác',
            luckyNumbers: [2, 12, 22, 72],
            meaning: 'Trực giác và sự tĩnh lặng bên trong sẽ mách bảo con đường đúng đắn nhất.',
            advice: 'Tin tưởng vào giác quan thứ sáu của bạn. Có tin tức ngầm hoặc cơ hội kín đáo đang mở ra.'
        },
        {
            number: 3,
            name: 'The Empress',
            vietnameseName: 'Nữ Hoàng (Màu Mỡ & Sinh Sôi)',
            imageSymbol: '👑',
            tag: 'Tài lộc dồi dào',
            luckyNumbers: [3, 13, 33, 63],
            meaning: 'Biểu tượng của sự trù phú, bội thu và tình cảm ấm áp đong đầy.',
            advice: 'Đầu tư vào không gian sống, sức khỏe và các mối quan hệ tạo ra giá trị bền vững.'
        },
        {
            number: 4,
            name: 'The Emperor',
            vietnameseName: 'Hoàng Đế (Uy Quyền & Kỷ Cương)',
            imageSymbol: '🏛️',
            tag: 'Lãnh đạo & Kiểm soát',
            luckyNumbers: [4, 14, 24, 44],
            meaning: 'Sự kiên định, kỷ luật thép và quyền lực kiểm soát vững chãi mọi tình huống.',
            advice: 'Hành động theo kế hoạch rõ ràng, giữ vững nguyên tắc để khẳng định vị thế dẫn đầu.'
        },
        {
            number: 5,
            name: 'The Hierophant',
            vietnameseName: 'Đại Tư Tế (Quý Nhân & Trí Tuệ)',
            imageSymbol: '📜',
            tag: 'Chỉ dẫn tinh thần',
            luckyNumbers: [5, 15, 25, 55],
            meaning: 'Gặp gỡ quý nhân, người thầy dẫn đường hoặc lời khuyên chuyên gia vô cùng giá trị.',
            advice: 'Lắng nghe những người có kinh nghiệm, tuân theo các chuẩn mực đạo đức và cam kết.'
        },
        {
            number: 6,
            name: 'The Lovers',
            vietnameseName: 'Đôi Tình Nhân (Lựa Chọn Hòa Hợp)',
            imageSymbol: '💖',
            tag: 'Hòa hợp & Gắn kết',
            luckyNumbers: [6, 16, 26, 66],
            meaning: 'Sự đồng điệu tuyệt vời trong đối tác, tình cảm và những quyết định xuất phát từ trái tim.',
            advice: 'Lựa chọn sự gắn kết chân thành, bắt tay hợp tác cùng có lợi với người tin cậy.'
        },
        {
            number: 7,
            name: 'The Chariot',
            vietnameseName: 'Cỗ Xe Chiến Thắng (Quyết Chiến Quyết Thắng)',
            imageSymbol: '🛡️',
            tag: 'Vượt mọi chông gai',
            luckyNumbers: [7, 17, 27, 77],
            meaning: 'Ý chí kiên cường đưa bạn vượt qua mọi chướng ngại vật để chạm tay tới vinh quang.',
            advice: 'Tiến về phía trước không do dự. Mọi rào cản sẽ phải nhường bước trước ý chí của bạn.'
        },
        {
            number: 8,
            name: 'Strength',
            vietnameseName: 'Sức Mạnh (Nội Lực & Khéo Léo)',
            imageSymbol: '🦁',
            tag: 'Nhu thắng cương',
            luckyNumbers: [8, 18, 28, 88],
            meaning: 'Sức mạnh mềm mại từ sự kiên nhẫn, lòng nhân từ và khả năng thuần hóa nghịch cảnh.',
            advice: 'Dùng sự khéo léo và bình tĩnh để giải quyết các mâu thuẫn phức tạp.'
        },
        {
            number: 9,
            name: 'The Hermit',
            vietnameseName: 'Ẩn Sĩ (Soi Sáng Tri Thức)',
            imageSymbol: '🏮',
            tag: 'Tĩnh tâm & Sáng suốt',
            luckyNumbers: [9, 19, 29, 99],
            meaning: 'Ánh sáng ngọn đèn trí tuệ dẫn lối qua những khúc quanh mờ mịt.',
            advice: 'Dành chút thời gian tĩnh lặng chiêm nghiệm trước khi đưa ra quyết định trọng đại.'
        },
        {
            number: 10,
            name: 'Wheel of Fortune',
            vietnameseName: 'Bánh Xe Số Phận (Vận May Xoay Vần)',
            imageSymbol: '☸️',
            tag: 'Cơ hội vàng bất ngờ',
            luckyNumbers: [10, 20, 50, 80],
            meaning: 'Vận số chuyển hướng tích cực rực rỡ, đón nhận món quà may mắn từ vũ trụ.',
            advice: 'Sẵn sàng đón nhận vận may và nhanh tay chớp lấy cơ hội hiếm có.'
        },
        {
            number: 11,
            name: 'Justice',
            vietnameseName: 'Công Lý (Minh Bạch & Công Bằng)',
            imageSymbol: '⚖️',
            tag: 'Cân bằng & Kết quả',
            luckyNumbers: [11, 22, 33, 71],
            meaning: 'Những nỗ lực chân chính sẽ được đền đáp xứng đáng bằng thành quả công bằng.',
            advice: 'Giữ tâm trong sáng, minh bạch trong các giao dịch tài chính và giấy tờ pháp lý.'
        },
        {
            number: 12,
            name: 'The Hanged Man',
            vietnameseName: 'Kẻ Treo Ngược (Góc Nhìn Đột Phá)',
            imageSymbol: '🤸',
            tag: 'Góc nhìn mới lạ',
            luckyNumbers: [12, 21, 32, 82],
            meaning: 'Nhìn nhận vấn đề dưới một lăng kính hoàn toàn khác sẽ mở ra giải pháp bất ngờ.',
            advice: 'Đừng bám chấp vào lối mòn cũ, hãy linh hoạt thích ứng để tìm ra lối thoát thông minh.'
        },
        {
            number: 13,
            name: 'Death & Rebirth',
            vietnameseName: 'Tái Sinh (Khép Cũ Mở Mới)',
            imageSymbol: '🦋',
            tag: 'Lột xác ngoạn mục',
            luckyNumbers: [13, 31, 40, 85],
            meaning: 'Buông bỏ những điều cũ kỹ trì trệ để đón nhận sinh khí mới dồi dào hơn.',
            advice: 'Mạnh dạn cắt bỏ những thói quen tiêu cực, sẵn sàng cho một khởi đầu tươi sáng.'
        },
        {
            number: 14,
            name: 'Temperance',
            vietnameseName: 'Tiết Độ (Cân Bằng Hoàn Hảo)',
            imageSymbol: '🏺',
            tag: 'Hài hòa âm dương',
            luckyNumbers: [14, 24, 41, 56],
            meaning: 'Dòng chảy năng lượng cân đối, sự hòa trộn hoàn hảo giữa các mặt của cuộc sống.',
            advice: 'Duy trì lối sống điều độ, dung hòa các luồng ý kiến khác nhau để đạt hiệu quả tối ưu.'
        },
        {
            number: 15,
            name: 'The Devil (Transcendence)',
            vietnameseName: 'Giải Phóng Xiềng Xích (Bứt Phá Dục Vọng)',
            imageSymbol: '⛓️',
            tag: 'Làm chủ bản thân',
            luckyNumbers: [15, 51, 65, 75],
            meaning: 'Nhận diện các cám dỗ và thói quen cản trở để bứt phá tự do và làm chủ tài chính.',
            advice: 'Tỉnh táo trước những lời mời gọi viển vông, chỉ tập trung vào giá trị thực chất.'
        },
        {
            number: 16,
            name: 'The Tower (Awakening)',
            vietnameseName: 'Thức Tỉnh Sấm Sét (Đập Tan Ảo Tưởng)',
            imageSymbol: '⚡',
            tag: 'Đột phá bất ngờ',
            luckyNumbers: [16, 61, 70, 79],
            meaning: 'Sự kiện bất ngờ phá vỡ kết cấu cũ để tái xây dựng một nền móng vững chắc gấp bội.',
            advice: 'Xem những thay đổi bất ngờ là đòn bẩy để tiến hóa và trở nên mạnh mẽ hơn.'
        },
        {
            number: 17,
            name: 'The Star',
            vietnameseName: 'Ngôi Sao Hy Vọng (Ánh Sáng May Mắn)',
            imageSymbol: '⭐',
            tag: 'Hy vọng & Phước lành',
            luckyNumbers: [17, 71, 77, 87],
            meaning: 'Ánh sao hộ mệnh chiếu rọi, mang lại niềm tin vô bờ, sự hồi phục và ước mơ thành hiện thực.',
            advice: 'Nuôi dưỡng hy vọng và lan tỏa năng lượng tích cực đến mọi người xung quanh.'
        },
        {
            number: 18,
            name: 'The Moon',
            vietnameseName: 'Vầng Trăng Huyền Bí (Khám Phá Chiều Sâu)',
            imageSymbol: '🌙',
            tag: 'Trực giác nhạy bén',
            luckyNumbers: [18, 81, 90, 98],
            meaning: 'Khám phá thế giới nội tâm huyền diệu và nhận thức rõ những điều ẩn giấu sau bức màn.',
            advice: 'Đi chậm lại, quan sát kỹ lưỡng và để trực giác dẫn lối qua những khúc quanh.'
        },
        {
            number: 19,
            name: 'The Sun',
            vietnameseName: 'Thái Dương (Hào Quang Đại Thắng)',
            imageSymbol: '☀️',
            tag: 'Đại Cát Đại Lợi',
            luckyNumbers: [19, 91, 10, 99],
            meaning: 'Lá bài may mắn bậc nhất trong bộ Tarot! Ánh dương rực rỡ mang đến chiến thắng, niềm vui và tài lộc ngập tràn.',
            advice: 'Tự tin đón nhận ánh hào quang, mọi việc khởi sự hôm nay đều vô cùng hanh thông.'
        },
        {
            number: 20,
            name: 'Judgement',
            vietnameseName: 'Phán Quyết (Hồi Sinh & Đón Nhận)',
            imageSymbol: '📯',
            tag: 'Tiếng gọi định mệnh',
            luckyNumbers: [20, 2, 29, 92],
            meaning: 'Thời khắc thức tỉnh thiêng liêng, thu hoạch quả ngọt sau thời gian nỗ lực bền bỉ.',
            advice: 'Đáp lại tiếng gọi từ trái tim, tha thứ cho quá khứ và đón nhận vận mệnh tươi đẹp.'
        },
        {
            number: 21,
            name: 'The World',
            vietnameseName: 'Thế Giới (Viên Mãn Toàn Bích)',
            imageSymbol: '🌍',
            tag: 'Đại thành tựu',
            luckyNumbers: [21, 12, 99, 100],
            meaning: 'Sự hoàn tất xuất sắc của một chu trình vĩ đại, đạt đỉnh cao vinh quang và hòa hợp hoàn hảo.',
            advice: 'Ăn mừng chiến thắng và tự hào về chặng đường bạn đã kiên cường bước qua.'
        }
    ];

    /**
     * Xác định hành tinh chủ quản theo thứ trong tuần
     */
    function getPlanetaryRuler(dateObj) {
        const dayOfWeek = dateObj.getDay(); // 0: Sunday, 1: Monday...
        return PLANETARY_RULERS[dayOfWeek] || PLANETARY_RULERS[0];
    }

    /**
     * Rút lá bài Tarot ngày dựa trên năm sinh và ngày tra cứu (deterministic seed)
     */
    function getDailyTarotCard(birthYear, day, month, year) {
        const seed = (parseInt(birthYear, 10) * 7 + parseInt(day, 10) * 13 + parseInt(month, 10) * 19 + parseInt(year, 10) * 3) % 22;
        return MAJOR_ARCANA[seed];
    }

    /**
     * Phân tích tổng hợp Chiêm Tinh & Tarot cho ngày
     */
    function analyzeTarotAndAstrology(birthYear, dateObj, day, month, year) {
        const planet = getPlanetaryRuler(dateObj);
        const tarotCard = getDailyTarotCard(birthYear, day, month, year);

        return {
            planet,
            tarotCard,
            astrologyNumbers: planet.luckyNumbers,
            tarotNumbers: tarotCard.luckyNumbers
        };
    }

    return {
        PLANETARY_RULERS,
        MAJOR_ARCANA,
        getPlanetaryRuler,
        getDailyTarotCard,
        analyzeTarotAndAstrology
    };
}));
