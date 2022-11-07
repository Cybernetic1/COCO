// Language Switcher

// Initially, hide English version, default language = Chinese
$('[lang="EN"]').hide();

$('#switch-lang').click(function() {
  $('[lang="ZH"]').toggle();
  $('[lang="EN"]').toggle();
});
