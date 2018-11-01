/// <reference path="ar-EG-JS.js" />
/// <reference path="mainPage.js" />
/// <reference path="../../../scripts/jquery-1.12.4.js" />
/// <reference path="sdk.js" />
/// <reference path="extension.js" />
var FB;//facebook variable for loading facebook sdk
var gapi;//graph variable for facebook graph
var facebookSdkLoaded = false;//indicate if facebook sdk has been loaded
$(function () {
    //handle notification buttons click and hover
    $('.notifications').find('i:not(.fa-eye)').bind(
        {
            'mouseenter click touch': function (e) {
                var context = $(this);
                var contextType = context.data('type');
                if (e.type == "mouseenter")
                {//if user not logged in[but this is allowed for show comments]
                    if (localStorage.isAuthenticated == "false" && contextType != "comments") {//user not logged in
                        context.parents('.notifications').find('.tooltiptext').css('visibility', 'visible');
                        context.unbind('click touch');
                    }
                }
                if(e.type=="click"||e.type=="touch")
                {
                    if (contextType == "like") incrementNotification(context, "like");
                    if (contextType == "share") shareAdvice(context, "share");
                    if (contextType == "comments") {
                        if (context.data('isFirstGet') == undefined)
                        {
                            context.data('isFirstGet', true);
                            handleOnShowCommentsClicked(context);
                        }                        
                        showCommentsOnAdvice(context, 0);
                    }
                }
            }
        }).end()
       .find('.tooltiptext').bind('mouseleave focusOut', function () {
        $(this).css('visibility', 'hidden');
       });   
});
//handle modal of comments that will show when comments icon is clicked
function handleOnShowCommentsClicked(commenticonContext)
{
    var commentsModal = $('#commentsOnAdvice');
    var showOldCommentsButton = $(commentsModal).find('button.oldComments');
    var showNewCommentsButton = $(commentsModal).find('button.newComments');
    //on clicking show old comments at modal
    showOldCommentsButton.click(function () {
        //get next page comments
        showCommentsOnAdvice(commenticonContext, 1);
    });
    //on clicking show new comments at modal
    showNewCommentsButton.click(function () {
        //get previous page comments
        showCommentsOnAdvice(commenticonContext, -1);
    });
}
function getNewLiItemForNoSpecialitySearch(textMessage) {
    var li = $("<li class='noResult'>" + textMessage + "</li>");
    li.css('cursor', 'default').hover(
            function () {
                $(this).css({ 'background': '#fff', 'color': '#00f' });
            }).click(function () {
                $(this).remove();
            });
    return li;
}
/*when user typing text in input,this function filter doctor names
and output matched doctors names*/
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
        $(ulName).append(getNewLiItemForNoSpecialitySearch(language.noMathchedResult));
    }
}
/*when user select particular speciality from select box,
then this function get doctors names of the selected speciality*/
function filterDoctorBasedOnSp(context) {
    context = $(context);
    var selectedOption = $(context).find('option:selected');
    var spID = parseInt(selectedOption.val());
    var childes = selectedOption.data('childs');
    var ulName = $('ul.selectDoctor');
    $(ulName).find('li.noResult').remove();
    if (spID == 0) {
        $(ulName).find('li').removeClass('hidden');
        return;
    }
    var isFoundAnyDoctor = false;
    $(ulName).find('li').each(function (i, li) {
        li = $(li);
        if (childes.indexOf(li.data('value')) != -1) {
            li.addClass('selected').removeClass('hidden');
            isFoundAnyDoctor = true;
        }
        else li.removeClass('selected').addClass('hidden');
    });
    if (!isFoundAnyDoctor) {
        $(ulName).append(getNewLiItemForNoSpecialitySearch(language.noDoctorAtThisSpeciality));
    }
}
/*when user select doctor name from menu,this function set the doctorID
of the selected name to hidden input value*/
function setInputVal(context) {
    var id = $(context).data('value');
    $('#doctorID').val(id);
    $('input.doctorID').val($(context).text());
}
/*when user click on like or share button,this fucntion increment likes or shares number*/
function incrementNotification(context, notificationtype) {
    context = $(context);   
    var adviceID = context.data('id'); 
    $.post(defaultPathAdvices + 'incrementAdviceNotificationByOne', { adviceID: adviceID, type: notificationtype }, function (data, st) {
        if (data != true) {
            alert(language.notSuccessOperation);
        }
        else {
            if(notificationtype=="like")
            {
                var num = parseInt($(context).parents('.notifications').next().find('.like').text());
                var isLiked = $(context).hasClass('fa-heart');
                if (isLiked) {
                    $(context).attr('title', language.dislikeThisAdvice);
                    $(context).addClass('fa-heart-o').removeClass('fa-heart');
                    $(context).parents('.notifications').next().find('.like').text((num - 1));
                }
                else {
                    $(context).attr('title', language.LikeThisAdvice);
                    $(context).removeClass('fa-heart-o').addClass('fa-heart');
                    $(context).parents('.notifications').next().find('.like').text((num + 1));
                }
            }
            else if(notificationtype=="share")
            {
                var num = parseInt($(context).parents('.notifications').next().find('.share').text());
                $(context).parents('.notifications').next().find('.share').text((num + 1));
            }
        }
    });
}
//show modal of comments for clicked advice
function showCommentsOnAdvice(context, direction) {
    context = $(context);//convert javascript object to jquery 
    /*
    directon[0|1|-1]
    0=>fetch data fro first time
    1=>>fetch next page of data
    -1=>fetch previous page of data
    */
    var adviceID = context.data('id');
    var isPatientCommentedOnThisAdvicebefor = (context.data('iscommentedbefore') == "True") ? true : false;
    var formOfcommenting = $('#addCommentForm');
    formOfcommenting.find('button').data('id', adviceID).data('context', context); 
    if (!isPatientCommentedOnThisAdvicebefor)
    {
        //show the form of add comment on advice
        formOfcommenting.removeClass('hidden').find('button')
         .click(function () {
             addCommentOnAdvice(this, $(this).prev());
         });
    }
    var totalComments = parseInt(context.data('commentscount'));  
    //this is model that will show and contains comments of selected advice
    var showCommentModal = $('#commentsOnAdvice');
    /*this is the div that contains commnets
    this div is by default is hidden
    and be visible when clicked on comments icon
    */
    var commentDiv = $(showCommentModal).find('.all-comments');
    $(showCommentModal).modal('show');//show modal  
    var getOldCommentsButton = $(showCommentModal).find('button.oldComments');//navigate to next comments
    var getNewCommentsButton = $(showCommentModal).find('button.newComments');//navigat to previous comments
    //this function control 
    //when to hide or show both[getOldComments button,and getNewCommnets button]
    var buttonVisiblityControl = function (totalComments, currentNavifator) {
        var maxNavigatorVlaue = Math.ceil(totalComments / defaultPageSizeForAdviceComments);
        if (currentNavifator < maxNavigatorVlaue || (currentNavifator == 0 && maxNavigatorVlaue == 0))
            getOldCommentsButton.removeClass('hidden');//show get old comments buttons
        else {
            getOldCommentsButton.addClass('hidden');//hide get old comments buttons
        }
        if (currentNavifator > 1) {
            getNewCommentsButton.removeClass('hidden');//show get new comments buttons
        }
        else {
            getNewCommentsButton.addClass('hidden');//hide get new comments buttons
        }
    }
    //this function change the text of buttons[more comments button,previous comments button]
    var changeButtonControltext = function (currentNavigator, totalComments)
    {
        var num = totalComments - currentNavigator * defaultPageSizeForAdviceComments;
        getOldCommentsButton.find('.hint').text("[" + language.aboutNumber + " " + language.otherAdvices(num) + "]");
    }
    var resetButtonsControls=function()
    {
        if (totalComments == 0)
            getOldCommentsButton.addClass('hidden');//hide get old comments buttons
        else changeButtonControltext(0,totalComments);
        getNewCommentsButton.addClass('hidden');//hide get new comments buttons
    }
    //get json data from server
    if (totalComments == 0) {
        $(commentDiv).find('.comments').empty();//empty previous comments
        resetButtonsControls();//reset buttons[more comments,previous comments]
        //hide loading icon
        $(showCommentModal).find('.loadingComment').addClass('hidden');
        var noCommentsDiv = $('<div class="alert alert-danger">' + language.noCommentsExits + '</div>');
        commentDiv.find('.comments').append(noCommentsDiv);
        return;
    }
    /*the current context will hold dictionary data as follow
    adviceID=>this is advice id whose comments will be fetched,
    commentsCount=>total number of comments for this advice,
    pageNumber=>this is next page of number that will fetched in next time,
    and these are the number of items that will fetched from server each request,
    records=>this will contains all recorded that has been loaded from server,
    navigator->this is indicator for cuurent displayed page number.
    */
    /*record key is added to current button ,this key will hold all data 
    that will be loaded and all old data that already loaded befor
    so that ,if all data has been loaded from server ,we will needn't to load it agin from server
    */
    if (context.data('records') == undefined) {//the comments will be fetched for first time from server
        //initialization for data
        context.data('records', []);
        context.data('pageNumber', 1);
        context.data('navigator', 0);
        buttonVisiblityControl(0, 0);
    }
    else {//get old fetched comments or get new comments from server[based on direction]
        /*
        direction
        case 1:fetched data may be from old data or from server
        case -1:no data will be fetched from server
        case undefined:the navigator of page will be displayed
        */
        var oldCommentsRecords = context.data('records');
        var nextPageNumber =context.data('pageNumber'); 
        var currentNavigator = context.data('navigator');
        buttonVisiblityControl(totalComments, currentNavigator + direction);
        //get more comments
        if (direction == 1) {//next page will be displayed from server or from old data
            var lastValueForNavigator = (oldCommentsRecords.length / defaultPageSizeForAdviceComments);
            if (currentNavigator < lastValueForNavigator) {//next page will not fetched from server
                context.data('navigator', currentNavigator + 1);
                $(commentDiv).find('.comments').empty();
                FillCommentsModalWithCommentsRecords(oldCommentsRecords, $(commentDiv), currentNavigator + 1);
                $(showCommentModal).modal('show');
                changeButtonControltext(currentNavigator + 1, totalComments);
                return;
            }
        }
        //get few comments 
        else if (direction == -1) {//previous navigator page will be displayed           
            context.data('navigator', currentNavigator - 1);
            //you can add previous page comments to currents page comments by disabling next line
            $(commentDiv).find('.comments').empty();
            FillCommentsModalWithCommentsRecords(oldCommentsRecords, $(commentDiv), currentNavigator - 1);
            $(showCommentModal).modal('show');
            changeButtonControltext(currentNavigator - 1, totalComments);
            return;
        }
        else {//current page navigator will be displayed
            //you can add previous page comments to currents page comments by disabling next line
            $(commentDiv).find('.comments').empty();
            resetButtonsControls();//reset buttons[more comments,previous comments]
            FillCommentsModalWithCommentsRecords(oldCommentsRecords, $(commentDiv), currentNavigator);
            $(showCommentModal).modal('show');
            changeButtonControltext(currentNavigator, totalComments);
            return;
        }
    }
    var currentPageNumber = context.data('pageNumber');
    //show loading icon
    $(showCommentModal).find('.loadingComment').removeClass('hidden');
    $.get(defaultPathAdvices + "getAdviceComments",
        { pageNumber: currentPageNumber, pageSize: defaultPageSizeForAdviceComments, adviceID: adviceID },
        function (result, status) {           
            var totalComments = result.total;
            var data = result.data;
            if (totalComments <= (currentPageNumber * defaultPageSizeForAdviceComments)) {//all comments of advice are fetched from server
                getOldCommentsButton.addClass('hidden');//hide get comments buttons
            }
            else {//there are more comments of this advice on server not fetched until  
                //this is next pagenumber that will be fetched next time from server
                context.data('pageNumber', (currentPageNumber + 1));
                getOldCommentsButton.removeClass('hidden');//show get comments buttons
                changeButtonControltext(currentPageNumber, totalComments);
            }
            if (data.length > 0) {//add the newlly fetched data to previous data in records
                var currentRecords = context.data('records');
                var currentnavigator = context.data('navigator');
                context.data('records', currentRecords.concat(data));
                context.data('navigator', currentnavigator + 1);
            }
            //empty previous page comments and add current page comments
            //you can add previous page comments to currents page comments
            $(commentDiv).find('.comments').empty();
            FillCommentsModalWithCommentsRecords(data, $(commentDiv));
        }
        ).fail(function () {
            alert(language.cannotLoadData);
            $(showCommentModal).modal('hide');
        })
         .error(function () {
             alert(language.serverProblem);
             $(showCommentModal).modal('hide');
         })
        .complete(function () {
             //hide loading icon
             $(showCommentModal).find('.loadingComment').addClass('hidden');
         });
}
/*
this function take array of records and take page from these records 
starting from navigator index  based on page size 
and design each record as 
html record to target div element
*/
function FillCommentsModalWithCommentsRecords(records, targetElement, currentNavigator) {
    if (currentNavigator != undefined) {//only part of given records will be displayed based on navigator
        var startIndex = ((currentNavigator - 1) * defaultPageSizeForAdviceComments) - 1;
        records = $(records).map(function (i, record) {
            if (startIndex < i && i < startIndex + defaultPageSizeForAdviceComments + 1) return record;
        });
    }
    for (var i = 0; i < records.length; i++) {
        var html = "";
        html += '<div class="row comment">';
        html += '<div class="col-sm-3 col-xs-12 name">' + records[i].patientName + '</div>';
        html += '<div class="col-sm-9 col-xs-12 comment-content">' + records[i].comment + '</div>';
        html += '</div>';
        $(targetElement).find('.comments').append(html);
    }
}
function addCommentOnAdvice(context, comment) {
    context = $(context);
    if(!comment.isValidLength(3))return;
    var id =context.data('id');//advice id
    context.find('i').toggleLoadingIcon('fa-search');//show loading icon
    $.post(defaultPathAdvices + 'addCommentOnAdvice', { adviceID: id, comment: comment.val() }, function (data, status) {
        if (data == false) {
            alert(language.serverProblem);
        }
        else {
            var showCommentModal = $('#commentsOnAdvice');
            var commentDiv = $(showCommentModal).find('.all-comments');
            commentDiv.find('.comments .alert').remove();
            var html = "";
            html += '<div class="row comment" style="display:none">';
            html += '<div class="col-sm-3 col-xs-12 pull-left name">' + data.name + '</div>';
            html += '<div class="col-sm-9 col-xs-12 pull-right comment-content">' + comment.val() + '</div>';
            html += '</div>';
            $(commentDiv).find('.comments').prepend(html).find('.comment').fadeIn();
            var iconContext = $(context.data('context'));
            var num = parseInt(iconContext.parents('.notifications').next().find('.comments').text());
            iconContext.data('commentscount',num+1).parents('.notifications').next().find('.comments').text((num + 1));
        }
    }).complete(function () {
        $(context).find('i').toggleLoadingIcon('fa-search');//hide loading icon
        $(context).parents('form').get(0).reset();
    });
}
//share advice
function shareAdvice(context)
{
    if (!navigator.onLine)
    {//there no access to internet
        alert(language.notConnectedToInternet); return;
    }
    if (!facebookSdkLoaded) {//facebook sdk has not been loaded yet
        alert(language.slowInternet); return;
    }
    sharefbAdvice(context);//
}
//load facebook sdk
function intiAndLoadSDK() {
    window.fbAsyncInit = function () {
        FB.init({
            appId:appFacebookID, status: true, cookie: true, xfbml: true
        });
    };
    (function (d, debug) {
        var graphLang = (currentLangauge == "ar") ? 'ar_AR' : 'en_US'; 
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement('script'); js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/" + graphLang + "/all" + (debug ? "/debug" : "") + ".js";       
        ref.parentNode.insertBefore(js, ref);
        facebookSdkLoaded = true;
    }(document, /*debug*/ false));  
}
function sharefbAdvice(context) {
    context = $(context);
    var adviceContent = context.data('content');
    var doctorName = context.data('doctorname');
    FB.init({ appId: appFacebookID, status: true, cookie: true });
    FB.ui({
        method: 'share_open_graph',
        action_type: 'og.shares',
        display: 'popup',
        action_properties: JSON.stringify({
            object: {
                'og:url':location.href,//the page of content that will be shared
                'og:title': 'نصيحة طبية من الدكتور '+doctorName,
                'og:description':adviceContent,
                'og:image': 'http://zoordoctor-001-site1.itempurl.com/images/logo3.png'
            }
        })
    },
    function (response) {
        if (typeof response != 'undefined') {
            alert(language.thankForSharingAdvice);
            incrementNotification(context, 'share');
        }
        else {
            alert(language.adviceNotShared);
        }
    }
    );
}
(function () {
    if (navigator.onLine) intiAndLoadSDK();
})();//auto called function
