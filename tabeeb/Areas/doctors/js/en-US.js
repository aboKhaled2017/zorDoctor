﻿var language = {}, formTitles= {};
var lang = "en";
language.serverProblem = "Problem has been occured during getting data from server";
language.serverOperationProblem = "sorry problem was happend at server during operation ,please try again";
language.imgExtension = "please choose image jpg , png ,gif ,or jpeg extension";
language.chhoseValidImg = "Please choose a valid image";
language.personalImgValidation = "personal image must has equal width and heigth and max size is 1MB";
language.professionImgValidation = "image has size at max2 Miga Bytes (2MG)";
language.imgFileNotSupported = "file not Supported";
language.imgLoadedSuccess = "image has been loaded successfully";
language.mustAgreeOntermOfuser = "you must agree on term of use";
language.enterValidUsernameOrPassword = "enter valid username or e-mail";
language.showPassword = "Show password";
language.hidePassword = "Hide password";
language.logoutAfterChangeUsename = "You will be logged out after chaning your username,are you sure to log out and update your account data";
language.submit = "Submit";
language.next = "Next";
language.notValidUrl = "url is not valid";
language.noReservingToday = "you have no any reservings today";
language.noWrittenAdvices = "There are no any advices written by you untill now";
language.aboutNumber = "about";
language.otherAdvices = function (num) { return num + " other advices"; }
language.adviceUpdatedSuccess = "Advice is successfully updated";
language.areYouSureToDeleteAdvice = "Are you sure you want to delete this Advice?";
language.noPatientViewTillNow = "there are no any patient view for you untill now";
language.ratingWithoutComment = "[Rating without comment]";
language.validateFielLength = function (min, max) {
    if (min != undefined && max != undefined)
        return "this field must contains at least " + min + " charcters and at most " + max + " characters";
    if (max == undefined)
        return "this field must contains at least " + min + " charcters";
    if (min == undefined && max != undefined)
        return "this field must contains at most " + max + " charcters";
}
language.messageSentSuccess = "your message sent successfully";
language.messageNotSent = "error occured,your message can not be sent";
language.enterValidPassword = "please enter valid password";
language.twoPasswordsNotIdentical = "The two passwords not identical";
language.changeScedualedNumber=function(from,to)
{
    return "are you want to change number of scedualed days from " + from + " to " + to;
}
language.addAppointementOfDay = "Add Your Appointement To Day Of";
language.from = "from";
language.to = "to";
language.endPeriodMustExceedBeginPeriod = "\"To\" period must be larger than \"From\" period";
language.periodsAreIntersects = "This period is intersect with one of the already selectd periods, or please enter independent period";
language.periodIsAlreadyExists = "this time period is already exists";
language.enterValidInterval = "You must select valid interval";
language.am = "AM";
language.pm = "PM";
language.noChangesToSave = "There no changes to save";
language.changesAreDone = "Your changes are successfully done";
language.areYourSureToChangeBookingType = "Are you sure to change booking type,in case of changing booking type,you will delete all  appointments that relates with old booking type";
language.bookingTypeChangedSuccess = "your booking type has been changed successfully";
language.getGeneralSpecialityName = function (specialityName) {
    return "speciality of "+specialityName+" in general";
}
language.examination = "Examination";
language.consult = "Consult";
//////////////////////////////////
formTitles.enterEnglishText = "this field accept only english text";
formTitles.enterArabicText = "this field accept only arabic text";