Add-Type -AssemblyName System.Drawing

function Generate-FaviconPng {
    param([int]$size, [string]$outPath)
    
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background gradient: Indigo to Rose
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $color1 = [System.Drawing.Color]::FromArgb(255, 79, 70, 229)   # #4f46e5
    $color2 = [System.Drawing.Color]::FromArgb(255, 225, 29, 72)   # #e11d48
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $color1, $color2, 45.0)

    # Rounded squircle
    $radius = [int]($size * 0.25)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $d = $radius * 2
    $path.AddArc(0, 0, $d, $d, 180, 90)
    $path.AddArc($size - $d, 0, $d, $d, 270, 90)
    $path.AddArc($size - $d, $size - $d, $d, $d, 0, 90)
    $path.AddArc(0, $size - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    $g.FillPath($brush, $path)

    # Radar rings (white semi-transparent)
    $center = $size / 2
    $r1 = $size * 0.35
    $r2 = $size * 0.22
    $pen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 255, 255, 255), [Math]::Max(1.0, $size * 0.03))
    $pen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(110, 255, 255, 255), [Math]::Max(1.0, $size * 0.03))
    
    $g.DrawEllipse($pen1, [float]($center - $r1), [float]($center - $r1), [float]($r1 * 2), [float]($r1 * 2))
    $g.DrawEllipse($pen2, [float]($center - $r2), [float]($center - $r2), [float]($r2 * 2), [float]($r2 * 2))

    # Radar beam line from center to top right
    $penBeam = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 255, 255, 255), [Math]::Max(1.5, $size * 0.045))
    $penBeam.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penBeam.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $endX = $center + ($size * 0.26)
    $endY = $center - ($size * 0.26)
    $g.DrawLine($penBeam, [float]$center, [float]$center, [float]$endX, [float]$endY)

    # Cyan Hot Deal Blip
    $blipR = [Math]::Max(2.0, $size * 0.06)
    $blipBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 56, 189, 248))
    $g.FillEllipse($blipBrush, [float]($endX - $blipR), [float]($endY - $blipR), [float]($blipR * 2), [float]($blipR * 2))

    # Center Beacon
    $coreR = [Math]::Max(1.5, $size * 0.05)
    $coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($coreBrush, [float]($center - $coreR), [float]($center - $coreR), [float]($coreR * 2), [float]($coreR * 2))

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outPath ($size x $size)"
}

$pubDir = "d:\WEB\antigravity\affiliate\deals-portal\public"
Generate-FaviconPng -size 32 -outPath "$pubDir\favicon-32x32.png"
Generate-FaviconPng -size 192 -outPath "$pubDir\favicon-192x192.png"
Generate-FaviconPng -size 180 -outPath "$pubDir\apple-touch-icon.png"

# Also generate favicon.ico from 32x32 bitmap
$img32 = [System.Drawing.Bitmap]::FromFile("$pubDir\favicon-32x32.png")
$iconHandle = $img32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($iconHandle)
$stream = New-Object System.IO.FileStream("$pubDir\favicon.ico", [System.IO.FileMode]::Create)
$icon.Save($stream)
$stream.Close()
$img32.Dispose()
Write-Host "Generated favicon.ico successfully"
