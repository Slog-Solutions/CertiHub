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

# Sample corners and borders to determine background luminance
$samples = @()
$stepX = [math]::Max(1, [int]($width / 10))
$stepY = [math]::Max(1, [int]($height / 10))

for ($x = 0; $x -lt $width; $x += $stepX) {
    $samples += $bmp.GetPixel($x, 0)
    $samples += $bmp.GetPixel($x, $height - 1)
}
for ($y = 0; $y -lt $height; $y += $stepY) {
    $samples += $bmp.GetPixel(0, $y)
    $samples += $bmp.GetPixel($width - 1, $y)
}

$bgLumSum = 0
$bgLumMax = 0
foreach ($c in $samples) {
    $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B
    $bgLumSum += $lum
    if ($lum -gt $bgLumMax) { $bgLumMax = $lum }
}
$bgLumAvg = $bgLumSum / [math]::Max(1, $samples.Count)

# Effective paper threshold
$bgThreshold = [math]::Max(150, [math]::Min($bgLumMax - 15, $bgLumAvg - 5))
$inkThreshold = [math]::Max(40, $bgThreshold - 50)

$outBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

$minX = $width; $maxX = 0; $minY = $height; $maxY = 0

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        $lum = 0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B

        if ($lum -ge $bgThreshold) {
            # Completely transparent background
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($lum -le $inkThreshold) {
            # Pure ink stroke: preserve pen color tone (blue/black), darken slightly for crisp contrast
            $r = [math]::Max(0, [int]($c.R * 0.75))
            $g = [math]::Max(0, [int]($c.G * 0.75))
            $b = [math]::Max(0, [int]($c.B * 0.75))
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        } else {
            # Smooth anti-aliased edge
            $alphaRatio = ($bgThreshold - $lum) / ($bgThreshold - $inkThreshold)
            $alpha = [int](255 * [math]::Max(0, [math]::Min(1, $alphaRatio)))
            $r = [math]::Max(0, [int]($c.R * 0.8))
            $g = [math]::Max(0, [int]($c.G * 0.8))
            $b = [math]::Max(0, [int]($c.B * 0.8))
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
    $pad = 20
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
