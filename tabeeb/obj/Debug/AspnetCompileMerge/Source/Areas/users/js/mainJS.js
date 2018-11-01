﻿/// <reference path="en-US-Js.js" />
/// <reference path="../../../js/jquery.min.js" />
/// <reference path="mainPage.js" />
/// <reference path="extension.js" />
$(function () {    
    $('.nav > li').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
    });   
    currentLangauge = $('body').attr('lang'); 
    startImageCarousel(); 
    //////////////////////////     
    $('.form-group').has('input[type="password"]').prepend('<i class="showPassword fa fa-eye fa-lg"></i>')
                    .css("position", "relative").end()
                    .find('.showPassword')
                    .click(function () { $(this).parents('.form-group').find('[name="password"]').togglePassowrdShow(); });
    /*advices page*/
    $('ul.selectDoctor li:not(.noResult)').mouseenter(function () { $(this).parent().prev().removeAttr('onblur'); });
    $('ul.selectDoctor li:not(.noResult)').mouseleave(function () { $(this).parent().prev().attr('onblur', '$(this).next().addClass("hidden")'); });
    /*advices page*/  
    $('.complainMessage').find('i.fa-close').click(function () { $(this).parent().fadeOut(); });
    /*register section*/
    $('.register-section .login-section .login-box .login form .form-group label').next('input').addClass("form-control");
    /*register section*/
    /*start scroll botton*/
    var scrollDown = $('.reserving .scroll-btn i');
    scrollDown.click(function () {
        var pageHeight = $('body').height();
        $('body,html').animate({ scrollTop: pageHeight }, 2000);
    });

    var scrollUp = $('.scroll-btn i');
    scrollUp.click(function () {
        var scrollUp = $(window).scrollTop();
        if (scrollUp > 500)
            $('html,body').animate({ scrollTop: 0 }, 2000);
    });

    /*end scroll button*/
    /*start speciality section*/
    var leaved = false;
    $('.specialities .speciality').bind('mouseenter mouseleave', function (ev) {
        leaved = false;
        if (ev.type == 'mouseenter') {
            $(this).parents('.specialities').find('.speciality .overlay').stop().css('height','0%').end().find('a.btn').hide();
            var specialityOverlay = $(this).find('.overlay');
            var specialityButton = $(this).find('a.btn');
            $(specialityOverlay).animate({ 'height': '96%' }, 1000, function () {
                $(specialityButton).fadeIn();
            });
        }
        else if (ev.type == "mouseleave") {
            var specialityOverlay = $(this).find('.overlay');
            var specialityButton = $(this).find('a.btn');
            specialityOverlay.animate({ 'height': '0%' }, 1000, function () {
                specialityButton.fadeOut();
            });
        }
    });
    /*end speciality section*/
});/*end jquery function*/
/*general functions*/
function getStart(controller) {
    controllerName = controller;
}
function callAjax(ajUrl, ajData, ajType, ajContenttype, ajDataType, ajSuccessFunc, ajErrorFunc) {
    $.ajax({
        url: ajUrl,
        data: ajData,
        type: ajType,
        contentType: ajContenttype,
        dataType: ajDataType,
        success: function (result) {
            if (ajSuccessFunc == undefined) return;
            ajSuccessFunc(result);
        },
        error: function (errormessage) {
            if (ajErrorFunc == undefined) return;
            ajErrorFunc(errormessage);
        }
    });
}
function isArabic(strInput) {
    var arregex = /[\u0600-\u06FF]/;
    return (arregex.test(strInput))
}
function convertToJsonString(str)
{
    return str.replace(/&quot;/gi, "\"");
}
/*auto called functions at starts*/
function startImageCarousel() {
    var changeImage = function () {
        var nextImg;
        var currentImg = $('.reserving .overlay>img.shown');
        currentImg.removeClass('shown').fadeOut();
        if (currentImg.next().is('img'))
            nextImg = currentImg.next().addClass('shown');
        else {
            nextImg = $('.reserving .overlay>img:first-of-type').addClass('shown');
        }
        nextImg.fadeIn();
    }
    setInterval(changeImage, 6000)
}
/*scroll functions*/
function makeScrollTop(scrollVal) {
    $('html').scrollTop(scrollVal);
    $('body').scrollTop(scrollVal);
}
function makeScrollTopAnimation(target) {
    var scroll = $('.top-nav').height() + $('.header').height();
    location.href = target;
    if (window.matchMedia("(max-width:767px)").matches) return;//no scroll on mobile
    var scrollValue = ($('body').scrollTop() > $('html').scrollTop()) ? $('body').scrollTop() : $('html').scrollTop();
    $('html,body').animate({ scrollTop: scrollValue - scroll }, 1000);
}
/*paginations functions*/
function togglePaginationEvent(type) {//add click event to pagination links
    if (type == 'bind') $('#pagination li').bind('click', function () { onPaginationClicked(this); });
    else if (type == 'unbind') $('#pagination li').unbind('click');
}
//complain form of main page
function validateComplainForm(button) {
    var isvalidate = true;
    button = $(button); 
    var form = button.parents('form');
    var inputName = form.find('input[name="name"]');
    var inputMail = form.find('input[name="mail"]');
    var inputComment = form.find('textarea[name="message"]');
    var name = inputName.val();
    var mail = inputMail.val();
    var comment = inputComment.val();
    if (mail.match(/^[a-zA-Z0-9_\.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}/) == null) {
        inputMail.css("border", '2px solid #f00');
        inputMail.clearText();
        inputMail.attr('placeholder',language.emailNotVlaid);
        isvalidate = false;
    }
    if (name.length>0&&(name=="" || name.trim().length < 3)) {
        inputName.css("border", '2px solid #f00');
        inputName.clearText();
        inputName.attr('placeholder', language.nameNotValid);
        isvalidate = false;
    }
    else if (name.trim().length >30) {
        inputName.css("border", '2px solid #f00');
        inputName.clearText()
        inputName.attr('placeholder', language.nameIsTooMany);
        isvalidate = false;
    }
    if (comment == "" || comment.trim().length <10) {
        inputComment.css("border", '2px solid #f00');
        inputComment.clearText();
        inputComment.attr('placeholder',language.validateFielLength(10)).css("border", '2px solid #f00').val('');
        isvalidate = false;
    }
    form.find('textarea,input').keydown(function () {
        $(this).css('border', '1px solid lightgray');
        $(this).unbind('keydown');
    });
    if (isvalidate) {
        button.find('i').toggleLoadingIcon('fa-send-o');
        $.post("/addComplain", { name: name, mail: mail, message: comment, general: false }, function (data, status) {
            if (data == true) {
                $('.complainMessage').fadeIn();
            } else {
                alert(language.serverProblem);
            }
        }).complete(function () {
            button.find('i').toggleLoadingIcon('fa-send-o');
            button.parents('form').get(0).reset();
        });
    }
}
/*speciality page*/
function getSpecialityDescrip(context, spName) {
    context = $(context);
    var imgSrc = context.parents('.speciality').find('img').attr('src');
    var spname = context.parents('.speciality').find('p').text();
    var spDiv = $('.speciality-type');
    var fillData = function (data) {
        makeScrollTop(0);
        $(spDiv).fadeIn(1500);
        $(spDiv).find('img').attr('src', imgSrc);
        $(spDiv).find('>h4').text(language.specialityname + spname);
        $(spDiv).find('.discription p').text(data);
        $(spDiv).find('div>a').text(language.specializedDoc + spname);
        var spDocsHref = $(spDiv).find('div>a').attr('href');
        $(spDiv).find('div>a').attr('href', spDocsHref + spname);
    }
    if (context.data('loaded')) {
        fillData(context.data('description'));
        return;
    }
    else {
        //show loading icon
        context.find('i').removeClass('hidden');
    }
    $.get(defaultPathSpecialitiesGetData + 'getSpDescription', { name: spname }, function (data, status) {
        context.find('i').addClass('hidden');
        if (data == false || data == "") {
            alert(language.serverProblem);
        }
        else {
            fillData(data);
            //store data to button so that not loaded each time
            context.data('loaded', true).data('description', data);
        }
    });
}
/*search page*/
function getDestrictsOfCity(cityID) {
    var destrictsIds = [];
    $('.areaSelect').find('option').each(function (i, el) {
        if (parseInt($(el).attr('data-value')) == cityID) {
            destrictsIds.push(i);
        }
    });
    return destrictsIds;
}
function onCitySelected(context) {
    var id = parseInt($(context).find('option:selected').val());//selected city id
    var areaItemsLi = $('.areaSelect .dropdown-menu li');//menu of areas/destricts
    //all destricts except first one(----)
    if (id == 0) {//if no city is selected            
        areaItemsLi.not(':first-of-type').addClass('hidden');//hide all destrcits
        $('.areaSelect .dropdown-toggle .filter-option').text(language.allDestricts);
        return;
    }
    areaItemsLi.not(':first-of-type').addClass('hidden');//hide all destricts except default one
    var areaSelectsIDs = [];//all destricts of selected city
    //set default destrict ----- to be selected
    $('.areaSelect').find('option:selected').removeAttr('selected').end().find('option').eq(0).attr('selected', 'selected');
    //get areas id of selected city
    areaSelectsIDs = getDestrictsOfCity(id);
    areaItemsLi.each(function (i, li) {
        if (areaSelectsIDs.indexOf(i) != -1) $(li).removeClass('hidden');
    });
    areaItemsLi.removeClass('selected').eq(0).addClass('selected');
    //set default destrict to be selected  
    $('.areaSelect .dropdown-toggle .filter-option').text(language.allDestricts);
}
function hideDestrictsOfUnSelectedCity(selectedCityID) {
    var cityContext = $('select.citySelect').get(0);
    var areaItemsLi = $('.areaSelect .dropdown-menu li');//menu of areas/destricts
    var areaSelectsIDs = getDestrictsOfCity(selectedCityID);//all destricts of selected city
    areaItemsLi.each(function (i, li) {
        if (areaSelectsIDs.indexOf(i) != -1) $(li).removeClass('hidden');
        else { $(li).addClass('hidden') }
    });//map select item to menu items
}
function validateGeneralSearchPattern(form, value)
{
    if (value.trim() == '') return false;
    var inp = $(form).find('input');
    value = value.replace(/[,/'-_/"@#$%*!(//)?[]/g, '').replace(/ or /g, '');
    inp.val(value);
    if (value.trim() == "") return false;
    $(form).find('button:submit i').toggleLoadingIcon('fa-search');
    localStorage.generalSearchValue = value;
    localStorage.searchByPattern = true;
    return true;
}
function submitSearch(context) {
    //show loading icon
    $(context).toggleIconWithLoadingImg(); 
}
/*doctor page at users area*/
function mapDoctorServices(servicesString) {
    var servicesDiv = $('.doc-services .services #serviceContainer');
    var services = convertToJsonString(servicesString);
    services = JSON.parse(services);
    $('.doc-services').removeClass('hidden');
    if (services.length == 0) {
        $('#noService').removeClass('hidden');
    }
    for (var i = 0; i < services.length; i++) {
        var servicename = (currentLangauge == "en") ? services[i].en : services[i].ar;
        $(servicesDiv).append('<div class="service">' + servicename + '</div>');
    }
}
/*doctor advices at users area*/
/*other general functions may used at future*/
function compareDate(dashedDate, intDate) {
    if (intDate == null) return false;
    var dashedDates = dashedDate.trim().split('-');
    var dY = parseInt(dashedDates[0]);
    var dM = parseInt(dashedDates[1]);
    var dD = parseInt(dashedDates[2]);
    var intDates = new Date(Number(intDate.match(/\d+/)[0]));
    var intY = intDates.getFullYear();
    var intM = (intDates.getMonth() + 1);
    var intD = intDates.getDate();// console.log(dY + " " + dM + " " + dD + " " + intDate + " " + intY + " " + intM + " " + intD);
    if (dY == intY && dM == intM && dD == intD) return true;
    return false;
}
function getUserStat(result) {
    if (result != undefined) {
        if (result == true || result == false)
            return result;
        else return false;
    }
    callAjax(
      "/users/index/getUserStatus",
       {},
      "Get", "application/json;charset=utf-8",
      "json",
      getUserStat,
      getUserStat
      );
}
function searchForDoctorName(context) {
    var textName = $(context).val();
    var ulName = $(context).next();
    var isFoundDoctorName = false;
    if (textName == null || textName.trim() == '') {
        $(ulName).find('li.noResult').remove();
        $(ulName).find('li').each(function (i, li) {   
            if ($(li).hasClass('selected')) {
                $(li).removeClass('hidden');
                isFoundDoctorName = true;
            }
            else {
                $(li).addClass('hidden');
            }
        });
    }
    else {
        $(ulName).find('li.noResult').remove();
        $(ulName).find('li').each(function (i, li) {
            var liText = $(li).text();
            if (liText.search(textName) != -1 && $(li).hasClass('selected')) {
                $(li).removeClass('hidden');
                isFoundDoctorName = true;
            }
            else {
                $(li).addClass('hidden');
            }
        });
    }
    if (!isFoundDoctorName) {
        $(ulName).append("<li class='noResult'>لا يوجد نتائج</li>").find('li.noResult').css('cursor', 'default').hover(
            function () {
                $(this).css({ 'background': '#fff', 'color': '#00f' });
            });
    }
}
function filterDoctorBasedOnSp(context) {
    context = $(context);
    var selectedOption = $(context).find('option:selected');
    var spID = parseInt(selectedOption.val());
    var childes = selectedOption.data('childs');
    var ulName = $('.selectDoctor');
    $(ulName).find('li.noResult').remove();
    $(ulName).find('li').each(function (i, li) {
        if (childes.indexOf($(li).data('value'))!=-1)$(li).addClass('selected').removeClass('hidden');
        else $(li).removeClass('selected').addClass('hidden');
    });
}
function setInputVal(context) {
    var id = $(context).data('value');
    $('#doctorID').val(id);
    $('input.doctorID').val($(context).text());
    $(context).parent().addClass('hidden');
}
function mapDoctorEdu(elments, lang) {
    var arr = [];
    arr['professor'] = "أستاذ";
    arr['lecturer'] = "دكتور";
    arr['specialist'] = "متخصص";
    arr['Assistant Lecturer'] = "دكتور مساعد";
    arr['Assistant Professor'] = "استاذ مساعد";
    arr['Consaltant'] = "استشارى";
    arr['FellowShip'] = "مرافق";
    $(elments).each(function (i, el) {
        var name = $(el).text().split(' ')[0];
        var result = "";
        if (currentLangauge== "ar") {
            result = arr[name.toLocaleLowerCase()] + ' فى';
            if (result == undefined) result = 'دكتور فى';
        }
        else {
            result = name + ' in';
            if (result == undefined) result = 'lecturer in';
        }
        $(el).text($(el).text().replace(name, result));
    });
}
function mapAdvicesUrls(context) {
    var urls = $(context).attr('data-value');
    if (urls == null || urls == '') { urls = ""; }
    var socialDiv = $(context);
    $(socialDiv).removeClass('hidden');
    var links = $(socialDiv).find('a');
    $(links).each(function (i, a) {
        var socialType = $(a).attr('data-value');
        if (urls.search('social-' + socialType + '-') != -1) {
            var startIndex = urls.indexOf('social-' + socialType + '-');
            var endIndex = urls.indexOf(',end,', startIndex + 1);
            var linkevalue = urls.substring(startIndex, endIndex);
            linkevalue = linkevalue.replace('social-' + socialType + '-', '');
            $(a).attr('href', linkevalue);
        }
        else {
            $(a).css({ 'opacity': '.5', 'cursor': 'not-allowed' }).click(function () { return false; });
        }

    });
}
function FillAdvice(result) {
    var arr = [];
    if (currentLangauge== "ar")
    {
        arr['professor'] = "أستاذ";
        arr['Lecturer'] = "دكتور";
        arr['Specialist'] = "أخصائى";
        arr['Assistant Lecturer'] = "دكتور مساعد فى";
        arr['Assistant Professor'] = "استاذ مساعد فى";
        arr['Consaltant'] = "استشارى";
        arr['FellowShip'] = "مرافق";
    }
    else {
        arr['professor'] = "professor of";
        arr['Lecturer'] = "lecturer of";
        arr['Specialist'] = "Specialist of";
        arr['Assistant Lecturer'] = "Assistant Lecturer of";
        arr['Assistant Professor'] = "Assistant Professor of";
        arr['Consaltant'] = "Consaltant of";
        arr['FellowShip'] = "FellowShip of";
    }
    var doctorName = (currentLangauge== "ar") ? "د." : "Dr.";
    var docAdviceCloned = $('.clonedAdvice').first();
    $(docAdviceCloned).find('.card .socials>a').css({ 'cursor': 'pointer', 'opacity': '1' });
    var advicesDiv = $('.all-advices .advices');
    $(advicesDiv).empty();
    for (var i = 0; i < result.length; i++) {
        var docAdvice = result[i];
        var newAdvicehtml = $(docAdviceCloned).clone();
        newAdvicehtml = $(newAdvicehtml).removeClass('hidden clonedAdvice')
        $(newAdvicehtml).find('img').attr('src', '/Areas/doctors/doctorImages/' + docAdvice.docImage);
        $(newAdvicehtml).find('.card .record:first-of-type').find('.name h5').text(doctorName+ docAdvice.docName);
        $(newAdvicehtml).find('.card .record:nth-of-type(2)').find('.name h5').text(arr[docAdvice.docEdu]+" "+ docAdvice.spName)
        $(newAdvicehtml).find('.card .socials').attr('data-value', docAdvice.docUrls);
        mapAdvicesUrls($(newAdvicehtml).find('.card .socials'));
        $(newAdvicehtml).find('.content').text(docAdvice.adviceContent);
        $(newAdvicehtml).find('.notifications>div').eq(0).find('>.number').text(docAdvice.count);
        $(newAdvicehtml).find('.notifications>div').eq(1).find('>.number').text(docAdvice.shares);
        $(newAdvicehtml).find('.notifications>div').eq(2).find('>.number').text(docAdvice.seen);
        $(newAdvicehtml).find('.notifications>div').eq(3).find('>.number').text(docAdvice.likes);
        $(newAdvicehtml).find('.hidden-div button[type="button"]').attr('data-value', docAdvice.id);
        $(newAdvicehtml).find('.hidden-div button.oldComments').attr('onclick', 'getOldCommentsOnAdvices(this,' + docAdvice.id + ',' + docAdvice.count + ')')
        $(newAdvicehtml).find('.notifications>div>i.fa-comments-o').attr('onclick', 'showCommentsOnAdvice(this,' + docAdvice.id + ',' + docAdvice.count + ');')
        $(newAdvicehtml).find('.notifications>div:last-of-type>i').attr('onclick', 'incrementNotifByOne(this,' + docAdvice.id + ',"like");')
        $(newAdvicehtml).find('.notifications>div:nth-of-type(3)>i').attr('onclick', 'incrementNotifByOne(this,' + docAdvice.id + ',"seen");')
        $(newAdvicehtml).find('.notifications>div:nth-of-type(2)>i').attr('onclick', 'incrementNotifByOne(this,' + docAdvice.id + ',"share");')
        if (docAdvice.likeStat) {
            var likeIcon = $(newAdvicehtml).find('.notifications>div:last-of-type>i');
            $(likeIcon).removeClass('fa-heart-o').addClass('fa-heart');
            $(likeIcon).attr('title', 'unlike');
        }
        else {
            var likeIcon = $(newAdvicehtml).find('.notifications>div:last-of-type>i');
            $(likeIcon).addClass('fa-heart-o').removeClass('fa-heart');
            $(likeIcon).attr('title', 'like');
        }
        $(advicesDiv).append(newAdvicehtml);
    }
}
function getAdvices(pageNumber) {
    $('.all-advices h3').find('i').removeClass('fa-info').addClass('fa-circle-o-notch fa-spin');
    $.post('/users/advices/advices', { pageNumber: pageNumber }, function (result, status) {
        $('.all-advices h3').find('i').addClass('fa-info').removeClass('fa-circle-o-notch fa-spin');
        if (result.length > 0 && result != false) {
            FillAdvice(result);
        }
    });
}
function getAdvicesOfDoctorOrSpeciality(context, pageNumber) {
    var docID = parseInt($(context).parents('form').find('input').attr('data-value'));
    var spID = parseInt($(context).parents('form').find('ul.selectDoctor').attr('data-value'));
    if (spID == 0 && isNaN(docID)) return;
    if (spID == 0 && docID == 0) return;
    if (isNaN(docID)) docID = 0;
    if (document.cookie.search('currentAdvicesPageNumber') == -1) {
        document.cookie = "currentAdvicesPageNumber=" + pageNumber + ";expires=new Date(new Date().setDate(new Date(Date.now()).getDate()+1));path=/";
    }
    $(context).find('i').removeClass('fa-search').addClass('fa-circle-o-notch fa-spin');
    $.post('/users/advices/doctorOrSpecialityAdvices', { pageNumber: pageNumber, spID: spID, docID: docID }, function (data, status) {
        var result = data.result;
        $(context).find('i').addClass('fa-search').removeClass('fa-circle-o-notch fa-spin');
        if (result.length > 0 && result != false) {
            FillAdvice(result);
            settingPaginationDiv(data.count, pageNumber);
        }
        else {
            var advicesDiv = $('.all-advices .advices');
            $(advicesDiv).empty();
            $(advicesDiv).append('<div class="alert alert-danger">لا يوجد اى نتائج متعلقة بالبحث</div>');
        }
    });

}
function showCommentsOnAdvice(context, adviceID, commentsNumber) {
    $('.loadingComment').removeClass('hidden');
    var commentDiv = $(context).parents('.advice').find('.hidden-div');
    commentDiv.css({ 'display': 'block' });
    $(commentDiv).find('.comments .alert').remove();
    if (commentsNumber == 0) {
        $('button.oldComments ').addClass('hidden');
        $('.loadingComment').addClass('hidden');
        $(commentDiv).find('.comments').append('<div class="alert alert-danger">لا يوجد اى تعليقات من قبل المرضى</div>');
        return false;
    }
    var blockNumber = parseInt($(context).attr('data-value'));
    $.ajax({
        url: "/users/advices/getAdviceComments",
        type: "POST",
        contentType: "application/json;charset=UTF-8",
        dataType: "json",
        data: JSON.stringify({ blockNumber: blockNumber, adviceID: parseInt(adviceID) }),
        success: function (result) {
            if (result.data.length > 0) $(commentDiv).find('.comments').empty();
            $('button.oldComments ').removeClass('hidden');
            var morecomments = "";
            var totalComments = parseInt($(commentDiv).find('button.oldComments').first().attr('data-value'));
            var remainComments = totalComments - (blockNumber + 1) * 10;
            if (remainComments == 1) morecomments = "تعليق واحد اخر";
            if (remainComments == 2) morecomments = "تعليقين اخرين";
            if (remainComments > 2 && remainComments <= 10) morecomments = "يوجد " + remainComments + " تعليقات اخرى";
            if (remainComments > 10) morecomments = "يوجد " + remainComments + " تعليق اخر";
            $(commentDiv).find('button.oldComments').text(morecomments);
            $('.loadingComment').addClass('hidden');
            for (var i = 0; i < result.data.length; i++) {
                var html = "";
                html += '<div class="row comment">';
                html += '<div class="col-sm-3 col-xs-12 pull-left name">' + result.data[i].name + '</div>';
                html += '<div class="col-sm-9 col-xs-12 pull-right comment-content">' + result.data[i].comment + '</div>';
                html += '</div>';
                $(commentDiv).find('.comments').prepend(html);
            }
            if (result.isLastBlock || result.length == 0) {
                $('button.oldComments ').addClass('hidden');
            }
        },
        error: function (errormessage) {
            alert("جدث خطأ اثناء الاتصال بالسيرفر");
        }
    });

}
function addCommentOnAdvice(context, comment) {
    if (comment == null) {
        return false;
    }
    if (comment.trim().length == 0) return false;
    var id = parseInt($(context).attr('data-value'));
    $(context).find('i').removeClass('fa-search').addClass('fa-circle-o-notch fa-spin');
    $.post('/users/advices/addCommentOnAdvice', { adviceID: id, comment: comment }, function (data, status) {
        $(context).find('i').addClass('fa-search').removeClass('fa-circle-o-notch fa-spin');
        if (data == false) {
            alert("جدث خطأ اثناء الاتصال بالسيرفر");
        }
        else if (data == 'notLogged') {
            if (confirm('من فضلك قم بتسجيل الدخول اولا,هل تريد ان تسجل الدخول الان')) {
                gotoLoginPage();
            }
        }
        else {
            var commentDiv = $(context).parents('.advice').find('.hidden-div');
            var html = "";
            html += '<div class="row comment" style="display:none">';
            html += '<div class="col-sm-3 col-xs-12 pull-left name">' + data.name + '</div>';
            html += '<div class="col-sm-9 col-xs-12 pull-right comment-content">' + comment + '</div>';
            html += '</div>';
            $(commentDiv).find('.comments').prepend(html).find('.comment').fadeIn();
            $(context).parents('form').find('input').val('');
            var commentsNum = parseInt($(context).parents('.advice').find('.notifications>div').eq(0).find('>.number').text());
            $(context).parents('.advice').find('.notifications>div').eq(0).find('>.number').text((commentsNum + 1));
        }
    });
}
function getOldCommentsOnAdvices(context, adviceID, totalComments) {
    var commentIcon = $(context).parents('.advice').find('.notifications i.fa-comments-o');
    var blockNumber = parseInt($(commentIcon).attr('data-value'));
    if (totalComments > (blockNumber + 1) * 10)
        blockNumber += 1;
    $(commentIcon).attr('data-value', blockNumber);
    showCommentsOnAdvice(commentIcon, adviceID);
}
function incrementNotifByOne(context, adviceID, name) {
    $.post('/users/advices/incrementAdviceNotificationByOne', { adviceID: adviceID, type: name }, function (data, st) {
        if (data != true) {
            alert("جدث خطأ اثناء الاتصال بالسيرفر");
        }
        else {
            var num = parseInt($(context).next().text());
            var title = $(context).attr('title');
            if ($(context).hasClass('fa-heart') || $(context).hasClass('fa-heart-o')) {
                if (title == "like") {
                    $(context).attr('title', 'unlike');
                    $(context).removeClass('fa-heart-o').addClass('fa-heart');
                    $(context).next().text((num + 1));
                }
                else {
                    $(context).attr('title', 'like');
                    $(context).addClass('fa-heart-o').removeClass('fa-heart');
                    $(context).next().text((num - 1));
                }
            }
        }
    });
}



 