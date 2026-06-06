$outputDir = Join-Path (Get-Location) "../public/assets/tech-logos"
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

$items = @(
    @{ Name = "python"; Slug = "python" },
    @{ Name = "tensorflow"; Slug = "tensorflow" },
    @{ Name = "pytorch"; Slug = "pytorch" },
    @{ Name = "openai"; Slug = "openai" },
    @{ Name = "aws"; Slug = "amazonwebservices" },
    @{ Name = "google-cloud"; Slug = "googlecloud" },
    @{ Name = "azure"; Slug = "azure" },
    @{ Name = "kubernetes"; Slug = "kubernetes" },
    @{ Name = "docker"; Slug = "docker" },
    @{ Name = "react"; Slug = "react" },
    @{ Name = "nodejs"; Slug = "nodedotjs" },
    @{ Name = "postgresql"; Slug = "postgresql" },
    @{ Name = "mongodb"; Slug = "mongodb" },
    @{ Name = "spark"; Slug = "apachespark" },
    @{ Name = "huggingface"; Slug = "huggingface" },
    @{ Name = "langchain"; Slug = "langchain" },
    @{ Name = "scikit-learn"; Slug = "scikitlearn" },
    @{ Name = "keras"; Slug = "keras" }
)

Write-Host "Downloading tech logos to $outputDir`n"

foreach ($item in $items) {
    $filepath = Join-Path $outputDir "$($item.Name).svg"
    $url = "https://cdn.simpleicons.org/$($item.Slug)"
    Write-Host "  $($item.Name)... " -NoNewline
    try {
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -OutFile $filepath
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAIL $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone - $($items.Count) logos downloaded"