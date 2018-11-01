/// <reference path="../../../js/jquery.min.js" />
var currentLangauge;
var appFacebookID = '1327277757397665';
var appFacebookSecretLocal = '1267b51548a791c9fe1552d1ce3824ba';
var facebookVersion = 'v2.10';
var localGoogleAppClientID = '807047009507-86thjjkclif9blpeq7asit8k1b44jigg.apps.googleusercontent.com';
var googleAppClientID = '786343369128-vdrqklrhlcsf4ko2gcmthsf5tc816147.apps.googleusercontent.com';
var defaultPathForDoctorArea = "/doctor-site/"; 
var defaultPathAdvices = "/advices/";
var defaultPathSpecialities = "/All-specialities/";
var defaultPathSearch = "/Advanced-search/";
var defaultPathSpecialitiesGetData = "/All-specialities/specialities/";
var defaultPathPatients = "/user/";
var defaultPathForDoctorPage = "/doctor-page/";
var defaultPathUsers = "/";
var doctorPersonalImgPath = "/Areas/doctors/doctorImages/";
var defaultPathDoctorReservingPage = "/reserving/doctor/";
var defaultPathReservation = "/reserving";
var defaultPathAdvices = "/advices/";
var maxOfCardNumbersForSearchPage =9;//maximum number of cards that will be visible for one page
var numberOfPaginationLinks = 10;//number of links that will be show for pagination
var defaultPageSizeForComments = 5;
var defaultPageSizeForAdvices = 5;
var defaultPageSizeForAdviceComments = 5;
var defaultPageSizeForPatientViews = 5;
var IsMainJsLoaded = false;
var loadScripts = $.Deferred();
var onMainJsLoad;
var gotoLoginPage =function () {
        window.open(defaultPathPatients + 'login', '_blank', '', '');
    }
$(function () {
    currentLangauge = $('body').attr('lang');
    $.ajaxSetup({
        cache: true
    });
    /*header*/
    $('form#searchForm .dropdown>button').click(function () {
        $('form#searchForm .dropdown').find('button.dropdown-toggle').attr('data-toggle', 'dropdown');
        if ($(window).width() > 767) {
            makeScrollTop(0);
        }
    });
    $('#submitSearchButton').bind('touch click', function () {
        validateFastSearchForm(this);
    });
    /*header*/
    /*after loading secNav.js then load mainJs then load lnaguage js then load patient js*/
    var scriptLangName = (currentLangauge == "en") ? "en-US-Js.js" : "ar-EG-JS.js";
    loadScripts.then(loadLocalScript('/Areas/users/js/secNav.js'))
    .then(loadLocalScript('/Areas/users/js/' + scriptLangName))
    .then(loadLocalScript('/Areas/users/js/mainJS.js', function (isLoaded) {
        if (isLoaded) IsMainJsLoaded = true;
        if (typeof (onMainJsLoad) == "function") onMainJsLoad();
    }))
    .then(loadLocalScript('/Areas/users/js/patient.js'));
    //all required scripts has been loaded 
    var inputsDate = $('[type="date"]');
    for (var i = 0; i < inputsDate.length; i++) {
        var inp = inputsDate.eq(i);
        if ($(inp).prop('type') != 'date') {
            loadScripts
            .then(loadLocalScript("/jqueryUiCss", function (loaded) {
                loadLocalScript("/jqueryUiJs")
                $(inputsDate).datepicker({
                    dateFormat: "yyyy-mm-dd",
                });
            }),
                  $.getScript("https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/i18n/jquery-ui-i18n.min.js", function () {
                      $.datepicker.setDefaults($.datepicker.regional[currentLangauge]);
                  }));
            break;
        }
    }
    if (inputsDate.length > 0) {
        if ($(inputsDate).eq(0).prop('type') != 'date')
        {
            alert('this is old browser,please update your browser');
        }      
    }
});
function loadLocalScript(path,callBack)
{
    $.getScript(location.protocol + '//' + location.host + path, function () { if (typeof (callBack) == "function") {callBack(true); } })
    .fail(function (e) { if (typeof (callBack) == "function") {callBack(false); } });
}
/*search bar*/
function setSelectedSearchValue(liContext) {
    var li = $(liContext);
    li.parents('.dropdown').find('button.dropdown-toggle').attr('data-toggle', 'dropdown');
    var idValue = li.data('value');
    var nameValue = li.data('name');
    $(li).parent().next().val(idValue);
    var defaultText = $(li).parent().siblings('.dropdown-toggle').find('.selectedValue').data('text');
    var cancelSelectedNameIcon = $('<i class="fa fa-close cancelSelectedName" data-text="' + defaultText + '"></i>');
    $(li).parent().siblings('.dropdown-toggle').find('.selectedValue').text(nameValue).append(cancelSelectedNameIcon);
    cancelSelectedNameIcon.click(function () {
        if (li.data('destricts')!=undefined)
        {
            updateDestrictsMenu(li.parent().eq(0));
        }
        $(li).parent().siblings('.dropdown-toggle').find('.selectedValue').text(defaultText);
        $(li).parent().next().val('');
        $(this).remove();
    });
}
function updateDestrictsMenu(context) {
    var destrictsID = $(context).data('destricts');
    var destrictsMenu = $('#destrictsMenu');
    var totalMatchedElements = 0;
    destrictsMenu.prev().find('.selectedValue').text(destrictsMenu.find('li').eq(0).data('name'));
    if (destrictsID == undefined) {
        destrictsMenu.find('li').show().removeClass('notMatched');
        return;
    }
    destrictsMenu.find('li').not(':first').each(function (i, li) {
        var destrictID = parseInt($(li).data('value'));
        if (destrictsID.indexOf(destrictID) == -1) {
            $(li).hide().addClass('notMatched');
        }
        else {
            $(li).show().removeClass('notMatched');
            totalMatchedElements += 1;
        }
    });
    if (totalMatchedElements <= 10) {
        destrictsMenu.find('.tarnslatePage').hide();
    }
}
function filterDoctors(context) {
    var value = $(context).val();
    var foundedResult = false;
    $(context).parents('.doctors').find('li.noResult').remove();
    var resetNamesToDefaults = function (lang) {
        var names = $(context).parents('.doctors')
            .find('li.noResult').remove().end()
            .find('li')
            .removeClass('hidden');
        names.each(function (i, li) {
            if (lang == "en") $(li).find('a').text($(li).data('nameeng'));
            else $(li).find('a').text($(li).data('namear'));
        });
    }
    var namesLi = $(context).parents('.doctors').find('li').not(':first');
    $(namesLi).each(function (i, li) {
        var nameAr = $(li).data('namear');
        var nameEng = $(li).data('nameeng');
        if (nameAr.indexOf(value) >= 0) {
            $(li).removeClass('hidden').find('a').text(nameAr);
            foundedResult = true;
        }
        else if (nameEng.indexOf(value) >= 0) {
            $(li).removeClass('hidden').find('a').text(nameEng);
            foundedResult = true;
        }
        else {
            $(li).addClass('hidden');
        }
    });
    if (value == "" || value.trim() == "") {
        resetNamesToDefaults(currentLangauge);
        foundedResult = true;
    }
    if (!foundedResult) {
        $(context).parents('.doctors').append("<li class='noResult'><a href='#'>" + language.noMathchedResult + "</a></li>");
    }
}
function validateFastSearchForm(buttonContext) {
    $(buttonContext).toggleIconWithLoadingImg();
    $('#searchForm').submit();
    localStorage.searchByPattern = false;
}
function setSearchedValuesPatternsToForms() {
    if (localStorage.searchByPattern == "true") {
        $('#fast-search input[name="q"]').val(localStorage.generalSearchValue);
    }
    else {
    }
}
function translateMenu(iconContext, dir) {
    iconContext = $(iconContext);
    iconContext.parents('.dropdown').find('button.dropdown-toggle').attr('data-toggle', '');
    iconContext.mouseleave(function () {
        $(this).parents('.dropdown').find('button.dropdown-toggle').attr('data-toggle', 'dropdown');
    });
    var li = iconContext.parents('.dropdown').find('ul li').not('.tarnslatePage,.default,.notMatched');
    var dropDownUl = $(li).parent();
    if (dropDownUl.data('currentpage') == undefined) {
        dropDownUl.data('currentpage', 1);
        dropDownUl.data('totalpages', parseInt(Math.ceil((dropDownUl.find(li).not('.notMatched').length - 2) / dropDownUl.data('pagelength'))));
    }
    if ((dir == -1 && dropDownUl.data('currentpage') == 1) || (dir == 1 && dropDownUl.data('currentpage') == dropDownUl.data('totalpages'))) return;
    var getNextPage = function () {
        li.addClass('hidden')
        var currentPage = dropDownUl.data('currentpage');
        var endPageIndex = (dir == 1)
            ? currentPage * dropDownUl.data('pagelength')
            : currentPage * dropDownUl.data('pagelength') - dropDownUl.data('pagelength') * 2;
        li.each(function (i, el) {
            if (i > (endPageIndex) && i < endPageIndex + dropDownUl.data('pagelength') + 1)
                $(el).removeClass('hidden');
        });
        dropDownUl.data('currentpage', currentPage += dir);
    }
    // li.slideToggle(500);
    getNextPage();
    // li.slideToggle(500)

}


