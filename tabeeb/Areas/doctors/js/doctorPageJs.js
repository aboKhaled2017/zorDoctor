﻿/// <reference path="../../../Scripts/jquery-1.12.4.js" />
/// <reference path="../../../js/ImageTools.js" />
/// <reference path="extensionFunctions.js" />
/// <reference path="doctorJS.js" />
var defaultPageSizeForComments = 5;
var defaultPageSizeForAdvices = 5;
var defaultPageSizeForPatientViews = 5;
$(function () {
    $('#photoDiv').mouseenter(function () {
        $('#photoDiv .changePhoto').removeClass('hidden');
    });
    $('#photoDiv').mouseleave(function () {
        onMouseLeaveProfilePicture();
    });
    $("#takeDoctorImage").click(function (e) {
        e.preventDefault();
        $("#doctorImage").trigger('click');
    });
    $('#doctorImage').change(function (e) {
        var imageInput = this;
        $('#photoDiv').unbind('mouseleave');
        $('#photoDiv .changePhoto').removeClass('hidden');
        $('#takeDoctorImage').removeClass('glyphicon glyphicon-camera').addClass('fa fa-spinner fa-spin');
        ImageTools.resize(imageInput.files[0], {
        width: 120, // maximum width
        height: 120 // maximum height
        }, function (blob, didItResize) {
            getImageLoadedFile(imageInput, e, blob, changeDoctorProfileImage);
            //getImageLoadedFile(imageInput, e, changeDoctorProfileImage);old one
    });        
        $('#photoDiv').bind('mouseleave', function () { onMouseLeaveProfilePicture();});
    });
});
/*these are function of doctor page--------------------------*/
function convertToJsonString(str) {
    return str.replace(/&quot;/gi, "\"");
}
function getImageLoadedFile(input,e,imageBlob,callBack)
{
    var _URL = window.URL || window.webkitURL;
    var imgLoaded = false;
    var imgInput = $(input);
    var fileSize = imageBlob.size;
    var extension = imgInput.val().split('.').pop().toUpperCase(); 
    var filename = imgInput.val().split('\\').pop();
    if (!(extension == "PNG" || extension == "JPG" || extension == "GIF" || extension == "JPEG")) {
        alert(language.imgExtension);
        return;//file extension not valid
    }
    if (imageBlob.type.indexOf("image") == -1) {
        alert(language.imgFileNotSupported);
        return;//this is not image
    }
    //$('#imageProgress').removeClass('hidden');
    if (fileSize > 0) {
        var img = new Image();
        img.src = _URL.createObjectURL(imageBlob);
        img.onload = function () {
            var width = img.naturalWidth,
            height = img.naturalHeight;
            if (width != height || (fileSize > maxPersonalImg)) {
                alert(language.personalImgValidation);
                return;
            }
            else {//image has been accepted               
                var cardImage = document.getElementById('cardImage');
                cardImage.src = img.src;
                callBack(imageBlob, extension);
            }
        }
    }

}
function changeDoctorProfileImage(file,extension) {
    var formData = new FormData();
    formData.append('file', file);
    formData.append('extension', extension);
    $.ajax({
        type: 'post',
        url:'/'+defaultPathForDoctorArea+'/updateDoctorImage',
        data: formData,
        success: function (status) {
            if (!status) {
                alert(language.imgLoadedSuccess);
            }
            $('#photoDiv .changePhoto').addClass('hidden');
            $('#takeDoctorImage').addClass('glyphicon glyphicon-camera').removeClass('fa fa-spinner fa-spin');
        },
        processData: false,
        cache:true,
        contentType: false,
        error: function () {
            alert(language.serverProblem);
            $('#photoDiv .changePhoto').addClass('hidden');
            $('#takeDoctorImage').addClass('glyphicon glyphicon-camera').removeClass('fa fa-spinner fa-spin');
        }
    });
}
function onMouseLeaveProfilePicture()
{
    $('#photoDiv .changePhoto').addClass('hidden');
}
function mapDoctorLinks(urlsString, links) {
        /*this function get all social media links of current doctor from url string
        and each link is found in urls string is shown as icon on html page
        */
        var urlsString = urlsString.replace(/&quot;/gi, "\"");
        var urlsArray = JSON.parse(urlsString);//convert to array of urls
        $(links).each(function (i, a) {
            //social marks are[y|i|l|.....](i=>instagram),(l=>linkedin),(.....)
            var socialMark = $(a).attr('data-value').trim();
            //urlsArray.find is best but does not work on mobile
            var url =(urlsArray.length>0)?urlsArray.filter(function (link) { if (link.s == socialMark) return link;})[0]:undefined;
            //url object lik{s:"",u:""},s=>social mark,u=>url of social media
            if (url == undefined) {//doctor has not this link for this social media type
                $(a).addClass('disabledLink');
            }
            else {
                $(a).attr("href", url.u);
            }
        });
}
function getDoctorrequests() {
    /*This function make 3 requests to get 
    doctor reservings,advices,patients views
    when doctor page is opened
    */
    var processes = $.Deferred();
    processes.done([getDoctorReserving(), getDocorAdvices(), getPatientViewsOnDoctor(0)]);
    processes.fail(function () { alert(problemMessageAtServer); });
    processes.resolve();
    // getDoctorReserving();
    //getDocorAdvices();
    //getPatientViews();
}
function getDoctorReserving() {
    var ReservingDiv = $('.table-reserving');
    $.get('/' + defaultPathForDoctorArea + '/doctorReservings',
        {},
        function (data, status) {
            //hide loading icon
            $('.today-reseveing .loading-circle').addClass('hidden');
            if (data.length == 0) {//there are no reservings today
                $(ReservingDiv).find('table').remove().end().find('div.alert-info').removeClass('hidden').
                    text(language.noReservingToday);
                $('#examinsNumber').text(0);//number of examinations
                $('#consultsNumber').text(0);//number of consults
            }
            else {
                var consultNumber=0, examinNumber=0,visitType;
                var tableTbody = $(ReservingDiv).find('table tbody');
                $(data).each(function (i, record) {                  
                    var tr = $('<tr></tr>');
                    tr.append('<td>' + (i + 1) + '</td>');
                    tr.append('<td>' + record.ptName + '</td>');
                    tr.append('<td>' + record.phone + '</td>');
                    if(record.visitType == "false")
                    {
                        visitType = language.consult;
                        examinNumber++;
                    }
                    else{
                        visitType =language.examination;
                        consultNumber++;
                    }
                    tr.append('<td>' + visitType + '</td>');
                    tableTbody.append(tr);
                });
                $('#examinsNumber').text(examinNumber);
                $('#consultsNumber').text(consultNumber);
            }
        });
}
function getDocorAdvices() {
    var pageSize = defaultPageSizeForAdvices;
    var advicesDiv = $('.doc-prev-advices');
    var adviceRecord = $('#clonedItems').find('.adviceRecord')[0];
    var getOldAdvicesButton = $('button.oldAdvices');
    if (getOldAdvicesButton.data('pageNumber') == undefined) getOldAdvicesButton.data('pageNumber', 1);
    var currentPageNumber = getOldAdvicesButton.data('pageNumber');
    //show loading icon         
    $(advicesDiv).find('.loading-circle').removeClass('hidden');
    $.get('/' + defaultPathForDoctorArea + '/doctorAdvices/',
        { pageNumber: currentPageNumber, pageSize: pageSize },
        function (data, status) {
            //hide loading icon         
            $(advicesDiv).find('.loading-circle').addClass('hidden');
            var totalRecords = data.total;//total of doctor advices at server
            if (totalRecords <= (currentPageNumber * pageSize)) {//all advices are fetched from server
                getOldAdvicesButton.addClass('hidden');
            }
            else {//there are more advice on server not fetched until 
                getOldAdvicesButton.removeClass('hidden');
                getOldAdvicesButton.data('pageNumber', (currentPageNumber + 1));
                $(getOldAdvicesButton).find('.hint').text("[" + language.aboutNumber+" " + language.otherAdvices(totalRecords - currentPageNumber * pageSize) + "]");
            }
            if (data.status != false) {
                var records = data.data;
                if (records.length == 0) {//there are no any advices 
                    $(advicesDiv).find('div.alert-info').removeClass('hidden').text(language.noWrittenAdvices);
                }
                else {//there are at least one record of advice
                    $(records).each(function (i, record) {
                        addAdviceRecordAsHtml("append", record.id, record.content, record.comments, record.likes, record.shares, record.seens);
                    });
                }
            }
            else {//problem occured at server
                $(advicesDiv).find('div.alert-info').removeClass('hidden').text(problemMessageAtServer);
            }
        });
}
function addDoctorAdvice(adviceContent) {
    var adviceinp = $('#adviceContent');
    var isValidAdvice = (adviceinp.isValidFormat(patterns.arabicText, formTitles.enterArabicText))
    ? adviceinp.isValidLength(10) : false;
    if (!isValidAdvice) return true;
    $('.adviceForm button i').toggleLoadingIcon('fa-plus');
    $.post("/" + defaultPathForDoctorArea + "/addDoctorAdvice",
       { adviceContent: adviceContent },
       function (result, status) {
           if (result.status == true) {
               $('.adviceForm .alert-success').show();
               $('.adviceForm .alert-success').delay(2000).slideUp(1000);
               addAdviceRecordAsHtml('prepend', result.newID, adviceContent, 0, 0, 0, 0);
           }
           else {
               alert(operationProblem);
           }
       })
    .error(function () {
        alert(operationProblem);
        $('.adviceForm button i').toggleLoadingIcon('fa-plus');
    })
    .fail(function () {
        alert(operationProblem);
        $('.adviceForm button i').toggleLoadingIcon('fa-plus');
    })
    .complete(function () { $('.adviceForm button i').toggleLoadingIcon('fa-plus'); });
}
function updateDoctorAdvice(id, context) {
    var adviceContent = $(context).parent().siblings('.advice').text();
    $(context).toggleLoadingIcon('fa-edit');
    $.ajax({
        url: "/" + defaultPathForDoctorArea + "/updateDoctorAdvice",
        data: JSON.stringify({ ID: id, adviceContent: adviceContent }),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (result.status == true) {
                alert(language.adviceUpdatedSuccess);
                $(context).toggleLoadingIcon('fa-edit');
            }
            else {
                alert(operationProblem);
            }
        },
        error: function (errormessage) {
            alert(operationProblem);
        }
    });
}
function deleteDoctorAdvice(PK, context) {
    var ans = confirm(language.areYouSureToDeleteAdvice);
    if (ans) {
        $(context).toggleLoadingIcon('fa-trash');
        $.ajax({
            url: "/" + defaultPathForDoctorArea + "/deleteDoctorAdvice/" + PK,
            type: "POST",
            contentType: "application/json;charset=UTF-8",
            dataType: "json",
            success: function (result) {
                if (result.status == true) {
                     $(context).toggleLoadingIcon('fa-trash');
                    var deletedRecord = $(context).parent().parent().parent();
                    $(deletedRecord).fadeOut(1000, function () {
                        $(deletedRecord).remove();
                    });
                }
                else {
                    alert(operationProblem);
                }
            },
            error: function (errormessage) {
                alert(operationProblem);
            }
        });
    }
}
function editAdvice(context) {
    //this function trigger the clicked advice box 
    //and convert the div box to textarea controll
    //such that doctor can edit advice
    var area = $(context);
    var text = $(area).text();
    var textArea = document.createElement('textarea');
    $(textArea).attr('class', 'advice');
    $(textArea).attr('autofocus', '');
    $(textArea).blur(function () {
        var div = document.createElement('div');
        $(div).attr('class', 'advice');
        div.addEventListener("click", function () {
            editAdvice(this);
        });
        div.innerText = $(this).val();
        $(this).replaceWith(div);
    });
    textArea.innerText = text;
    area.replaceWith(textArea);
}
function showCommentsOnAdvice(context, direction) {
    if (direction == undefined) direction = 0;
    /*
    directon[undefined|1|-1]
    undefined=>fetch data fro first time
    1=>>fetch next page of data
    -1=>fetch previous page of data
    */
    var adviceID = $(context).data('adviceID');
    var totalComments = $(context).data('commentsCount');
    if (parseInt(totalComments) == 0) {
        return false;
    }
    /*this is the div that contains commnets
    this div is by default is hidden
    and be visible when clicked on comments icon
    */
    context = $(context);//convert javascript object to jquery 
    var pageSize;//nummebr of comments for each page
    //this is model that will show and contains comments of selected advice
    var showCommentModal = $('#commentsOnAdvice');
    var commentDiv = $(showCommentModal).find('.all-comments');
    var getOldCommentsButton = $(showCommentModal).find('button.oldComments');//navigate to next comments
    var getNewCommentsButton = $(showCommentModal).find('button.newComments');//navigat to previous comments
    //this function control 
    //when to hide or show both[getOldComments button,and getNewCommnets button]
    var buttonVisiblityControl = function (totalComments, pageSize, currentNavifator) {
        var maxNavigatorVlaue = Math.ceil(totalComments / pageSize);
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
    var changeButtonControltext = function (currentNavigator, totalComments) {
        var num = totalComments - currentNavigator * pageSize;
        getOldCommentsButton.find('.hint').text("[" + language.aboutNumber + " " + language.otherAdvices(num) + "]");
    }
    /*the current context will hold dictionary data as follow
    adviceID=>this is advice id whose comments will be fetched,
    commentsCount=>total number of comments for this advice,
    pageNumber=>this is next page of number that will fetched in next time,
    pageSize=>this is number of comments that will be displayed at model each time
    and these are the number of items that will fetched from server each request,
    records=>this will contains all recorded that has been loaded from server,
    navigator->this is indicator for cuurent displayed page number.
    */
    /*record key is added to current button ,this key will hold all data 
    that will be loaded and all old data that already loaded befor
    so that ,if all data has been loaded from server ,we will needn't to load it agin from server
    */
    if (context.data('records') == undefined) {//the comments will be fetched for first time
        //initialization for data
        context.data('records', []);
        context.data('pageNumber', 1);
        context.data('pageSize', defaultPageSizeForComments);
        context.data('navigator', 0);
        pageSize = context.data('pageSize');
        buttonVisiblityControl(0, context.data('pageSize'), 0);
    }
    else {//get old fetched comments or get new comments from server[based on direction]
        /*
        direction
        case 1:fetched data may be from old data or from server
        case -1:no data will be fetched from server
        case undefined:the navigator of page will be displayed
        */
        var oldCommentsRecords = context.data('records');
        var nextPageNumber = context.data('pageNumber');
        var pageSize = context.data('pageSize');
        var totalComments = context.data('commentsCount');
        var currentNavigator = context.data('navigator');
        buttonVisiblityControl(totalComments, pageSize, currentNavigator + direction);
        if (direction == 1) {//next page will be displayed from server or from old data
            var lastValueForNavigator = (oldCommentsRecords.length / pageSize);
            if (currentNavigator < lastValueForNavigator) {//next page will not fetched from server
                context.data('navigator', currentNavigator + 1);
                $(commentDiv).find('.comments').empty();
                FillCommentsModalWithCommentsRecords(oldCommentsRecords, $(commentDiv), currentNavigator + 1, pageSize);
                $(showCommentModal).modal('show');
                changeButtonControltext(currentNavigator + 1, totalComments);
                return;
            }
        }
        else if (direction == -1) {//previous navigator page will be displayed
            //you can add previous page comments to currents page comments by disabling next line
            context.data('navigator', currentNavigator - 1);
            $(commentDiv).find('.comments').empty();
            FillCommentsModalWithCommentsRecords(oldCommentsRecords, $(commentDiv), currentNavigator - 1, pageSize);
            $(showCommentModal).modal('show');
            changeButtonControltext(currentNavigator - 1, totalComments);
            return;
        }
        else {//current page navigator will be displayed
            //you can add previous page comments to currents page comments by disabling next line
            $(commentDiv).find('.comments').empty();
            FillCommentsModalWithCommentsRecords(oldCommentsRecords, $(commentDiv), currentNavigator, pageSize);
            $(showCommentModal).modal('show');
            return;
        }
    }
    var currentPageNumber = context.data('pageNumber');
    $(showCommentModal).modal('show');
    //show loading icon
    $(showCommentModal).find('.loadingComment').removeClass('hidden'); 
    //get json data from server
    $.get(defaultPathAdvices + "getAdviceComments",
        { pageNumber: currentPageNumber, pageSize: pageSize, adviceID: adviceID },
        function (result, status) {
            //hide loading icon
            $(showCommentModal).find('.loadingComment').addClass('hidden');
            var totalComments = result.total;
            var data = result.data;
            if (totalComments <= (currentPageNumber * pageSize)) {//all comments of advice are fetched from server
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
        ).fail(function () { alert(problemMessageAtServer); })
         .error(function () {
             alert(problemMessageAtServer);
         }).complete(function () {
             /*here you can load the rest of comments from server
             after the current page number of comments has been loaded*/
         });
}
function getPatientViewsOnDoctor(direction) {
    var patientViewsDiv = $('#patient-view');
    var moreViewsButton = $('#moreViews');
    var prevViewsButton = $('#prevViews');
    var allPatientsDiv = $(patientViewsDiv).find('.patients .body');
    //this is object that will store patientViews data
    var PVData = patientViewsDiv.data();
    /*
    this function control 
    which time to hide or show both[more advices button,and previous advices button]
    */
    var buttonVisiblityControl = function () {
        var maxNavigatorVlaue = Math.ceil(PVData.totalRecordsAtServer / defaultPageSizeForPatientViews);
        if (PVData.navigator < maxNavigatorVlaue || (PVData.navigator == 0 && maxNavigatorVlaue == 0))
            moreViewsButton.removeClass('hidden');
        else {
            moreViewsButton.addClass('hidden');
        }
        if (PVData.navigator > 1) {
            prevViewsButton.removeClass('hidden');
        }
        else {
            prevViewsButton.addClass('hidden');
        }
    }
    //this function is called on error
    var error = function (message) {
        $(patientViewDiv).find('.alert').removeClass('hidden').text(message);
    }
    //check if any patient views fetched befor 
    if (PVData.loadedRecords == undefined) {//intailize data
        PVData.loadedRecords = [];
        PVData.nextpageNumber = 1;
        PVData.navigator = 0;
        PVData.totalRecordsAtServer = 0;
    }
    switch (direction) {
        case 1: {//next page will be displayed from server or from old data
            var lastValueForNavigator = (PVData.loadedRecords.length / defaultPageSizeForPatientViews);
            if (PVData.navigator < lastValueForNavigator) {//next page will not fetched from server
                ++PVData.navigator;
                allPatientsDiv.empty();//empty old views
                addPtientVeiwRecordAsHtml(PVData.loadedRecords, allPatientsDiv, PVData.navigator, defaultPageSizeForPatientViews);
                buttonVisiblityControl();
                return;
            }
        }; break;
        case -1: {
            --PVData.navigator;
            allPatientsDiv.empty();
            addPtientVeiwRecordAsHtml(PVData.loadedRecords, allPatientsDiv, PVData.navigator, defaultPageSizeForPatientViews);
            buttonVisiblityControl();
            return;
        }; break;
        default: break;
    }
    //show loading icon
    patientViewsDiv.find('.loadingComments').removeClass('hidden');
    $.post('/' + defaultPathForDoctorArea + '/doctorPatientViews',
        { pageNumber: PVData.nextpageNumber, pageSize: defaultPageSizeForPatientViews },
        function (data, status) {
            //show loading icon            
            patientViewsDiv.find('.loadingComments').addClass('hidden');
            if (data.status == false) {
                error(problemMessageAtServer);
            }
            else {
                if(data.data.length>0)
                {
                    PVData.totalRecordsAtServer = data.total;
                    PVData.loadedRecords = (PVData.loadedRecords.concat(data.data));
                    PVData.navigator = PVData.navigator + 1;
                    PVData.nextpageNumber = PVData.nextpageNumber + 1;
                    //add newlly loadded data to view model
                    allPatientsDiv.empty();
                    addPtientVeiwRecordAsHtml(PVData.loadedRecords, allPatientsDiv, PVData.navigator, defaultPageSizeForPatientViews);
                    buttonVisiblityControl();
                }
                else {
                    patientViewsDiv.find('.alert').removeClass('hidden').text(language.noPatientViewTillNow);
                }
            }
        })
    .error(function () {
        error(problemMessageAtServer);
    })
    .fail(function () {
        error(problemMessageAtServer);
    });
}
/*
this function take array of records and take page from these records 
starting from navigator index  based on page size 
and design each record as 
html record to target div element
*/
function FillCommentsModalWithCommentsRecords(records, targetElement, currentNavigator, pageSize) {
    if (currentNavigator != undefined) {//only part of given records will be displayed based on navigator
        var startIndex = ((currentNavigator - 1) * pageSize) - 1;
        records = $(records).map(function (i, record) {
            if (startIndex < i && i < startIndex + pageSize + 1) return record;
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
/*
addingType[append|prpend]
commentsNum:number of comments on this advice
likesNum:number of likes
sharesNum:number of shres
seenNum:number of viewers
*/
function addAdviceRecordAsHtml(addingtype, adviceID, adviceContent, commentsNum, likesNum, sharesNum, seenNum) {
    //adding type[append/prepend]
    var adviceRecord = $('#clonedItems').find('.adviceRecord')[0];//the cloned element
    adviceRecord = $(adviceRecord).clone();//copy the advice record to be repeated
    var adviceContentDiv = $(adviceRecord).find('.advice');
    var adviceControls = $(adviceRecord).find('.controls >i');
    var adviceNotificationsButtons = $(adviceRecord).find('.notifications>i');
    var adviceNotificationsStaticts = $(adviceRecord).find('.notf-number>div');
    //this is popup modal that will contains comments
    var commentsModal = $('#commentsOnAdvice');
    $(adviceContentDiv).text(adviceContent);
    $(adviceControls).eq(0).attr('onclick', 'updateDoctorAdvice("' + adviceID + '",this)');
    $(adviceControls).eq(1).attr('onclick', 'deleteDoctorAdvice("' + adviceID + '",this)');
    //this is comment icon,on click it,it will show model that contains comments
    var showCommentIconButton = $(adviceNotificationsButtons).eq(0);
    //when comment icon is clicked to get comments
    $(showCommentIconButton).click(function () {
        //this is button that found on modal to get old comments
        //the modal is shared between all comment icons
        //so we must change the target of this button each time the modal is called to get comments
        var showOldCommentsButton = $(commentsModal).find('button.oldComments');
        var showNewCommentsButton = $(commentsModal).find('button.newComments');
        $(showOldCommentsButton).unbind('click');
        $(showNewCommentsButton).unbind('click');
        //on clicking show old comments at modal
        showOldCommentsButton.click(function () {
            //get next page comments
            showCommentsOnAdvice(showCommentIconButton, 1);
        });
        //on clicking show new comments at modal
        showNewCommentsButton.click(function () {
            //get previous page comments
            showCommentsOnAdvice(showCommentIconButton, -1);
        });
        showCommentsOnAdvice(this);
    });
    showCommentIconButton.data('adviceID', adviceID);
    showCommentIconButton.data('commentsCount', commentsNum);
    $(adviceNotificationsStaticts).eq(0).text(commentsNum);
    $(adviceNotificationsStaticts).eq(1).text(sharesNum);
    $(adviceNotificationsStaticts).eq(2).text(seenNum);
    $(adviceNotificationsStaticts).eq(3).text(likesNum);
    var advicesDiv = $('.doc-prev-advices');//this is advices div that contains group of div record
    $(advicesDiv).find('div.alert-info').addClass('hidden');
    if (addingtype == "append") {
        $(advicesDiv).find('.advices').append(adviceRecord);
    }
    else {
        $(advicesDiv).find('.advices').prepend(adviceRecord);
    }
    return adviceRecord;
}
/*
records->array of patients views that will be displayed
target element->this is container of patient views
*/
function addPtientVeiwRecordAsHtml(records, targetElement, currentNavigator, pageSize) {
    if (currentNavigator != 0) {//only part of given records will be displayed based on navigator
        var startIndex = ((currentNavigator - 1) * pageSize) - 1;
        records = $(records).map(function (i, record) {
            if (startIndex < i && i < startIndex + pageSize + 1) return record;
        });
    }
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (i > 0) $(targetElement).append('<hr class="center-block"/>');
        var patientDiv = document.createElement('div');
        patientDiv.className = 'patient';
        var ptInfoDiv = document.createElement('div');
        ptInfoDiv.className = 'patient-info';
        $(ptInfoDiv).append('<span class="name"> <i class="fa fa-envelope-o fa-lg"></i> ' + record.patientName + ' </span>');
        $(patientDiv).append(ptInfoDiv);
        var ptViewDiv = document.createElement('div');
        ptViewDiv.className = 'view';
        if (record.comment == "" || record.comment.length < 1) {
            record.comment = language.ratingWithoutComment;
            $(ptViewDiv).append('<p style="color:#f00">' + record.comment + '</p>');
        }
        else {
            $(ptViewDiv).append('<p>' + record.comment + '</p>');
        }
        var doctorRate = document.createElement('p');
        doctorRate.className = 'rate';
        var rate = record.rate;
        for (var k = 0; k < rate ; k++) {
            $(doctorRate).append('<i class="fa fa-star fa-lg"></i>');
        }
        for (var k = rate; k < 5 ; k++) {
            $(doctorRate).append('<i class="fa fa-star-o fa-lg"></i>');
        }
        $(ptViewDiv).append(doctorRate);
        $(patientDiv).append(ptViewDiv);
        $(targetElement).append(patientDiv);
    }
}
function mapDoctorServices(servicesString) {
    var servicesDiv = $('.doc-services .services #serviceContainer');
    var services = convertToJsonString(servicesString); 
    services = JSON.parse(services);
    $('.doc-services').removeClass('hidden');
    if (services.length== 0)
    {
        $('#noService').removeClass('hidden');
    }
    for (var i = 0; i < services.length; i++) {
        var servicename = (lang == "en") ? services[i].en : services[i].ar;
        $(servicesDiv).append(createNewService(servicename,services,services[i]));
    }
}
function createNewService(serviceName, services,serviceObject)
{
    var serviceElement = $('<div class="service">' + serviceName + ' <i class="fa fa-close deleteService"><i></div>');
    serviceElement.data('service', serviceObject)
    serviceElement.find('.deleteService').click(function () {
        var closeIcon = $(this);
        var deletedService = closeIcon.parents('.service');
        var newServices = $(services).removeService(deletedService.data('service'));
        closeIcon.toggleLoadingIcon('fa-close');//show loading icon
        $.post('/' + defaultPathForDoctorArea + '/addDoctorService', { service: JSON.stringify(newServices) }, function (data, stat) {
            if (data) {
                deletedService.slideUp();
                $('#addService button').data('services', newServices);
            }
            else {
                alert(language.serverOperationProblem);
            }
        })
    .complete(function () {
        closeIcon.toggleLoadingIcon('fa-close');
    })
    .error(function () { alert(language.serverOperationProblem); });
    });
    return serviceElement;
}
function adNewService(context)
{
    context = $(context);
    var arabicServiceinp = $('#arabicService');
    var EnglishServiceinp = $('#englishService');
    var isValidArService = (arabicServiceinp.isValidFormat(patterns.arabicText, formTitles.enterArabicText))
    ?arabicServiceinp.isValidLength(3):false;
    var isValidEngService = (EnglishServiceinp.isValidFormat(patterns.englishText, formTitles.enterEnglishText))
    ?EnglishServiceinp.isValidLength(3):false;
    if (isValidArService && isValidEngService)
    {
        var engName=EnglishServiceinp.val();
        var arname = arabicServiceinp.val();
        var currentServicesArr =context.data('services');
        var addedServiceObj= {};
        addedServiceObj.ar = arname;
        addedServiceObj.en = engName;
        currentServicesArr.push(addedServiceObj);
        var servicesString = JSON.stringify(currentServicesArr);
        context.find('i').toggleLoadingIcon('fa-plus');
        $.post('/'+defaultPathForDoctorArea+'/addDoctorService', { service: servicesString }, function (data, stat) {
            if(data)
            {
                var text = (lang == "en") ? engName : arname;
                var newElement = $(createNewService(text, currentServicesArr, addedServiceObj)).fadeOut();
                $('.doc-services .services #serviceContainer').prepend(newElement).fadeIn(1000);
                $('#addService button').data('services', currentServicesArr);
            }
            else {
                alert(language.serverOperationProblem);
            }
        })
        .complete(function () {
            context.find('i').toggleLoadingIcon('fa-plus');
            arabicServiceinp.val('');
            EnglishServiceinp.val('');
        })
        .error(function () { alert(language.serverOperationProblem);});
    }
}