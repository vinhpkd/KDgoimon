// Authentic ShopeeFood Restaurants Data (100% exact sync)
const INITIAL_RESTAURANTS = [
    {
        "shopeeUrl":  "https://shopeefood.vn/ha-noi/dao-che-che-sach-vi-ngon-kim-giang",
        "id":  "dao-che-kim-giang",
        "category":  "Yêu thích",
        "timeOpen":  "09:00 - 22:00",
        "rating":  "4.9",
        "description":  "Thực đơn chính thức từ ShopeeFood: Đảo Chè - Chè Sạch Vị Ngon - Kim Giang",
        "name":  "Đảo Chè - Chè Sạch Vị Ngon - Kim Giang",
        "address":  "104 Kim Giang, P. Đại Kim, Hoàng Mai, Hà Nội",
        "dishes":  [
                       {
                           "id":  "dish-01",
                           "name":  "Chè Cốm Khoai Dẻo (like)",
                           "price":  15000,
                           "category":  "Món Đang Giảm",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-02",
                           "name":  "Bơ Già Dừa Non (đồ uống)",
                           "price":  45000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-03",
                           "name":  "Nước Dừa Hoa Đậu Biếc Trân Châu",
                           "price":  40000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-04",
                           "name":  "Chè khoai dẻo pudding khoai môn",
                           "price":  35000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-05",
                           "name":  "Trà sữa ô long kem trứng dừa nướng",
                           "price":  40000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-06",
                           "name":  "Trà Mãng Cầu",
                           "price":  40000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-07",
                           "name":  "Sữa chua dầm mãng cầu",
                           "price":  40000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-08",
                           "name":  "Sữa dừa Khoai Môn tươi",
                           "price":  40000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-09",
                           "name":  "Sữa Dừa Nếp Thái (like)",
                           "price":  35000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-10",
                           "name":  "Nước Lê Nha Đam",
                           "price":  38000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-11",
                           "name":  "Chè pudding Khoai Môn",
                           "price":  35000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-12",
                           "name":  "Nước Lê thanh mát",
                           "price":  35000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-13",
                           "name":  "Ô long môn sữa",
                           "price":  40000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-14",
                           "name":  "Ô long nhài sữa",
                           "price":  35000,
                           "category":  "MÓN MỚI MÁT LÀNH TRẢI NGHIỆM MỚI",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-15",
                           "name":  "Chè Thập Cẩm truyền thống",
                           "price":  30000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-16",
                           "name":  "Chè Bưởi An Giang",
                           "price":  25000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-17",
                           "name":  "Chè Thái Bưởi",
                           "price":  30000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-18",
                           "name":  "Chè Thập cẩm Caramel",
                           "price":  38000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-19",
                           "name":  "Chè Cốm Bưởi",
                           "price":  30000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-20",
                           "name":  "Chè Cốm dẻo dừa non",
                           "price":  30000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-21",
                           "name":  "Chè Bưởi Khoai Dẻo",
                           "price":  30000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-22",
                           "name":  "Đậu đỏ dừa non",
                           "price":  30000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-23",
                           "name":  "Chè Đậu Đỏ Sương Sáo",
                           "price":  30000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-24",
                           "name":  "Thái bưởi đậu đỏ caramen",
                           "price":  34000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-25",
                           "name":  "Set Chè Bưởi 1kg",
                           "price":  90000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-26",
                           "name":  "Đậu Đỏ Trân châu cốt dừa",
                           "price":  25000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-27",
                           "name":  "Set chè cốm 1 kg",
                           "price":  110000,
                           "category":  "CHÈ TRUYỀN THỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-28",
                           "name":  "Chè Sầu Đảo Chè",
                           "price":  38000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-29",
                           "name":  "Dừa dầm Đảo Chè Đặc biệt (like)",
                           "price":  35000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-30",
                           "name":  "Chè Khúc Bạch Caramel",
                           "price":  35000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-31",
                           "name":  "Dừa Non Dầm Hải Phòng(chuẩn vị)",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-32",
                           "name":  "Chè Bơ già dừa non nướng",
                           "price":  45000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-33",
                           "name":  "Chè Mít Đác Sầu Caramen",
                           "price":  40000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-34",
                           "name":  "Chè Mít Đác - Caramen",
                           "price":  35000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-35",
                           "name":  "Chè Khúc Bạch hạnh nhân",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-36",
                           "name":  "Chè Khoai Dẻo Khúc Bạch",
                           "price":  35000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-37",
                           "name":  "Chè Caramen 9 tầng mây (like)",
                           "price":  40000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-38",
                           "name":  "Chè Khoai Dẻo- Caramen (like)",
                           "price":  40000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-39",
                           "name":  "Chè Bơ Sầu",
                           "price":  40000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-40",
                           "name":  "Chè Xoài Mãng Cầu",
                           "price":  40000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-41",
                           "name":  "Chè Thái Mít Đác",
                           "price":  32000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-42",
                           "name":  "Chè Khoai Dẻo đậu đỏ",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-43",
                           "name":  "Chè Sương Sáo Cốt Dừa Trân Châu",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-44",
                           "name":  "Chè Xoài",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-45",
                           "name":  "Khoai Dẻo Đậu Đỏ Caramen",
                           "price":  40000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-46",
                           "name":  "Chè 9 tầng mây",
                           "price":  35000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-47",
                           "name":  "Chè Bơ tươi xay",
                           "price":  36000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-48",
                           "name":  "Dừa Non lá nếp",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-49",
                           "name":  "Chè Xoài Khúc Bạch",
                           "price":  40000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-50",
                           "name":  "Chè Khoai Dẻo sương sáo",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-51",
                           "name":  "Chè Thái sữa dừa",
                           "price":  30000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "Chè bánh lọt cốt dừa là món chè nổi tiếng của Thái. Bánh lọt xanh thơm lá dứa hoà quyện cùng cốt dừa, thêm topping trân châu và thạch dừa",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-52",
                           "name":  "Chè Dừa Dầm Sầu Riêng",
                           "price":  34000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-53",
                           "name":  "Dừa Dầm Đác Rim",
                           "price":  35000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-54",
                           "name":  "Chè Đậu Đỏ Khoai dẻo",
                           "price":  35000,
                           "category":  "CHÈ NGON ĐẢO CHÈ",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-55",
                           "name":  "Sữa chua Mít- Caramen",
                           "price":  35000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-56",
                           "name":  "Sữa chua Mít Đảo Chè",
                           "price":  30000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-57",
                           "name":  "Kem Bơ",
                           "price":  40000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-58",
                           "name":  "Sữa Chua Dẻo trân châu cốt dừa",
                           "price":  35000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-59",
                           "name":  "Sữa chua Dẻo Bơ",
                           "price":  40000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-60",
                           "name":  "Sữa chua dẻo đậu đỏ trân châu",
                           "price":  30000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-61",
                           "name":  "Sữa chua mít dầm đác",
                           "price":  35000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-62",
                           "name":  "Sữa chua nha đam thạch lá nếp",
                           "price":  35000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-63",
                           "name":  "Sữa chua dầm Đác rim",
                           "price":  35000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-64",
                           "name":  "Sữa chua Dẻo xoài",
                           "price":  30000,
                           "category":  "KEM XÔI - KEM BƠ - SỮA CHUA",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-65",
                           "name":  "Tàu Hũ CARAMEN Kem Trứng( must try)",
                           "price":  35000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-66",
                           "name":  "Caramel 2 hộp",
                           "price":  20000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-67",
                           "name":  "Tàu hũ trân châu đường đen",
                           "price":  25000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-68",
                           "name":  "Tàu hũ Caramen chân trâu",
                           "price":  35000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-69",
                           "name":  "CARAMEN Trân châu đường đen (2BÁNH)",
                           "price":  25000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-70",
                           "name":  "Caramen sương sáo",
                           "price":  25000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-71",
                           "name":  "Tàu hũ Khoai Dẻo",
                           "price":  25000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-72",
                           "name":  "Tàu hũ trân châu cốt dừa",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-73",
                           "name":  "CARAMEN Kem Trứng Dừa Nướng",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-74",
                           "name":  "Tàu Hũ chân trâu đường đen",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-75",
                           "name":  "Tàu hũ đậu đỏ",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-76",
                           "name":  "Tàu hũ kem trứng cacao",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-77",
                           "name":  "Tàu Hũ Kem Trứng Dừa Nướng",
                           "price":  35000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-78",
                           "name":  "Tàu Hũ Sương Sáo",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-79",
                           "name":  "Tàu Hũ Cốm trân châu",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-80",
                           "name":  "Tàu hũ đác",
                           "price":  30000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-81",
                           "name":  "Tàu Hũ Sầu riêng",
                           "price":  35000,
                           "category":  "TÀU HŨ - CARAMEN",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-82",
                           "name":  "Nem chua rán Hà Nội/ đĩa nhỏ 5c",
                           "price":  35000,
                           "category":  "ĐỒ ĂN VẶT",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-83",
                           "name":  "Nem chua rán Hà Nội/ đĩa To 10c",
                           "price":  70000,
                           "category":  "ĐỒ ĂN VẶT",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-84",
                           "name":  "Khoai tây chiên",
                           "price":  40000,
                           "category":  "ĐỒ ĂN VẶT",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-85",
                           "name":  "Chân gà sả ớt rút xương(đĩa nhỏ 5-6 chân )",
                           "price":  65000,
                           "category":  "ĐỒ ĂN VẶT",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-86",
                           "name":  "Chè thái lọt đậu đỏ caramen",
                           "price":  35000,
                           "category":  "ĐÂỤ ĐỎ MAY MẮN THẤT TỊCH",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-87",
                           "name":  "chè đậu đỏ dừa non",
                           "price":  30000,
                           "category":  "ĐÂỤ ĐỎ MAY MẮN THẤT TỊCH",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-88",
                           "name":  "Đậu đỏ Trân châu truyền thống ( nước đỗ )",
                           "price":  25000,
                           "category":  "ĐÂỤ ĐỎ MAY MẮN THẤT TỊCH",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-89",
                           "name":  "Tàu hũ khoai dẻo đậu đỏ",
                           "price":  35000,
                           "category":  "ĐÂỤ ĐỎ MAY MẮN THẤT TỊCH",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-90",
                           "name":  "Trà Mãng cầu Nha Đam",
                           "price":  40000,
                           "category":  "ĐỒ UỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-91",
                           "name":  "TRÀ TẮC",
                           "price":  20000,
                           "category":  "ĐỒ UỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-92",
                           "name":  "Sữa tươi kem trứng trân châu",
                           "price":  30000,
                           "category":  "ĐỒ UỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-93",
                           "name":  "Sữa tươi kem trứng dừa nướng",
                           "price":  35000,
                           "category":  "ĐỒ UỐNG",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-94",
                           "name":  "Sữa chua thạch lá nếp trân châu",
                           "price":  25000,
                           "category":  "Thực đơn tổng hợp",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-95",
                           "name":  "Chè Dừa Non dầm Hạt Đác",
                           "price":  35000,
                           "category":  "Thực đơn tổng hợp",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-96",
                           "name":  "Tàu Hũ Kem Trứng Caramen (like)",
                           "price":  38000,
                           "category":  "Thực đơn tổng hợp",
                           "description":  "",
                           "tag":  ""
                       },
                       {
                           "id":  "dish-97",
                           "name":  "Chè Thái Đậu Đỏ CARAMEN",
                           "price":  35000,
                           "category":  "Thực đơn tổng hợp",
                           "description":  "",
                           "tag":  ""
                       }
                   ]
    }
];
