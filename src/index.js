var tscheme = require('../node_modules/tscheme/build/lib/main.js');
var $enter = document.getElementById("enter");
var $clean = document.getElementById("clean");
var $input = document.getElementById("input");
var $output = document.getElementById("output");

$enter.addEventListener("click", function() {
  if ($input.value) {
    try {
      var out = tscheme.evaluate($input.value);
      $input.value = "";
      if (out !== undefined) $output.innerHTML += out + "<br>"; 
    } catch(err) {
      $output.innerHTML += err.message + "<br>";
    }
  }
});

$clean.addEventListener("click", function() {
  $output.innerHTML = ""; 
});
