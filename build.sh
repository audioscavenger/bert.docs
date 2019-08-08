#!/usr/bin/env bash

# Declare defaults
PREFIX="eval"
DEFAULT_TEMPLATE=_template/templates/default.html
DEFAULT_HEADER=_common/templates/header.html
DEFAULT_CSS=_common/templates/default.css
DEFAULT_DOC_ROOT=.
DELIM=_@DELIM@_
t=1
help(){
    #
    # Display Help/Usage
    #
    echo -e "Usage: ${0}"
    for param in "${!params[@]}";do
        echo "param: ${param}, help: ${params[${param}]}"
    done
    exit
}
# Declare accepted parameters
declare -A params=(
["--source|-s$"]="[some/markdown/file.md,some/other/markdown/file2.md,includes/*]"
["--output|-o$"]="[some/output/file.html]"
["--css|-c$"]="[some/style.css]"
["--docroot|-r$"]="[some/path]"
["--template|-t$"]="[some/template/file.html]"
["--header|-H$"]="[some/header.html]"
["--ppvars|-p$"]="[some_preprocess_var=somevalue]"
["--help|-h$"]="display usage and exit"
["--vars|-V$"]="[some_pandoc_var=somevalue]"
["--metavars|-m$"]="[some_pandoc_meta_var=somevalue]"
["--watchdir|-wd$"]="[somedir]"
["--watch|-w$"]="Enable Watch Mode"
["--patterns|-wp$"]="[somefile1.md,somefile2.html,*.txt,*.md,*.js,*.etc]"
["--interval|-i$"]="[t>0]"
["--no-aio|-aio$"]="No All-In-One"
["--dry"]="Dry Run"
)
# Display help if no args
if [[ $# -lt 1 ]];then help;fi
# Parse arguments
while (( "$#" )); do
    for param in "${!params[@]}";do
        if [[ "$1" =~ $param ]]; then
            var=${param//-/}
            eval "if [[ (${var%|*} =~ .*var.*) ]];then declare ${var%|*}+='${2}${DELIM}';else ${var%|*}=${2-true};fi;"
        fi
    done
shift
done
# Display help if applicable
if [[ -n $help ]];then help;fi
# DRY RUN LOGIC
if [[ -n $dry ]];then 
    PREFIX=echo
fi

# Parse file watcher patterns
if [[ -n $watch ]];then
    if [[ "${patterns}" =~ .*, ]];then 
        for pattern in ${patterns//,/ };do
            watch_patterns+="'${pattern}',"
        done
        watch_patterns=" -name ${watch_patterns//,/ -o -name }"
        option='-o -name '
        watch_patterns="${watch_patterns: :-${#option}}" # strip the trailing option
    else 
        watch_patterns=" -name ${patterns}"
    fi
fi
# Build pre-processor commands
pp_commands="pp "
if [[ -n $ppvars ]];then
    if [[ $ppvars =~ .*${DELIM}.* ]];then
        ppvars=${ppvars//${DELIM}/ -D }
        pp_commands+="-D ${ppvars: :-3} "
    else
        pp_commands+="-D $ppvars "
    fi
fi
pp_commands+="${source} "
# Build pandoc commands
output_file=${output-${source%.*}.html}
pandoc_commands="pandoc "
pandoc_commands+="-o '${output_file}' "
pandoc_commands+="-c '${css-${DEFAULT_CSS}}' "
pandoc_commands+="-H '${header-${DEFAULT_HEADER}}' "
pandoc_commands+="--template ${template-${DEFAULT_TEMPLATE}} "
if [[ $vars ]];then
    vars=${vars//${DELIM}/ -V }
    option='-V '
    pandoc_commands+="-V ${vars: :-${#option}} " # strip the trailing option
fi
pandoc_commands+="-V docroot=${docroot-${DEFAULT_DOC_ROOT}} "
if [[ $metavars ]];then
    metavars=${metavars//${DELIM}/ --metadata }
    option="--metadata "
    pandoc_commands+="--metadata ${metavars: :-${#option}} " # strip the trailing option
fi
if [[ -z $noaio ]];then 
    pandoc_commands+="--self-contained "
    pandoc_commands+=" --standalone "
fi
# Build output file
if [[ -n $watch_patterns ]];then
    echo "Issuing initial build"
    # Invoke markdown pre-processor & pipe to pandoc
    if $PREFIX "${pp_commands} | ${pandoc_commands}";then
        echo "Done. Initial output file is ${output_file}."
    else
        echo "Build failed."
        exit 1
    fi
    if [[ $PREFIX == 'eval' ]];then
    echo "Watching for changes"
    watchmedo shell-command \
      --patterns="${watch_patterns}" \
      --recursive \
      --command="""$PREFIX "${pp_commands} | ${pandoc_commands}""""
    fi
else
    echo "Issuing build"
    if $PREFIX "${pp_commands} | ${pandoc_commands}";then
        echo "Done. Output file is ${output_file}"
    else
        echo "Build failed."
        exit 1
    fi
fi