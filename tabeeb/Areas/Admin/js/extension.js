﻿/// <reference path="../../../Scripts/jquery-1.10.2.min.js" />
$.prototype.clearText = function (element) {
    $(this).val('');
}
$.prototype.toggleLoadingIcon = function (currentIconClass) {
    if($(this).hasClass('fa-spin'))
    {
        $(this).removeClass('fa-spinner fa-spin');
        $(this).addClass($(this).data('class'));
    }
    else
    {
        $(this).data('class', currentIconClass);
        $(this).removeClass(currentIconClass).addClass('fa-spinner fa-spin');
    }
}
$.prototype.toggleTextWithLoadingIcon = function () {
    var context = $(this);
    if (context.data('text')!=undefined) {
        context.find('i').remove();
        context.text(context.data('text'));
        context.removeData();
    }
    else {
        context.data('text', context.text());
        context.text('').append('<i class="fa fa-spinner fa-spin"></i>');
    }
}
$.prototype.toggleAttribute = function () {
    var el = $(this);
    if (el.attr('required') == undefined) el.attr('required', 'required');
    else el.removeAttr('required');
}
$.prototype.togglePassowrdShow = function () {
    var el = $(this);
    if (el.prop('type') == 'text') el.attr('type', 'password');
    else el.attr('type', 'text');
}
$.prototype.toggleText = function () {
    var el = $(this);
    var currentText = el.text();
    var alternatText = el.data('text');
    el.data('text', currentText);
    el.text(alternatText);
}
$.prototype.toggleIconWithLoadingImg=function()
{
    if($(this).find('i').hasClass('hidden'))
        $(this).find('i').removeClass('hidden').end().find('img').addClass('hidden');
    else
        $(this).find('i').addClass('hidden').end().find('img').removeClass('hidden').css('display', 'inline-block');
}
$.prototype.rateMark = function (isRated) {
    var icon = $(this);
        if (isRated) icon.removeClass('fa-star-o').addClass('fa-star');
        else icon.addClass('fa-star-o').removeClass('fa-star');
        return icon;
}
var patterns = {};
patterns.arabicText = '^[^a-zA-Z]*$';
patterns.englishText = '^[^\u0600-\u06FF]*$';
/*validate input as css*/
$.prototype.isValidFormat = function (pattern, placeholderMessage) {
    var input = $(this);
    input.unbind('keyup');
    var val = input.val();
    if (val.match(pattern) != null) {
        return true;
    }
    else {
        input.val('');
        input.attr('placeholder', placeholderMessage);
        input.css('border-color', 'red');
        input.keyup(function () {
            input.css('border-color', 'gray');
        });
        return false;
    }
}
$.prototype.isValidLength = function (minLength, maxLength) {
    var input = $(this); 
    input.unbind('keyup');
    var val = input.val();
    if (val.length < minLength || (maxLength != undefined && val.length > maxLength)) {
        input.val('');
        input.attr('placeholder',validateFielLength(minLength, maxLength));
        input.css('border-color', 'red');
        input.keyup(function () {
            input.css('border-color', 'gray');
        });
        return false;
    }
    else {
        return true;
    }
}
function validateFielLength(min, max) {
    if (min != undefined && max != undefined)
        return "هذا الحقل لابد ان يحتوى على الاقل " + min + " من الحروف وعلى الاكثر " + max + " من الحروف";
    if (max == undefined)
        return "هذا الحقل لابد ان يحتوى على الاقل " + min + " من الحروف";
    if (min == undefined && max != undefined)
        return "هذا الحقل لابد ان يحتوى على الاكثر  " + max + " من الحروف";
}

