param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ArgsList
)

node "$PSScriptRoot\desktop\cli.js" @ArgsList
