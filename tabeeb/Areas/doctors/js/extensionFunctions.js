/// <reference path="en-US.js" />
/// <reference path="../../../Scripts/jquery-1.10.2.js" />
var patterns = {};
patterns.arabicText = '^[^a-zA-Z]*$';
patterns.englishText = '^[^\u0600-\u06FF]*$';
/*this function that operate with array ,
    and take removed element as parameter
    and return new arry with removed passed element from array*/
$.prototype.removePeriod = function (element) {
    var arr = $(this);
    if (arr.length == 0) return new Array();
    var isPeriod = arr[0].from != undefined;
    arr = $.grep(arr, function (el) {
        if (isPeriod) {
            if (!(el.from == element.from && el.to == element.to)) return el;
        }
        else {
            if (el != element) return el;
        }
    });
    return arr;
}
$.prototype.removeService= function (element) {
    var arr = $(this); 
    if (arr.length == 0) return new Array();
    arr = $.grep(arr, function (el) {
          if (!(el.en == element.en && el.ar == element.ar)) return el;
    });
    return arr;
}
/*this function check if array contains particular element*/
$.prototype.isContains = function (element) {
    var arr = $(this);
    var isContains = false;
    $(arr).each(function (i, el) {
        if (el.from == element.from && el.to == element.to) { isContains = true; return; }
    });
    return isContains;
}
/*compare two objects*/
var equalPeriod = function (comparedObject1, comparedObject2) {
    var objectType = typeof (comparedObject1);
    if (comparedObject1.hasOwnProperty('from')) {
        return (comparedObject1.from == comparedObject2.from && comparedObject1.to == comparedObject2.to);
    }
    else {
        return comparedObject1 == comparedObject2;
    }
    return false;
}
/*validate input as css*/
$.prototype.isValidFormat= function (pattern, placeholderMessage) {
    var input = $(this);
    input.unbind('keyup');
    var val=input.val();
    if(val.match(pattern)!=null)
    {
        return true;       
    }
    else {
        input.val('');
        input.attr('placeholder',placeholderMessage);
        input.css('border-color', 'red');
        input.keyup(function () {
            input.css('border-color', 'gray');
        });
        return false;
    }
}
$.prototype.isValidLength = function (minLength,maxLength) {
    var input = $(this);
    input.unbind('keyup');
    var val = input.val();
    if (val.length < minLength || (maxLength != undefined && val.length > maxLength)) {
        input.val('');
        input.attr('placeholder',language.validateFielLength(minLength,maxLength));
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
$.prototype.toggleLoadingIcon = function (currentIconClass) {
    if ($(this).hasClass('fa-spin')) {
        $(this).removeClass('fa-spinner fa-spin');
        $(this).addClass($(this).data('class'));
    }
    else {
        $(this).data('class', currentIconClass);
        $(this).removeClass(currentIconClass).addClass('fa-spinner fa-spin');
    }
}
