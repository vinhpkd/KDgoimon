# ==============================================================================
# HỆ THỐNG ĐẶT ĐỒ ĂN PHÒNG KINH DOANH (PowerShell 7+ & Windows PowerShell)
# Phục vụ Webapp và Full REST API Đặt Món ShopeeFood & Đồng Bộ Thời Gian Thực
# Hỗ trợ truy cập cho cả phòng qua mạng Wi-Fi / LAN nội bộ
# ==============================================================================

param (
    [int]$Port = 8080
)

$Host.UI.RawUI.WindowTitle = "He Thong Dat Do An Phong Kinh Doanh (Port $Port)"
Clear-Host

$baseDir = $PSScriptRoot
if (-not $baseDir) {
    $baseDir = Get-Location
}

# Đảm bảo thư mục data/ tồn tại
$dataDir = Join-Path $baseDir "data"
if (-not (Test-Path $dataDir)) {
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

$restaurantsFile = Join-Path $dataDir "restaurants.json"
$ordersFile = Join-Path $dataDir "orders.json"

if (-not (Test-Path $ordersFile)) {
    "[]" | Set-Content -Path $ordersFile -Encoding UTF8
}

# ------------------------------------------------------------------------------
# TỰ ĐỘNG TÌM IP MẠNG NỘI BỘ (Wi-Fi / LAN)
# ------------------------------------------------------------------------------
$localIP = "localhost"
try {
    $foundIPs = @()
    if (Get-Command Get-NetIPAddress -ErrorAction SilentlyContinue) {
        $raw = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
               Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254*" } |
               Select-Object -ExpandProperty IPAddress
        $foundIPs = @($raw)
    }
    
    if (-not $foundIPs -or $foundIPs.Count -eq 0) {
        $raw = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) |
               Where-Object { $_.AddressFamily -eq [System.Net.Sockets.AddressFamily]::InterNetwork -and -not $_.ToString().StartsWith("127.") -and -not $_.ToString().StartsWith("169.254.") } |
               ForEach-Object { $_.ToString() }
        $foundIPs = @($raw)
    }

    if ($foundIPs -and $foundIPs.Count -gt 0) {
        $localIP = $foundIPs[0]
    }
} catch { }

$urlLocal = "http://localhost:$Port"
$urlLan = if ($localIP -ne "localhost") { "http://$localIP`:$Port" } else { $urlLocal }

Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host "         [+] HE THONG DAT DO AN PHONG KINH DOANH                  " -ForegroundColor Cyan
Write-Host "    Dong bo thuc don ShopeeFood & Bang tong hop don Real-time     " -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "[+] MAY CHU DANG HOAT DONG SAN SANG:" -ForegroundColor Green
Write-Host "    * May tinh cua ban:   $urlLocal" -ForegroundColor Cyan
if ($localIP -ne "localhost") {
    Write-Host "    * LINK CHO CA PHONG:  $urlLan" -ForegroundColor Green
}
Write-Host ""
Write-Host "[i] HUONG DAN CHO CA PHONG TRUY CAP:" -ForegroundColor Magenta
Write-Host "    1. Moi nguoi ket noi cung mang Wi-Fi van phong." -ForegroundColor Gray
Write-Host "    2. Mo trinh duyet tren dien thoai hoac may tinh, go dia chi:" -ForegroundColor Gray
Write-Host "       ==> $urlLan" -ForegroundColor Yellow
Write-Host "    3. Chon mon va nhap ten, bang tong hop se cap nhat truc tiep!" -ForegroundColor Gray
Write-Host ""
Write-Host "[+] Thu muc goc: $baseDir" -ForegroundColor DarkCyan
Write-Host "[+] Nhan Ctrl+C de dung server.`n" -ForegroundColor DarkGray

# Tự động mở trình duyệt
try {
    Start-Process $urlLocal
} catch { }

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".woff"  = "font/woff"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Utf8Text([string]$filePath) {
    if (-not (Test-Path $filePath)) { return "[]" }
    $text = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
    if (-not $text) { return "[]" }
    return $text.TrimStart([char]0xFEFF)
}

function Write-Utf8Text([string]$filePath, [string]$content) {
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
}

function Save-OrdersArray($ordersList, $filePath) {
    if (-not $ordersList -or $ordersList.Count -eq 0) {
        Write-Utf8Text $filePath "[]"
        return "[]"
    }
    $json = ConvertTo-Json -InputObject @($ordersList) -Depth 10
    if ($ordersList.Count -eq 1 -and -not $json.Trim().StartsWith("[")) {
        $json = "[$json]"
    }
    Write-Utf8Text $filePath $json
    return $json
}

function Fetch-ShopeeFoodMenu([string]$shopeeUrl) {
    if (-not $shopeeUrl -or -not ($shopeeUrl -match 'shopeefood\.vn')) {
        return @{ success = $false; message = "Vui long nhap duong link ShopeeFood hop le (vi du: https://shopeefood.vn/ha-noi/...)" }
    }

    # Extract clean ShopeeFood URL
    $urlPattern = 'https?://(?:www\.)?shopeefood\.vn/[^\s\)\]\"\>]+'
    $urlMatch = [regex]::Match($shopeeUrl.Trim(), $urlPattern)
    $cleanUrl = if ($urlMatch.Success) { $urlMatch.Value } else { $shopeeUrl.Trim() }
    
    # Locate Chrome or Edge
    $browserPath = $null
    $candidates = @(
        'C:\Program Files\Google\Chrome\Application\chrome.exe',
        'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
    )

    foreach ($c in $candidates) {
        if (Test-Path $c) {
            $browserPath = $c
            break
        }
    }

    if (-not $browserPath) {
        return @{ success = $false; message = "Khong tim thay trinh duyet Chrome hoac Edge de tu dong cao thuc don ShopeeFood." }
    }

    $tmpDir = [System.IO.Path]::GetTempPath()
    $tmpFile = [System.IO.Path]::Combine($tmpDir, "shopee_dump_$([guid]::NewGuid().ToString('N')).html")
    
    try {
        $chromeArgs = @(
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--window-size=1920,30000",
            "--virtual-time-budget=6000",
            "--dump-dom",
            "`"$cleanUrl`""
        )
        $proc = Start-Process -FilePath $browserPath -ArgumentList $chromeArgs -RedirectStandardOutput $tmpFile -PassThru -NoNewWindow
        $null = $proc.WaitForExit(25000)
    } catch {
        return @{ success = $false; message = "Loi khi goi trinh duyet: $($_.Exception.Message)" }
    }

    # Robust file reading with FileShare.ReadWrite and retry loop
    $html = ""
    for ($retry = 0; $retry -lt 10; $retry++) {
        try {
            if (Test-Path $tmpFile) {
                $fs = [System.IO.File]::Open($tmpFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
                $sr = New-Object System.IO.StreamReader($fs, [System.Text.Encoding]::UTF8)
                $html = $sr.ReadToEnd()
                $sr.Close()
                $fs.Close()
                if ($html.Length -gt 100) { break }
            }
        } catch {
            Start-Sleep -Milliseconds 300
        }
    }
    try { Remove-Item -Path $tmpFile -Force -ErrorAction SilentlyContinue } catch {}

    if (-not $html -or $html.Length -lt 500) {
        return @{ success = $false; message = "Noi dung trang trong hoac duong link khong hop le." }
    }

    # 1. Ten Quan
    $restName = ""
    $nameMatch = [regex]::Match($html, '(?s)<h1[^>]*class="[^"]*name-restaurant[^"]*"[^>]*>(.*?)</h1>')
    if ($nameMatch.Success) {
        $restName = [System.Net.WebUtility]::HtmlDecode($nameMatch.Groups[1].Value).Trim()
        $restName = [regex]::Replace($restName, '<[^>]+>', '').Trim()
    }
    if (-not $restName) {
        $titleMatch = [regex]::Match($html, '(?s)<title>(.*?)</title>')
        if ($titleMatch.Success) {
            $restName = ($titleMatch.Groups[1].Value -split '\|')[0].Trim()
        }
    }
    if (-not $restName) {
        $restName = "Quan ShopeeFood"
    }

    # 2. Dia chi
    $address = ""
    $addrMatch = [regex]::Match($html, '(?s)<div[^>]*class="[^"]*address-restaurant[^"]*"[^>]*>(.*?)</div>')
    if ($addrMatch.Success) {
        $address = [System.Net.WebUtility]::HtmlDecode($addrMatch.Groups[1].Value).Trim()
        $address = [regex]::Replace($address, '<[^>]+>', '').Trim()
    }

    # 3. Danh muc quan
    $category = "An Vat & Trang Mieng"
    $catMatch = [regex]::Match($html, '(?s)<div[^>]*class="[^"]*kind-restaurant[^"]*"[^>]*>(.*?)</div>')
    if ($catMatch.Success) {
        $category = [System.Net.WebUtility]::HtmlDecode($catMatch.Groups[1].Value).Trim()
        $category = [regex]::Replace($category, '<[^>]+>', '').Trim()
    }

    # 4. Gio mo cua
    $timeOpen = "09:00 - 22:00"
    $timeMatch = [regex]::Match($html, '(?s)<div[^>]*class="[^"]*time-restaurant[^"]*"[^>]*>(.*?)</div>')
    if ($timeMatch.Success) {
        $timeOpen = [System.Net.WebUtility]::HtmlDecode($timeMatch.Groups[1].Value).Trim()
        $timeOpen = [regex]::Replace($timeOpen, '<[^>]+>', '').Trim()
    }

    # 5. Phan loai va lay toan bo danh muc cung mon an
    $titleRegex = '(?s)<div[^>]*class="[^"]*item-restaurant-title[^"]*"[^>]*>(.*?)</div>|<div[^>]*class="[^"]*title-menu[^"]*"[^>]*>(.*?)</div>'
    $matches = [regex]::Matches($html, $titleRegex)
    
    $sections = @()
    if ($matches.Count -gt 0) {
        for ($i = 0; $i -lt $matches.Count; $i++) {
            $currentMatch = $matches[$i]
            $categoryName = [regex]::Replace($currentMatch.Value, '<[^>]+>', '').Trim()
            
            $startPos = $currentMatch.Index + $currentMatch.Length
            $endPos = if ($i -lt $matches.Count - 1) { $matches[$i + 1].Index } else { $html.Length }
            
            $sectionHtml = $html.Substring($startPos, $endPos - $startPos)
            $dishMatches = [regex]::Matches($sectionHtml, '(?s)<h2[^>]*class="[^"]*item-restaurant-name[^"]*"[^>]*>(.*?)</h2>\s*(?:<div[^>]*class="[^"]*item-restaurant-desc[^"]*"[^>]*>(.*?)</div>)?.*?<div[^>]*class="[^"]*current-price[^"]*"[^>]*>(.*?)</div>')
            
            $dishes = @()
            foreach ($dm in $dishMatches) {
                $dName = [System.Net.WebUtility]::HtmlDecode($dm.Groups[1].Value).Trim()
                $dName = [regex]::Replace($dName, '<[^>]+>', '').Trim()
                
                $desc = [System.Net.WebUtility]::HtmlDecode($dm.Groups[2].Value).Trim()
                $desc = [regex]::Replace($desc, '<[^>]+>', '').Trim()
                
                $priceRaw = [System.Net.WebUtility]::HtmlDecode($dm.Groups[3].Value).Trim()
                $priceRaw = [regex]::Replace($priceRaw, '<[^>]+>', '').Trim()
                $price = [int]([regex]::Replace($priceRaw, '[^\d]', ''))
                
                $dishes += [PSCustomObject]@{
                    name = $dName
                    description = $desc
                    price = $price
                    category = $categoryName
                }
            }
            $sections += [PSCustomObject]@{
                category = $categoryName
                dishes = $dishes
            }
        }
    } else {
        $dishMatches = [regex]::Matches($html, '(?s)<h2[^>]*class="[^"]*item-restaurant-name[^"]*"[^>]*>(.*?)</h2>\s*(?:<div[^>]*class="[^"]*item-restaurant-desc[^"]*"[^>]*>(.*?)</div>)?.*?<div[^>]*class="[^"]*current-price[^"]*"[^>]*>(.*?)</div>')
        $dishes = @()
        foreach ($dm in $dishMatches) {
            $dName = [System.Net.WebUtility]::HtmlDecode($dm.Groups[1].Value).Trim()
            $dName = [regex]::Replace($dName, '<[^>]+>', '').Trim()
            $desc = [System.Net.WebUtility]::HtmlDecode($dm.Groups[2].Value).Trim()
            $desc = [regex]::Replace($desc, '<[^>]+>', '').Trim()
            $priceRaw = [System.Net.WebUtility]::HtmlDecode($dm.Groups[3].Value).Trim()
            $priceRaw = [regex]::Replace($priceRaw, '<[^>]+>', '').Trim()
            $price = [int]([regex]::Replace($priceRaw, '[^\d]', ''))
            $dishes += [PSCustomObject]@{
                name = $dName
                description = $desc
                price = $price
                category = $category
            }
        }
        $sections += [PSCustomObject]@{
            category = $category
            dishes = $dishes
        }
    }

    $allDishes = @()
    $seenNames = @{}
    $dishId = 1

    foreach ($sec in $sections) {
        foreach ($d in $sec.dishes) {
            if (-not $seenNames.ContainsKey($d.name)) {
                $seenNames[$d.name] = $true
                $allDishes += [PSCustomObject]@{
                    id = "dish-" + $dishId.ToString("D2")
                    name = $d.name
                    price = $d.price
                    category = $d.category
                    description = $d.description
                    tag = if ($d.category -eq "Món Đang Giảm" -or $d.category -match "MỚI|Hot") { "Hot" } else { "" }
                }
                $dishId++
            }
        }
    }

    if ($allDishes.Count -eq 0) {
        return @{ success = $false; message = "Khong tim thay mon an nao tren trang ShopeeFood nay. Vui long kiem tra lai link." }
    }

    # Slug ID from Shopee URL path or Name
    $idSlug = ""
    $urlSlugMatch = [regex]::Match($cleanUrl, 'shopeefood\.vn/[^/]+/([^/?#]+)')
    if ($urlSlugMatch.Success) {
        $idSlug = $urlSlugMatch.Groups[1].Value.ToLower().Trim()
    }
    if (-not $idSlug) {
        $idSlug = $restName.ToLower() -replace '[^a-z0-9]', '-' -replace '-+', '-'
        $idSlug = $idSlug.Trim('-')
    }
    if (-not $idSlug) { $idSlug = "rest_" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds() }

    return @{
        success = $true
        restaurant = @{
            id = $idSlug
            name = $restName
            shopeeUrl = $cleanUrl
            address = $address
            rating = "4.9"
            timeOpen = $timeOpen
            category = $category
            description = "Thực đơn chính thức từ ShopeeFood: $restName"
            dishes = $allDishes
        }
    }
}

# ------------------------------------------------------------------------------
# KHỞI ĐỘNG TCPLISTENER (CHO PHÉP TẤT CẢ THIẾT BỊ WI-FI/LAN TRUY CẬP KHÔNG CẦN ADMIN)
# ------------------------------------------------------------------------------
$tcpListener = $null
try {
    $tcpListener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
    $tcpListener.Start()
} catch {
    Write-Host "[!] Cong $Port bi chiem. Dang thu mo cong 8088..." -ForegroundColor Red
    $Port = 8088
    $urlLocal = "http://localhost:$Port"
    $urlLan = if ($localIP -ne "localhost") { "http://$localIP`:$Port" } else { $urlLocal }
    $tcpListener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $Port)
    $tcpListener.Start()
}

function Send-HttpBytes($stream, [int]$statusCode, [string]$statusText, [string]$contentType, [byte[]]$bodyBytes) {
    if (-not $bodyBytes) { $bodyBytes = [byte[]]@() }
    $header = "HTTP/1.1 $statusCode $statusText`r`n" +
              "Content-Type: $contentType`r`n" +
              "Content-Length: $($bodyBytes.Length)`r`n" +
              "Access-Control-Allow-Origin: *`r`n" +
              "Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`r`n" +
              "Access-Control-Allow-Headers: *`r`n" +
              "Access-Control-Allow-Private-Network: true`r`n" +
              "Connection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    if ($bodyBytes.Length -gt 0) {
        $stream.Write($bodyBytes, 0, $bodyBytes.Length)
    }
    $stream.Flush()
}

function Send-HttpJson($stream, $data, [int]$statusCode = 200) {
    $jsonString = $data
    if ($data -isnot [string]) {
        $jsonString = $data | ConvertTo-Json -Depth 10 -Compress
    }
    if ($jsonString -is [string]) {
        $jsonString = $jsonString.TrimStart([char]0xFEFF)
    }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    $bytes = $utf8NoBom.GetBytes($jsonString)
    Send-HttpBytes $stream $statusCode "OK" "application/json; charset=utf-8" $bytes
}

# Main request loop
while ($true) {
    try {
        $client = $tcpListener.AcceptTcpClient()
        $stream = $client.GetStream()
        $stream.ReadTimeout = 60000
        $stream.WriteTimeout = 60000
        
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
        $requestLine = $reader.ReadLine()
        
        if (-not $requestLine) {
            $client.Close()
            continue
        }

        $parts = $requestLine -split ' '
        $httpMethod = $parts[0].ToUpper()
        $fullPath = if ($parts.Count -gt 1) { $parts[1] } else { "/" }
        
        $pathTokens = $fullPath -split '\?'
        $localPath = [System.Net.WebUtility]::UrlDecode($pathTokens[0])
        $queryString = if ($pathTokens.Count -gt 1) { $pathTokens[1] } else { "" }

        # Read Request Headers
        $contentLength = 0
        $expect100 = $false
        while (($hLine = $reader.ReadLine()) -and $hLine.Trim() -ne '') {
            if ($hLine -match '(?i)Content-Length:\s*(\d+)') {
                $contentLength = [int]$matches[1]
            }
            if ($hLine -match '(?i)Expect:\s*100-continue') {
                $expect100 = $true
            }
        }

        if ($expect100) {
            $continueHeader = [System.Text.Encoding]::ASCII.GetBytes("HTTP/1.1 100 Continue`r`n`r`n")
            $stream.Write($continueHeader, 0, $continueHeader.Length)
            $stream.Flush()
        }

        # Read Request Body (if any)
        $body = ""
        if ($contentLength -gt 0) {
            $charBuffer = New-Object char[] $contentLength
            $totalRead = 0
            while ($totalRead -lt $contentLength) {
                $read = $reader.Read($charBuffer, $totalRead, $contentLength - $totalRead)
                if ($read -le 0) { break }
                $totalRead += $read
            }
            $body = New-Object string ($charBuffer, 0, $totalRead)
        }

        # ----------------------------------------------------------------------
        # CORS Preflight
        # ----------------------------------------------------------------------
        if ($httpMethod -eq "OPTIONS") {
            Send-HttpBytes $stream 204 "No Content" "text/plain" $null
            $client.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # REST API: /api/server-info
        # ----------------------------------------------------------------------
        if ($localPath -eq "/api/server-info" -and $httpMethod -eq "GET") {
            $info = @{
                localIP = $localIP
                port = $Port
                urlLocal = $urlLocal
                urlLan = $urlLan
                serverTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            }
            Send-HttpJson $stream $info
            $client.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # REST API: /api/fetch-shopee-menu
        # ----------------------------------------------------------------------
        if ($localPath -eq "/api/fetch-shopee-menu" -and $httpMethod -eq "POST") {
            try {
                $reqObj = $body | ConvertFrom-Json
                $targetUrl = if ($reqObj.url) { $reqObj.url } else { "" }

                if (-not $targetUrl) {
                    Send-HttpJson $stream @{ success = $false; message = "Vui lòng nhập đường link ShopeeFood của quán." } 400
                } else {
                    $scrapeRes = Fetch-ShopeeFoodMenu $targetUrl
                    Send-HttpJson $stream $scrapeRes
                }
            } catch {
                Send-HttpJson $stream @{ success = $false; message = "Lỗi khi trích xuất thực đơn: $($_.Exception.Message)" } 500
            }
            $client.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # REST API: /api/sync-check
        # ----------------------------------------------------------------------
        if ($localPath -eq "/api/sync-check" -and $httpMethod -eq "GET") {
            $lastMod = if (Test-Path $ordersFile) { (Get-Item $ordersFile).LastWriteTimeUtc.Ticks } else { 0 }
            $restLastMod = if (Test-Path $restaurantsFile) { (Get-Item $restaurantsFile).LastWriteTimeUtc.Ticks } else { 0 }
            $res = @{
                ordersLastModified = $lastMod
                restaurantsLastModified = $restLastMod
                localIP = $localIP
                urlLan = $urlLan
                serverTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            }
            Send-HttpJson $stream $res
            $client.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # REST API: /api/restaurants
        # ----------------------------------------------------------------------
        if ($localPath -eq "/api/restaurants") {
            if ($httpMethod -eq "GET") {
                $content = if (Test-Path $restaurantsFile) { Read-Utf8Text $restaurantsFile } else { "[]" }
                if (-not $content -or $content.Trim() -eq "") { $content = "[]" }
                Send-HttpJson $stream $content
                $client.Close()
                continue
            }
            elseif ($httpMethod -eq "POST") {
                $newRest = $body | ConvertFrom-Json
                $existingContent = Read-Utf8Text $restaurantsFile
                $restaurants = if ($existingContent -and $existingContent.Trim() -ne "") { $existingContent | ConvertFrom-Json } else { @() }
                if ($restaurants -isnot [System.Collections.IEnumerable]) {
                    $restaurants = @($restaurants)
                }

                $idx = -1
                for ($i = 0; $i -lt $restaurants.Count; $i++) {
                    if ($restaurants[$i].id -eq $newRest.id -or ($newRest.shopeeUrl -and $restaurants[$i].shopeeUrl -eq $newRest.shopeeUrl)) {
                        $idx = $i
                        break
                    }
                }

                if ($idx -ge 0) {
                    $restaurants[$idx] = $newRest
                } else {
                    $restaurants += $newRest
                }

                $updatedJson = ConvertTo-Json -InputObject @($restaurants) -Depth 10
                if ($restaurants.Count -eq 1 -and -not $updatedJson.Trim().StartsWith("[")) {
                    $updatedJson = "[$updatedJson]"
                }
                Write-Utf8Text $restaurantsFile $updatedJson
                
                Send-HttpJson $stream @{ success = $true; message = "Đã lưu quán ăn thành công"; restaurant = $newRest }
                $client.Close()
                continue
            }
        }

        # ----------------------------------------------------------------------
        # REST API: /api/orders
        # ----------------------------------------------------------------------
        if ($localPath -eq "/api/orders") {
            if ($httpMethod -eq "GET") {
                $content = if (Test-Path $ordersFile) { Read-Utf8Text $ordersFile } else { "[]" }
                if (-not $content -or $content.Trim() -eq "") { $content = "[]" }
                Send-HttpJson $stream $content
                $client.Close()
                continue
            }
            elseif ($httpMethod -eq "POST") {
                $newOrder = $body | ConvertFrom-Json
                $existingContent = Read-Utf8Text $ordersFile
                $orders = if ($existingContent -and $existingContent.Trim() -ne "") { $existingContent | ConvertFrom-Json } else { @() }
                if ($orders -isnot [System.Collections.IEnumerable]) {
                    $orders = @($orders)
                }

                $orderId = if ($newOrder.PSObject.Properties['id'] -and $newOrder.id) { $newOrder.id } else { "ord_" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString() + "_" + (Get-Random -Minimum 1000 -Maximum 9999) }
                $orderCreated = if ($newOrder.PSObject.Properties['createdAt'] -and $newOrder.createdAt) { $newOrder.createdAt } else { (Get-Date).ToString("o") }
                
                $newOrder | Add-Member -NotePropertyName "id" -NotePropertyValue $orderId -Force
                $newOrder | Add-Member -NotePropertyName "createdAt" -NotePropertyValue $orderCreated -Force

                $idx = -1
                for ($i = 0; $i -lt $orders.Count; $i++) {
                    if ($orders[$i].id -eq $newOrder.id) {
                        $idx = $i
                        break
                    }
                }

                if ($idx -ge 0) {
                    $orders[$idx] = $newOrder
                } else {
                    $orders += $newOrder
                }

                Save-OrdersArray @($orders) $ordersFile | Out-Null

                Send-HttpJson $stream @{ success = $true; message = "Đã đặt món thành công"; order = $newOrder }
                $client.Close()
                continue
            }
            elseif ($httpMethod -eq "DELETE") {
                $orderId = ""
                if ($queryString -match '(?i)id=([^&]+)') {
                    $orderId = [System.Net.WebUtility]::UrlDecode($matches[1])
                }

                if ($orderId) {
                    $existingContent = Read-Utf8Text $ordersFile
                    $orders = if ($existingContent -and $existingContent.Trim() -ne "") { $existingContent | ConvertFrom-Json } else { @() }
                    if ($orders -isnot [System.Collections.IEnumerable]) {
                        $orders = @($orders)
                    }

                    $remainingOrders = @($orders | Where-Object { $_.id -ne $orderId })
                    Save-OrdersArray $remainingOrders $ordersFile | Out-Null

                    Send-HttpJson $stream @{ success = $true; message = "Đã xóa món thành công"; count = $remainingOrders.Count }
                    $client.Close()
                    continue
                }
            }
        }

        # ----------------------------------------------------------------------
        # REST API: /api/orders/clear
        # ----------------------------------------------------------------------
        if ($localPath -eq "/api/orders/clear" -and $httpMethod -eq "POST") {
            Write-Utf8Text $ordersFile "[]"
            Send-HttpJson $stream @{ success = $true; message = "Đã làm mới danh sách đơn hàng" }
            $client.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # REST API: Unhandled /api/* routes
        # ----------------------------------------------------------------------
        if ($localPath.StartsWith("/api/")) {
            Send-HttpJson $stream @{ success = $false; message = "API endpoint not found: $localPath" } 404
            $client.Close()
            continue
        }

        # ----------------------------------------------------------------------
        # PHỤC VỤ STATIC FILES (.html, .css, .js, .png, etc.)
        # ----------------------------------------------------------------------
        if ($localPath -eq "/" -or $localPath -eq "") {
            $localPath = "/index.html"
        }

        $relPath = $localPath.TrimStart('/').Replace('/', '\')
        $filePath = Join-Path $baseDir $relPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = $mimeTypes[$ext]
            if (-not $contentType) {
                $contentType = "application/octet-stream"
            }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            Send-HttpBytes $stream 200 "OK" $contentType $bytes
        } else {
            $msgBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
            Send-HttpBytes $stream 404 "Not Found" "text/plain; charset=utf-8" $msgBytes
        }

        $client.Close()
    } catch {
        try { if ($client) { $client.Close() } } catch {}
    }
}