//------------------------------------------------------------------------------------------------------------------------------------------
/**
* For all html links (a) with class 'reference', if clicked, trigger another link as per the data-reference tag
*/
$( "a.reference" ).click(function() {
var reference=this.getAttribute('data-reference')
if (reference != null){
    console.log('Triggered ' + reference)
    $(reference).trigger('click');
}
});
/**
* For all html links (a) without a class or id, open the url as specified in the 'href' attribute
*/
// $( "a.weblink" ).click(function() {
$( "a:not([class])a:not([id]), a.uri" ).click(function() {
url = this.getAttribute('href')
if (url != null){
    openURL(url)
}
});
/**
* For all html links (a) with class 'powershell' invoke the powershell command encased in comment strings <!--POWERSHELLCODE-->
*/
$( "a.powershell" ).click(function() {
    
var command_string = ''
var test = this.innerHTML.match(/<!--[\s\S]*-->/)

if (test != null){
    var regex = /<!--|-->/gi;
    command_string = test[0].replace(regex,'')
}else {
    command_string = heredoc(function () {/*
    'You must specify powershell commands for this link by encasing these in comment strings'
        'e.g.'
        '<a href="#" class="powershell">'
        '<!--'
            'Hello World!'
        '-->'
        '</a>'
        &pause
    */}); 
    alert(command_string)   
    return
}

var pause=this.getAttribute('data-pause')
if (pause != 1){
    pause = 0
}

var interactive=this.getAttribute('data-interactive')
if (interactive != 0){
    interactive = 1
}

$(this).toggleClass('clicked');
powershell(command_string, interactive, pause);
$(this).toggleClass('clicked');

}); 
//------------------------------------------------------------------------------------------------------------------------------------------
/**
* For all html links (a) with class 'shell' invoke the shell as encased in comment strings <!--SHELL-->
*/
$( "a.shell" ).click(function() {
command_string = ''
var test = this.innerHTML.match(/<!--[\s\S]*-->/)
if (test != null){
    var regex = /<!--|-->/gi;
    command_string = test[0].replace(regex,'')
} 
var cmd_keep_open=$(this).data('cmdKeepOpen')
var cmd_new_window=$(this).data('cmdNewWindow')
var program_window_style=$(this).data('windowStyle')
var wait_for_exit=$(this).data('wait')
cmd_keep_open = (cmd_keep_open == 1) ? '/k':'/c'
cmd_new_window = (cmd_new_window == 1) ? 'start \"\"':''
// Specify WScript.Shell .Run parameters
// Read more: .Run - VBScript - SS64.com
// https://ss64.com/vb/run.html
program_window_style = (program_window_style != null) ? program_window_style:1
wait_for_exit = (wait_for_exit == 1) ? true:false
shell('cmd.exe', command_string, cmd_keep_open, cmd_new_window, program_window_style, wait_for_exit)
});
//------------------------------------------------------------------------------------------------------------------------------------------
/**
* For all html links (a) with class 'cmd' invoke the cmd command encased in comment strings <!--CMDCODE-->
*/
$( "a.cmd" ).click(function() {
command_string = ''
if (test != null){
    var regex = /<!--|-->/gi;
    command_string = test[0].replace(regex,'')
}else {
    command_string = heredoc(function () {/*
    'You must specify cmd commands for this link by encasing these in comment strings'
        'e.g.'
        '<a href="#" class="cmd">'
        '<!--'
            'Hello World!'
        '-->'
        '</a>'
        &pause
    */}); 
    alert(command_string)   
    return
}
cmd(command_string, 0);
});
//------------------------------------------------------------------------------------------------------------------------------------------
/**
* html link (a) with id 'powershell_hello' triggers a test powershell command
*/
$("#powershell_hello").click(function(e) {
    e.preventDefault();
    var command_string = heredoc(function () {/*
    'Hello from Powershell!'   
    */});
    powershell(command_string, 0);
});
/**
* For html links with class 'menu-toggle', if clicked, toggle the left navigation menu
*/
$("a.menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
/**
* For the html link with id 'about', if clicked, show the 'about' message
*/
$("a[id='about']").click(function(e) {
    console.log("clicked 'About' link")
    var test = this.innerHTML.match(/<!--[\s\S]*-->/)
    if (test != null){
        var regex = /<!--|-->/gi;
        about_string = test[0].replace(regex,'')
        alert(about_string)  
    }
}); 
/**
* For the html link with id 'home', if clicked, hide all divs with class 'section', show the div with id 'start'
*/
$( "a[id='home'], a[id='topnav-home']" ).click(function() {
    $(".section, section").hide();
    $("div#start").show();
});    
/**
* For html links with class 'section_link', if clicked, hide the div with id 'start', show the div we just clicked
*/
$( ".section_link" ).click(function() {
    $("div#start").hide();
    $(".section, section").hide();
    $("section#".concat(this.id)).show();
}); 
/**
* For html links with class 'flash', if clicked, flash the dom object as specified by the 'data-selector' html tag
*/
$( "a.flash" ).click(function() {
    var selector = this.getAttribute('data-selector')
    var duration = this.getAttribute('data-duration')
    if (duration == null){
        duration = 100
    }   
    if (selector != null){
        flash(selector, duration);
    }
});
/**
* For the html link with id 'console', if clicked, show the hta console
*/
$("a[id='console']").click(function(e) {
    htaConsole.toggle()
}); 
/**
* For the html link with id 'runas', if clicked, relaunch the HTA as admin
*/
$("a[id='elevate']").click(function(e) {
    run_as_admin()
}); 
//------------------------------------------------------------------------------------------------------------------------------------------