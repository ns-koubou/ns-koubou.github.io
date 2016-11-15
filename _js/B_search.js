(function() {
  var initSearch, initialize;

  initialize = function() {
    var containerElem, footerElem, toolbarElem;
    containerElem = document.getElementById('container');
    footerElem = document.getElementById('footer');
    toolbarElem = document.getElementById('toolbar');
    containerElem.style.minHeight = (window.innerHeight - footerElem.offsetHeight - toolbarElem.offsetHeight) + "px";
    window.onresize = function() {
      return containerElem.style.minHeight = (window.innerHeight - footerElem.offsetHeight - toolbarElem.offsetHeight) + "px";
    };
    return initSearch();
  };

  initSearch = function() {
    var resultsElem, resultsMenu, searchInputElem;
    searchInputElem = document.getElementById('search-input');
    resultsElem = document.getElementById('search-results');
    resultsMenu = new MaterialMenu(resultsElem);
    resultsMenu.forElement_ = searchInputElem;
    searchInputElem.onkeyup = function() {
      return resultsMenu.show();
    };
    searchInputElem.onBlur = function() {
      return resultsMenu.hide();
    };
    return SimpleJekyllSearch({
      searchInput: searchInputElem,
      resultsContainer: resultsElem,
      json: '/search.json',
      searchResultTemplate: '<a class="mdl-menu__item" href="{url}">{title}</a>',
      noResultsText: '<a class="mdl-menu__item" disabled>No results.</a>'
    });
  };

  initialize();

}).call(this);
