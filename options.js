$(function() {
  // i18n
  var userLang = navigator.language || navigator.userLanguage;
  console.log(userLang);

  // menu list
	$(".menu").on('click', 'a', function(e) {
    var selected = "selected";
    $(".mainview > *").removeClass(selected);

    $(".menu li").removeClass(selected);

    setTimeout(function() {
      $(".mainview > *:not(.selected)").css("display", "none")
    }, 100);

    $(e.currentTarget).parent().addClass(selected);

    var c = $($(e.currentTarget).attr("href"));

    c.css("display", "block");

    setTimeout(function() {
      c.addClass(selected)
    }, 0);

    setTimeout(function() {
      $("body").scrollTop = 0
    }, 200);
    return false;
  });
})