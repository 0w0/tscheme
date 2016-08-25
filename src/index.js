var tscheme = require('../node_modules/tscheme/build/lib/main.js');
var $enter = document.getElementById("enter");
var $clear = document.getElementById("clear");
var $input = document.getElementById("input");
var $output = document.getElementById("output");

$enter.addEventListener("click", function() { eva(); });
$input.addEventListener("keypress", function(event) { if (event.keyCode === 13) eva() })
function eva() {
  if ($input.value) {
    try {
      var out = tscheme.evaluate($input.value);
      $input.value = "";
      if (out !== undefined) $output.innerHTML += out + "<br>"; 
    } catch(err) {
      $output.innerHTML += err.message + "<br>";
    }
    
    $output.scrollTop = $output.scrollHeight;
  }
}

$clear.addEventListener("click", function() {
  $output.innerHTML = ""; 
});
