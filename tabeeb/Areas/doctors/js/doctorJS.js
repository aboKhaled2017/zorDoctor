﻿/// <reference path="../../../scripts/jquery-1.12.4.js" />
/// <reference path="en-US.js" />
/// <reference path="extensionFunctions.js" />
var defaultPathForDoctorArea = "doctor-site";
var defaultPathAdvices = "/advices/";
var defaultPathSpecialities = "/All-specialities/";
var defaultPathPatients = "/user/";
var defaultPathUsers = "/";
var maxProfessionImg = 2 * 1024 * 1024;
var maxPersonalImg = 1024 * 1024;
var problemMessageAtServer=language.serverProblem
    , operationProblem=language.serverOperationProblem;
var alertServerOerationProblem = function () { alert(operationProblem); }
var toggleLoadingIcon = function (target) { $(target).find('.loading-circle').toggleClass('hidden'); }
function addSomeValidationToDoctorRegistration()
{
    $('.navbar-nav > li').hover(function () {
        $(this).addClass('active').siblings().removeClass('active');
    });
}
function checkCookieIsEnabled()
{
    if(!navigator.cookieEnabled)
    {
        $('#cookiesNotEnabled').removeClass('hidden');
    }
    else
    {
        $('#cookiesNotEnabled').addClass('hidden');
    }
}
$(function () {
    checkCookieIsEnabled();
    addSomeValidationToDoctorRegistration();
    /*global function can be used by many action*/
    var _URL = window.URL || window.webkitURL;
    $('#uploadImage').change(function (e) {
        var imgLoaded = false;
        var imgInput = $(this);
        var files = e.target.files;
        var fileSize = files[0].size;
        var extension = $(this).val().split('.').pop().toUpperCase();
        var filename = $(this).val().split('\\').pop();
        if (!(extension == "PNG" || extension == "JPG" || extension == "GIF" || extension == "JPEG")) {
            alert(language.imgExtension);
            $('#proImage').val("");
            imgInput.siblings('.validationMessage').empty().removeClass('field-validation-valid').addClass('field-validation-error')
           .append('<span id="proImage-error" class="">'+language.chhoseValidImg+'</span>');
            return;//file extension not valid
        }
        if (e.target.files[0].type.indexOf("image") == -1) {
            alert(language.imgFileNotSupported);
            $('#proImage').val("");
            imgInput.siblings('.validationMessage').empty().removeClass('field-validation-valid').addClass('field-validation-error')
           .append('<span id="proImage-error" class="">'+language.chhoseValidImg+'</span>');
            return;//this is not image
        }
        // $('.registrationForm .progress').removeClass('hidden');
        $('#proImage').val(filename);
        if (fileSize > 0) {
            var img = new Image();
            img.src = _URL.createObjectURL(files[0]);
            img.onload = function () {               
                var width = img.naturalWidth, height = img.naturalHeight; 
                if (fileSize>maxProfessionImg) {
                    alert(language.professionImgValidation);
                    $('#proImage').val("");
                    imgInput.siblings('.validationMessage').empty().removeClass('field-validation-valid').addClass('field-validation-error')
                    .append('<span id="proImage-error" class="">'+language.chhoseValidImg+'</span>');
                    return;
                }
                else {
                    alert(language.imgLoadedSuccess);
                    $('#proImage-error').parents('.validationMessage').
                        removeClass('field-validation-error').addClass('field-validation-valid').empty();
                }
            }
        }
    });
    $('.navbar-inverse .navbar-toggle').click(function () {
        $('.navbar-brand > img').toggleClass('toUp');
    });
    $('i.showPassword').on({
        mouseenter: function () {
            $(this).parent().find('input[type="password"]').attr('type', 'text');
        },
        mouseleave: function () {
            $(this).parent().find('input[type="text"]').attr('type', 'password');
        }
    });
    (function () {//hide appointement and profiel page
        if (localStorage.doctorStatus == "false") {
            $('.nav .dropdown-menu > li').each(function (i, li) { if (i == 2 || i == 3) $(li).addClass('notAllowedLink'); });
        }
    }());
});
function callAjax(ajUrl, ajData, ajType, ajContenttype, ajDataType, ajSuccessFunc, ajErrorFunc) {
    $.ajax({
        url: ajUrl,
        data: ajData,
        type: ajType,
        contentType: ajContenttype,
        dataType: ajDataType,
        success: function (result) {
            ajSuccessFunc(result);
        },
        error: function (errormessage) {
            ajErrorFunc(errormessage);
        }
    });
}
function validateLogin(username, pass, check)
{
    var isvalidate = true;
    if (username.trim().length < 3) {
        $('#LogIn #userName').css("border", '2px solid #f00');
        isvalidate = false;
    }
    if (pass.trim().length < 3) {
        $('#LogIn #password').css("border", '2px solid #f00');
        isvalidate = false;
    }
    return isvalidate;
}
function validateContactForm(phone, mail, comment) {
    var isvalidate = true;
    if (phone.match(/[0-9]{11}/)==null) {
        $('#ContactUS form input#phone').css("border", '2px solid #f00');
        isvalidate = false;
    }
    if (mail.match(/^[a-zA-Z0-9_\.-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}/) == null) {
        $('#ContactUS form input#mail').css("border", '2px solid #f00');
        isvalidate = false;
    }
    if (comment == "" || comment.trim().length <15) {
        if (comment == "" || comment.trim() == "")
        {
            $('#ContactUS form textarea#comment').css("border", '2px solid #f00');
        }
        else {
            $('#ContactUS form textarea#comment').attr('placeholder',language.validateFielLength(15)).css("border", '2px solid #f00').val('');
        }
        isvalidate = false;
    }
    return isvalidate;
}
function tryContact(user,phone,mail,comment)
{
    $('#ContactUS form').find('textarea,input').keydown(function () {
        $(this).css('border', '1px solid lightgray');
    });
    if (!validateContactForm(phone, mail,comment)) return false;
    $('#ContactUS form button').find('i').removeClass('fa-send').addClass('fa-circle-o-notch fa-spin');
    $.ajax({
        url: defaultPathUsers+"contactUs",
        data: JSON.stringify({ name: user, mail: mail, message: comment, phone: phone, general: 0 }),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            $('#ContactUS form').find('textarea,input').val('');            
            if(result.result==true)
            {
                $('#ContactUS form button').find('i').addClass('fa-send').removeClass('fa-circle-o-notch fa-spin');
                $('#ContactUS').modal('hide');
                alert(language.messageSentSuccess);
            }
            else {
                alert(operationProblem);
            }
        },
        error: function (errormessage) {
            $('#ContactUS form button').find('i').addClass('fa-send').removeClass('fa-circle-o-notch fa-spin');
            $('#ContactUS').modal('hide');
            alert(language.messageNotSent);
        }
    });
}
function tryLogin()
{
    $('#LogIn input').keydown(function () {
        $(this).css('border-color', 'lightgray');

    });
    var check = $('#LogIn #checkBox').val();
    var pass = $('#LogIn #password').val();
    var username = $('#LogIn #userName').val();
    if (!validateLogin(username, pass, check) ||! $('#LogIn .errorMessage').hasClass('hidden')) return;
    $('#LogIn .overlay').removeClass('hidden');
    $('.modal-header .close').attr('data-dismiss', '');
    $('button.closeModal').attr('data-dismiss', '');
    $.ajax({
        url: "/" + defaultPathForDoctorArea + "/logIn",
        data: JSON.stringify({ userName: username, password: pass, checkBox: check }),
        type: "POST",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            $('#LogIn .overlay').addClass('hidden');
            $('.modal-header .close').attr('data-dismiss', 'modal');
            $('button.closeModal').attr('data-dismiss', 'modal'); 
            if(result.result==true)
            {
                window.open("/" + defaultPathForDoctorArea + "/doctorPage", "_self", "", "");
            }
            else if(result.status==0)
            {
                window.open("/"+defaultPathForDoctorArea+"/profile", "_self", "", "");
            }
            else {
                $('#LogIn .errorMessage').removeClass('hidden');
                $('#LogIn input').keydown(function () {
                    $('#LogIn .errorMessage').addClass('hidden');
                });
            }
        },
        error: function (errormessage) {
            alert(operationProblem);
        }
    });
}
function isArabic(strInput) {
    var arregex = /[\u0600-\u06FF]/;
    for (var i = 0; i < strInput.length; i++)
    {
        if(!arregex.test(strInput[i]))
            return false//not arabic
    }
    return true;
}
function sendToPhone()
{
    alert('we will send ');
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://platform.clickatell.com/messages/http/send?apiKey=tq5DiHIOS1yaX8KdMe4XHQ==&to=201152506434&content=Test+message+text", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log('success');
        }
    };
}
function validateresetpassword(context)
{
    context = $(context);
    if ($(context).val().match("(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{6,}") == null)
    { $(context).val(''); $(context).attr('placeholder', language.enterValidPassword); }
}
function confirmPassword(context) {
    var form = $(context).parents('form');
    if (form.find('input[type="password"]').val().trim() !== $(context).val().trim()) {
        form.find('.confirmPassValidationMessage').text(language.twoPasswordsNotIdentical);
    }
    else {
        form.find('.confirmPassValidationMessage').text("");
    }
}



