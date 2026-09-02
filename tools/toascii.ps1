# toascii.ps1 — convert an image to ASCII art
#
# Usage (PowerShell 5.1, run from repo root):
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\toascii.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\toascii.ps1 -InputPath photo.jpg -Width 100 -Gamma 1.2
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\toascii.ps1 -Crop 400,560,1107,1476 -OutputPath out.txt
#
# No OutputPath -> prints the ASCII art to stdout.
# -Crop minX,minY,maxX,maxY crops before conversion (values are pixels; empty = whole image).
# Ramp is ordered light-to-dark density: first char = darkest pixel, last char = brightest.

param(
    [string]$InputPath = "1773750338475.jpg",
    [string]$OutputPath = "",
    [int]$Width = 84,
    [double]$Gamma = 1.5,
    [double]$Aspect = 0.5,
    [string]$Ramp = " .:-=+*#%@",
    [double[]]$Crop = @()
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path -LiteralPath $InputPath)) {
    throw "Input image not found: $InputPath"
}

$img = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $InputPath).Path)

$minX = 0; $minY = 0
$maxX = $img.Width; $maxY = $img.Height
if ($Crop.Count -eq 4) {
    $minX = [Math]::Max(0, [int]$Crop[0]); $minY = [Math]::Max(0, [int]$Crop[1])
    $maxX = [Math]::Min($img.Width - 1, [int]$Crop[2]); $maxY = [Math]::Min($img.Height - 1, [int]$Crop[3])
}
$cw = $maxX - $minX + 1
$ch = $maxY - $minY + 1

$h = [int]($ch * $Width / $cw * $Aspect)
if ($h -lt 1) { $h = 1 }

# Box-sample the source so each cell averages a block of pixels (reduces noise)
$stepX = [Math]::Max(1, [int][Math]::Ceiling($cw / $Width / 2))
$stepY = [Math]::Max(1, [int][Math]::Ceiling($ch / $h / 2))

$samples = New-Object 'System.Single[,]' $Width, $h
$lums = New-Object System.Collections.ArrayList

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $Width; $x++) {
        $sx0 = $minX + [int]($x * $cw / $Width)
        $sy0 = $minY + [int]($y * $ch / $h)
        $sum = 0.0; $n = 0
        for ($dy = 0; $dy -lt $stepY; $dy++) {
            for ($dx = 0; $dx -lt $stepX; $dx++) {
                $sx = [Math]::Min($maxX, $sx0 + $dx)
                $sy = [Math]::Min($maxY, $sy0 + $dy)
                $c = $img.GetPixel($sx, $sy)
                $sum += (0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B)
                $n++
            }
        }
        $v = $sum / $n
        $samples[$x, $y] = $v
        [void]$lums.Add($v)
    }
}
$img.Dispose()

# Percentile contrast stretch (2%..98%) so the full character ramp gets used
$arr = $lums.ToArray()
[Array]::Sort($arr)
$lo = $arr[[int]($arr.Length * 0.02)]
$hiIdx = [Math]::Max(1, [int]($arr.Length * 0.98) - 1)
$hi = $arr[$hiIdx]
if ($hi - $lo -lt 1) { $hi = $lo + 1 }

$chars = $Ramp.ToCharArray()
$sb = New-Object System.Text.StringBuilder
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $Width; $x++) {
        $lum = ($samples[$x, $y] - $lo) / ($hi - $lo)
        $lum = [Math]::Min(1.0, [Math]::Max(0.0, $lum))
        $lum = [Math]::Pow($lum, $Gamma)
        $idx = [int]($lum * ($chars.Length - 1))
        [void]$sb.Append($chars[$idx])
    }
    [void]$sb.AppendLine()
}

$result = $sb.ToString()

if ($OutputPath -ne "") {
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $OutputPath), $result, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "wrote $OutputPath ($Width x $h)"
} else {
    Write-Output $result
}
