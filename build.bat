@@:: .\build.bat -s .\_template\default.markdown -o index.html -t .\_template\templates\default.html
@@:: This prolog allows a PowerShell script to be embedded in a .CMD file.
@@:: Any non-PowerShell content must be preceeded by "@@"
@@setlocal
@@set POWERSHELL_BAT_ARGS=%*
@@if defined POWERSHELL_BAT_ARGS set POWERSHELL_BAT_ARGS=%POWERSHELL_BAT_ARGS:"=\"%
@@PowerShell -noprofile -Command Invoke-Expression $('$args=@(^&{$args} %POWERSHELL_BAT_ARGS%);'+[String]::Join(';',$((Get-Content '%~f0') -notmatch '^^@@')))
@@copy /y index.html index.hta
@@goto :EOF
Set-ExecutionPolicy Bypass -Scope Process -Force
$DEFAULT_TEMPLATE = "_template/templates/default.html"
$DEFAULT_OUTPUT_FILEEXT = "html"
$DEFAULT_HEADER = "_common/templates/header.html"
$DEFAULT_CSS = "_common/templates/default.css"
$DEFAULT_DOC_ROOT="."
$t=1
$pandoc = 'pandoc'
$pp = 'pp'
$params=@{'--source|-s$' =  "[some/markdown/file.md,some/other/markdown/file2.md,includes/*]";
'--output|-o$' =  "[some/output/file.html]";
'--css|-c$' =  "[some/style.css]";
'--docroot|-r$' =  "[some/path]";
'--template|-t$' =  "[some/template/file.html]";
'--header|-H$' =  "[some/header.html]";
'--ppvars|-p$' =  "[some_preprocess_var=somevalue]";
'--vars|-V$' =  "[some_pandoc_var=somevalue]";
'--metavars|-m$' =  "[some_pandoc_meta_var=somevalue]";
'--watchdir|-d$' =  "[somedir]";
'--watch|-w$' =  "Enable watch mode";
'--patterns|-wp$' =  "[somefile1.md,somefile2.html,*.txt,*.md,*.js,*.etc]";
'--interval|-i$' =  "[t>0]";
'--no-aio|-aio$' =  "No All-In-One";
'--help|-h$' =  "display usage and exit";
'--dry|-y$' =  "Dry Run";
'--subprocess|-sub$' =  "Script has been launched in subprocess mode";
'--verbose$' =  "Verbose";
}
FUNCTION Usage {
    WRITE-HOST "Usage: build.bat"
	FOREACH ($param in $params.Keys) { 
		"param: '{0}' help: '{1}'" -f $param,$params[$param]
	}    	 
}
$i=0 
If (-Not $($ARGS)){
	Usage
	Exit
}
ForEach ($ARG In $ARGS) {
	$ArgValue = $($ARGS[$i+1])
	ForEach ($param In $params.Keys) {
		If ($ARG -cmatch $param){
			If (-Not $ArgValue){
				try{
					$expression = "`$$($param.substring(0,$param.lastindexOf('|')).replace('-','')) = 'True'"
				} catch {
					Write-Host "Encountered an error in processing $param`: If this is a switch, make sure it is of the form '--switch|-s'"
					Exit
				}
			} else {
				try{
					$paramvar = $($param.substring(0,$param.lastindexOf('|')).replace('-',''))
				} catch {
					"Encountered an error in processing $param`: Value provided was $ArgValue"
					Exit
				}
				$expression = "If ( `"$paramvar`" -cmatch 'var') { `$$paramvar += '$($ArgValue)_@DELIM@_' } else { `$$paramvar = '$($ArgValue)' }"
			}
			Invoke-Expression $expression
		}
	}
	$i++
}


$noaio = True;
$verbose = True;



@@:: Show Help If Applicable
If ($help) { Usage }

ForEach ($binary in 'pandoc','pp') {
	
	If ( get-command $binary -ErrorAction silentlycontinue ){
		Invoke-Expression "`$$binary = `$(get-command $binary).Path"
	} ElseIf ( Test-Path "$($PWD.PATH)\$($binary).exe" ) {
		Invoke-Expression "`$$binary = `"$($PWD.PATH)\$binary.exe`""
	}

}

@@:: Check for required binaries
Write-Host "Checking for reqiured binaries ..."
If ( -Not (Test-Path $pandoc) -or -Not (Test-Path $pp) ) { 
	"Error: Neither pp nor pandoc were found in your path or in the current working directory"
	Exit
} else {
	Write-Host "Found both $($pandoc) and $($pp), proceeding ..."
}

@@:: Build pre-processor commands
$pp_commands = "&$($pp) "
If ( $ppvars ) {
    $ppvars = $ppvars.replace("_@DELIM@_"," -D ")
    $pp_commands = "$($pp_commands) -D $($ppvars.Substring(0,$ppvars.Length-3)) "    
}
$pp_commands += "$source "
@@:: Build pandoc commands
$output_file = If ($output) {$output} Else {"$($source.substring(0,$source.lastindexOf("."))).$($DEFAULT_OUTPUT_FILEEXT)"}
$pandoc_commands = "$pandoc "
$pandoc_commands += "-o '$output_file' "
$css = If ($css) {$css} Else {$DEFAULT_CSS}
$pandoc_commands += "-c '$css' "
$header = If ($header) {$header} Else {$DEFAULT_HEADER}
$pandoc_commands += "-H '$header' "
$template = If ($template) {$template} Else {$DEFAULT_TEMPLATE}
$pandoc_commands += "--template $template "
If ($vars) {
	If ($vars -cmatch "_@DELIM@_"){
		$vars = $vars.replace("_@DELIM@_"," -V ")
		$pandoc_commands += "-V $($vars.Substring(0,$vars.Length-3)) "
	} else {
		$pandoc_commands += "-V $vars "
	}
}
$docroot = If ($docroot) {$docroot} Else {$DEFAULT_DOC_ROOT}
$pandoc_commands += "-V docroot=$($docroot) "
If ($metavars) {
	$metavars = $metavars.replace("_@DELIM@_"," --metadata ")
	$pandoc_commands += "--metadata $($metavars.Substring(0,$metavars.Length-11)) "
}

@@:: Check if we want a non-all-in-one document
@@:: If ( -Not $noaio ) {
@@:: 	$pandoc_commands += "--self-contained "
@@:: 	$pandoc_commands += " --standalone "
@@:: }

@@:: verbose
If ( $verbose ) {
	$pandoc_commands += " --verbose "
}

@@:: Echo commands if this is a Dry Run
If ($dry) {
	Write-Host "$pp_commands | $pandoc_commands"

} else {

	FUNCTION build {
		try{
			"Invoking build commands."
			Invoke-Expression "$($pp_commands) | $($pandoc_commands)"		
		} catch {
			"Build failed. Exception during execution of commands`:"
			"$($pp_commands) | $($pandoc_commands)"
			"Errors`:"
			$_.Exception
			Exit 1
		}	

		If ($LASTEXITCODE -ne 0){
			"Build failed. Command exception during execution`:"
			"$($pp_commands) | $($pandoc_commands)"
			Exit 1
		} Else {
			"Done. Output file is $output_file"
			Exit 0
		}	
	}

	If ( $watch -and -not $subprocess) {
	    Write-Host "Watching for changes against $($patterns)"
	    &watchmedo shell-command  --patterns="$($patterns)" --recursive --command="""build.bat $($ARGS) --subprocess"""
	} else {
		build
	}

}
