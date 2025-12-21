# PowerShell script to add footer.css link and update social links in all HTML files

$basePath = "c:\Users\Lenovo\Music\PJ-Pesisir-Barat\pesisir modif fix"

$files = @(
    'pariwisata.html', 'berita.html', 'event.html', 'informasi.html',
    'detail-wisata.html', 'detail-berita.html', 'detail-event.html', 'detail-informasi.html',
    'wisata-alam.html', 'wisata-budaya.html', 'wisata-kuliner.html',
    'visi-misi.html', 'pemerintahan.html', 'lambang.html',
    'profil_bupati.html', 'profil_wabup.html', 'search.html'
)

foreach ($file in $files) {
    $path = Join-Path $basePath $file
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -Encoding UTF8
        
        # 1. Add footer.css link if not present
        if ($content -notmatch 'footer\.css') {
            # Find last CSS link and add footer.css after it
            $content = $content -replace '(<link rel="stylesheet" href="[^"]+\.css"\s*/?>)(\s*)(<!--|\s*<meta)', '$1$2    <link rel="stylesheet" href="footer.css" />$2$3'
        }
        
        # 2. Update social icons
        $content = $content -replace '<a href="#"><img src="assets/youtube\.png" alt="yt" /></a>', '<a href="https://www.youtube.com/@pemkabpesisirbarat" target="_blank" title="YouTube"><img src="assets/youtube.png" alt="YouTube" /></a>'
        $content = $content -replace '<a href="#"><img src="assets/facebook\.png" alt="fb" /></a>', '<a href="https://www.facebook.com/diskominfokpb" target="_blank" title="Facebook"><img src="assets/facebook.png" alt="Facebook" /></a>'
        $content = $content -replace '<a href="#"><img src="assets/instagram\.png" alt="ig" /></a>', '<a href="https://www.instagram.com/pemkabpesisirbarat/" target="_blank" title="Instagram"><img src="assets/instagram.png" alt="Instagram" /></a>'
        $content = $content -replace '<a href="#"><img src="assets/twitter\.png" alt="tw" /></a>', '<a href="https://x.com/DiskominfoKPB" target="_blank" title="X (Twitter)"><img src="assets/twitter.png" alt="X" /></a>'
        
        # 3. Update WhatsApp number to hyperlink
        $content = $content -replace '<p><img src="assets/wa\.png" alt="" /> \+62 853-6998-9990</p>', '<p><a href="https://api.whatsapp.com/send?phone=6285369989990&text=Tabik%20Pun,%20Perkenalkan%20nama%20saya%20.........,%20......%3F" target="_blank"><img src="assets/wa.png" alt="" /> +62 853-6998-9990</a></p>'
        
        # 4. Update website link
        $content = $content -replace '<img src="assets/web\.png" alt="" /> https://pesisirbaratkab\.go\.id', '<img src="assets/web.png" alt="" /> <a href="https://pesisirbaratkab.go.id" target="_blank">https://pesisirbaratkab.go.id</a>'
        
        # 5. Update map to have link
        $content = $content -replace '<img src="assets/lokasi\.png" class="map-img" alt="Map" />', '<a href="https://maps.app.goo.gl/ZBy4RNMjZuUAs1yg7" target="_blank" title="Lihat di Google Maps"><img src="assets/lokasi.png" class="map-img" alt="Map" /></a>'
        
        # Write back
        Set-Content -Path $path -Value $content -Encoding UTF8
        Write-Host "Updated: $file"
    }
}

Write-Host "`nDone! All files updated."
