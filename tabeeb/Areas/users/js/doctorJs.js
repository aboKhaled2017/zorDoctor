/// <reference path="ar-EG-JS.js" />
/// <reference path="mainPage.js" />
/// <reference path="../../../scripts/jquery-1.12.4.js" />
/// <reference path="extension.js" />
/*these are function of doctor page--------------------------*/
function getPatientViewsOnDoctor(direction,docID) {
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
                showPtientVeiwRecordsAsHtml(PVData.loadedRecords, allPatientsDiv, PVData.navigator, defaultPageSizeForPatientViews);
                buttonVisiblityControl();
                return;
            }
        }; break;
        case -1: {
            --PVData.navigator;
            allPatientsDiv.empty();
            showPtientVeiwRecordsAsHtml(PVData.loadedRecords, allPatientsDiv, PVData.navigator, defaultPageSizeForPatientViews);
            buttonVisiblityControl();
            return;
        }; break;
        default: break;
    }
    //show loading icon
    patientViewsDiv.find('.loadingComments').removeClass('hidden'); 
    $.post(defaultPathForDoctorArea + 'doctorPatientViews',
        { pageNumber: PVData.nextpageNumber, pageSize: defaultPageSizeForPatientViews, doctorID: docID },
        function (data, status) {           
            //show loading icon            
            patientViewsDiv.find('.loadingComments').addClass('hidden');
            if (data.status == false) {
                error(problemMessageAtServer);
            }
            else {
                if (data.data.length > 0) {
                    PVData.totalRecordsAtServer = data.total;
                    PVData.loadedRecords = (PVData.loadedRecords.concat(data.data));
                    PVData.navigator = PVData.navigator + 1;
                    PVData.nextpageNumber = PVData.nextpageNumber + 1;
                    //add newlly loadded data to view model
                    allPatientsDiv.empty();
                    showPtientVeiwRecordsAsHtml(PVData.loadedRecords, allPatientsDiv, PVData.navigator, defaultPageSizeForPatientViews);
                    buttonVisiblityControl();
                }
                else {
                    patientViewsDiv.find('.alert').removeClass('hidden').text(language.noPatientViewsForDoctor);
                }
            }
        })
    .error(function () {
        //show loading icon            
        patientViewsDiv.find('.loadingComments').addClass('hidden');
        patientViewsDiv.find('.alert').removeClass('hidden').text(language.noPatientViewsForDoctor);
    })
    .fail(function () {
        //show loading icon            
        patientViewsDiv.find('.loadingComments').addClass('hidden');
        patientViewsDiv.find('.alert').removeClass('hidden').text(language.noPatientViewsForDoctor);
    });
}
function getCurrentPatientView(doctorID) {   
    var patientViewDiv = $('#patient-view');
    $('#addBtnView').data('doctorID', doctorID);
    $('#patientRate').removeClass('hide');//show patient rate part
    var ratingDiv = $('#patientRate .stars'); 
    $.get(defaultPathPatients + 'getCurrentPatientView', { docID: doctorID }, function (data, status) {
        if(!data)
        {//patient is not authenticated
            ratingDiv.data('status',false);
        }
        else
        {
            if (data.isAuthenticated) ratingDiv.data('isAuthenticated', true);
            else  ratingDiv.data('isAuthenticated', false);
            if (data.canRate) ratingDiv.data('canRate', true);
            else ratingDiv.data('canRate', false);
            ratingDiv.data('status', true);
            //alert(JSON.stringify(data));
            $(ratingDiv).data('value', data.currentPtRate);
            $(patientViewDiv).find('form textarea').val(data.currentPtComment);
            if (data.currentPtComment != null && data.currentPtComment != "") {
                if (data.currentPatinetID != "" && data.currentPatinetID != 0)
                    $(patientViewDiv).find('form button').text('').append('<i class="fa fa-edit"></i> '+language.changeDoctorView);
            }
            $(ratingDiv).find('i').unbind('click');
            handleOnRateChanged(ratingDiv, doctorID);
        }
    });
}
function handleOnRateChanged(rateDiv, doctorID) {
    rateDiv = $(rateDiv);
    var setRating=function(rateValue)
    {
        rateDiv.find('i').each(function (index, icon) {
            if (index < rateValue) $(icon).rateMark(true);
            else {
                $(icon).rateMark(false);
            }
        });
    }
    var onRateClicked = function () {

    }
    var currentRateValue = parseInt(rateDiv.data('value'));
    //set patient rate
    setRating(currentRateValue);
    var onMouswEnter = function (context) {
        $(context).css("cursor", "pointer");
        $(context).rateMark(true)
            .prevAll().rateMark(true);
        $(context).nextAll().rateMark(false);

    }
    var onMouseLeave = function (context) {
        setRating(currentRateValue);
    }
    rateDiv.find('i')   
    .mouseenter(function () { onMouswEnter(this);})
    .mouseleave(function () { onMouseLeave(this);})
    .bind('touchstart click',function () {
        var clickedStare = $(this);
        var ratedValue = clickedStare.index() + 1
        rateDiv.find('i').unbind('mouseleave mouseenter click');//ban click event
        clickedStare.rateMark(true).prevAll().rateMark(true);
        if (ratedValue == parseInt(rateDiv.data('value'))) return;//rating is not changes
        rateDiv.data('value', ratedValue);
        if (!rateDiv.data('status')) {//if there are problem at serevr
            if (confirm(language.evaluateProblem))
                location.reload(); return;
        }
        if (!rateDiv.data('isAuthenticated'))
        {//if user not registered 
            if (confirm(language.loginFirst)) {
                gotoLoginPage();
            }
            setRating(currentRateValue); 
            return;
        }
        if (!rateDiv.data('canRate'))
        {//if user has no visits to this doctor
            alert(language.youHavNoReservation);
            setRating(currentRateValue);
            return;
        }
        //show laoding icon
        clickedStare.toggleLoadingIcon('fa-star');
        $.post(defaultPathPatients + 'addPatientRate', { rate: ratedValue, doctorID: doctorID }, function (data, status) {
             if (data == false) {
                alert(language.serverProblem);
                setRating(currentRateValue);
                 //hide laoding icon
                clickedStare.toggleLoadingIcon('fa-star');
             }
             else{
                 //hide laoding icon
                 clickedStare.toggleLoadingIcon('fa-star');
                 setRating(ratedValue);
             }
            /*else {
                var rateDivInComments = $('.patient-view .patients .patient:first-of-type .view p.rate>i');
                if ($(rateDivInComments).parents('.rate').prev().text() == $('.addView textarea').val()) {
                    $(rateDivInComments).each(function (index, icon) {
                        if (index < ratedValue) $(icon).removeClass('fa-star-o').addClass('fa-star');
                        else {
                            $(icon).addClass('fa-star-o').removeClass('fa-star');
                        }
                    });
                }
            }*/
        }).complete(function () { rateDiv.find('i').bind('click','mouseleave mouseenter'); });//end of post
    });//end of click rate event
} 
/*
records->array of patients views that will be displayed
target element->this is container of patient views
*/
function showPtientVeiwRecordsAsHtml(records, targetElement, currentNavigator, pageSize) {
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
        $(ptViewDiv).data('patientName', record.patientName);
        if (record.comment == "" || record.comment.length < 1) {
            record.comment = language.ratingWithoutComment;
            $(ptViewDiv).append('<p class="ptComment" style="color:#f00">' + record.comment + '</p>');
        }
        else {
            $(ptViewDiv).append('<p class="ptComment">' + record.comment + '</p>');
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
/*when user comment on doctor*/
function addPatientComment(btnContext, comment, patientName) {
    btnContext = $(btnContext);
    var doctorID = btnContext.data('doctorID');
    if (comment.length == 0 || comment.trim().length < 3) {
        $(btnContext).prev().val('');
        $(btnContext).prev().attr('placeholder', language.validateFielLength(3));
        return false;
    }
    var rateDiv = $('#patientRate .stars');
    if (!rateDiv.data('status')) {//if there are problem at serevr
        alert(language.serverProblem);
        location.reload(); return;
    }
    if (!rateDiv.data('isAuthenticated')) {//if user not registered 
        if (confirm(language.loginFirst)) {
            gotoLoginPage();
        }
        return;
    }
    var isAddBtn = ($(btnContext).find('i').hasClass('fa-plus')) ? true : false;
    var toggleLoadingIcon = function () {
        if (isAddBtn) $(btnContext).find('i').toggleLoadingIcon('fa-plus');
        else $(btnContext).find('i').toggleLoadingIcon('fa-edit');
    }
    toggleLoadingIcon();//show loading icon
    $.post(defaultPathPatients + 'addPatientComment', { doctorID: doctorID, comment: comment }, function (data, status) {
        if (data) {
            var rate = rateDiv.data('value');
            if (isAddBtn) {//add new comment
                addNewPatientCommentAsHtml(comment, patientName, rate);
            }
            else {//update comment
                //patient name to identify updated record
                updatePatientCommentAsHtml(comment, patientName);
            }
        }
        else {
            alert(language.serverProblem);
        }
    })
     .complete(function (e) {
         toggleLoadingIcon();//hide loading icon        
     })
    .error(function () { alert(language.serverProblem); });
}
/*this function take comment parameters and return html record*/
function addNewPatientCommentAsHtml(comment, name, rate) {
    var patientViewDiv = $('#patient-view');
    $(patientViewDiv).find('form button').text('').append('<i class="fa fa-edit"></i> ' + language.changeDoctorView);
    var allPatientsDiv = $(patientViewDiv).find('.patients .body');
    var patientDiv = document.createElement('div');
    patientDiv.className = 'patient';
    $(patientDiv).css('display', 'none');
    var ptInfoDiv = document.createElement('div');
    ptInfoDiv.className = 'patient-info';
    $(ptInfoDiv).append('<span class="name"> <i class="fa fa-envelope-o fa-lg"></i> ' + name + ' </span>');
    $(patientDiv).append(ptInfoDiv);
    var ptViewDiv = document.createElement('div');
    ptViewDiv.className = 'view';
    $(ptViewDiv).data('patientName', name);
    $(ptViewDiv).append('<p>' + comment + '</p>');
    var doctorRate = document.createElement('p');
    doctorRate.className = 'rate';
    for (var k = 0; k < rate ; k++) {
        $(doctorRate).append('<i class="fa fa-star fa-lg"></i>');
    }
    for (var k = rate; k < 5 ; k++) {
        $(doctorRate).append('<i class="fa fa-star-o fa-lg"></i>');
    }
    $(ptViewDiv).append(doctorRate);
    $(patientDiv).append(ptViewDiv);
    $(allPatientsDiv).prepend('<hr class="center-block">');
    $(allPatientsDiv).prepend(patientDiv);
    $(patientDiv).fadeIn(1000);
    var textArea = $(allPatientsDiv).parents('.patients').siblings('.addView').find('textarea');
    $(textArea).keyup(function () {
        var text = $(this).val();
        $(patientDiv).find('.view p:first-of-type').text(text);
    });
}
/*when user edit the comment on doctor*/
function updatePatientCommentAsHtml(newComment, patientName) {
    var allViews = $('#patient-view').find('.patients .body .view');
    allViews.each(function (i, view) {
        view = $(view);
        if (view.data('patientName') == patientName) {
            view.find('.ptComment').text(newComment);
        }
    });
}
