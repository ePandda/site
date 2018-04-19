var clearContent = function(divId){
	$('#' + divId).empty();
};
var addContent = function (contentId, targetId, rawHtml) {
  $('#' + targetId).append(rawHtml || $('#' + contentId).html());
};
var routing = function (mode) {
  router = new Navigo(null, mode === 'hash');
  router.on({
    'sandbox': function () {
      clearContent("content-body");
      addContent("component-headersmall", "content-body");
      addContent("component-nav", "content-body");
      addContent("content-sandbox", "content-body");
      addContent("component-footer", "content-body");
      window.scrollTo(0, 0);
      renderFormDropdown('#apiDropdownContainer', '#apiFormContainer');
	  renderForm('es_occurrences', '#apiFormContainer')

    },
    'documentation': function () {
      clearContent("content-body");
      addContent("component-headersmall", "content-body");
      addContent("component-nav", "content-body");
      addContent("content-documentation-header", "content-body");
      addContent("content-documentation", "content-body");
      addContent("content-documentation2", "content-body");
      addContent("component-footer", "content-body");
      window.scrollTo(0, 0);
    },
    'examples': function () {
      clearContent("content-body");
      addContent("component-headersmall", "content-body");
      addContent("component-nav", "content-body");
      addContent("content-examples", "content-body");
      addContent("component-footer", "content-body");
      window.scrollTo(0, 0);

	  initMap();
    },
    'about': function () {
      clearContent("content-body");
      addContent("component-headersmall", "content-body");
      addContent("component-nav", "content-body");
      addContent("content-about", "content-body");
      addContent("component-colorbars", "content-body");
      addContent("component-nsf", "content-body");
      addContent("component-footer", "content-body");
      window.scrollTo(0, 0);
    },
    'home': function () {
      clearContent("content-body");
      addContent("component-headerlarge", "content-body");
      addContent("component-nav", "content-body");
      addContent("content-home", "content-body");
      addContent("component-nowsearching", "content-body");
      addContent("component-colorbars", "content-body");
      addContent("component-nsf", "content-body");
      addContent("component-footer", "content-body");
      window.scrollTo(0, 0);
      getPhyloPics();

      setHomePageStats();
    }
  });
  router.on(function () {
	  clearContent("content-body");
      addContent("component-headerlarge", "content-body");
      addContent("component-nav", "content-body");
      addContent("content-home", "content-body");
      addContent("component-nowsearching", "content-body");
      addContent("component-colorbars", "content-body");
      addContent("component-nsf", "content-body");
      addContent("component-footer", "content-body");

      getPhyloPics();

      setHomePageStats();
  });
  router.resolve();
};

var init = function () {
  routing("hash");
};

window.onload = init;
