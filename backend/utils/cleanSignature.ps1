param (
    [string]$InputPath,
    [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

if (![System.IO.File]::Exists($InputPath)) {
    Write-Error "Input file does not exist: $InputPath"
    exit 1
}

$bmp = [System.Drawing.Bitmap]::FromFile($InputPath)
$width = $bmp.Width
$height = $bmp.Height

# Find darkest ink luminance in the image
$minLum = 255
$stepScan = [math]::Max(1, [int]([math]::Min($width, $height) / 80))
for ($y = 0; $y -lt $height; $y += $stepScan) {
    for ($x = 0; $x -lt $width; $x += $stepScan) {
        $c = $bmp.GetPixel($x, $y)
        $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
        if ($lum -lt $minLum) { $minLum = $lum }
    }
}

# Strictly cap ink threshold at 80 to prevent paper shadows (>=90) from being included as ink
$inkThreshold = [math]::Max(35, [math]::Min(80, $minLum + 45))
$edgeBand = 15

$outBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$minX = $width; $maxX = 0; $minY = $height; $maxY = 0

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $bmp.GetPixel($x, $y)

        # CRITICAL: Keep already-transparent pixels transparent!
        if ($c.A -lt 20) {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            continue
        }

        $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B

        if ($lum -ge $inkThreshold) {
            # Completely transparent paper and shadows
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            # Ink stroke
            $alpha = 255
            if ($lum -gt ($inkThreshold - $edgeBand)) {
                $alphaRatio = ($inkThreshold - $lum) / $edgeBand
                $alpha = [int](255 * [math]::Max(0, [math]::Min(1, $alphaRatio)))
            }

            # Crisp authentic pen ink color (deep blue-black)
            $r = [math]::Min($c.R, 40)
            $g = [math]::Min($c.G, 40)
            $b = [math]::Min($c.B, 55)
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))

            if ($alpha -gt 40) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        }
    }
}

$bmp.Dispose()

# Auto-crop to content bounding box with comfortable padding
if ($maxX -gt $minX -and $maxY -gt $minY) {
    $pad = 24
    $cropX = [math]::Max(0, $minX - $pad)
    $cropY = [math]::Max(0, $minY - $pad)
    $cropW = [math]::Min($width - $cropX, ($maxX - $minX) + ($pad * 2))
    $cropH = [math]::Min($height - $cropY, ($maxY - $minY) + ($pad * 2))
    $rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $cropped = $outBmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $outBmp.Dispose()
    $outBmp = $cropped
}

# Ensure output directory exists
$outDir = [System.IO.Path]::GetDirectoryName($OutputPath)
if (![System.IO.Directory]::Exists($outDir)) {
    [System.IO.Directory]::CreateDirectory($outDir) | Out-Null
}

# Save as true 32-bit PNG
$outBmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$outBmp.Dispose()

Write-Output "Cleaned signature saved to $OutputPath"
