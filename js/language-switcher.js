// Language Switcher

// Initially, hide English version, default language = Chinese
$('[lang="en"]').hide();

$('#switch-lang').click(function() {
  $('[lang="zh"]').toggle();
  $('[lang="en"]').toggle();
});
