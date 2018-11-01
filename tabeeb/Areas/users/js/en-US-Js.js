﻿var language = {};
language.nameNotValid = "name is not valid";
language.userNameIsAlreadyExists = "This username is already exists";
language.phoneNumberIsAlreadyExists = "This phone number is already exists";
language.emailNotVlaid = "email is not valid";
language.commentNotValid = "comment is not valid";
language.nameIsTooMany = "name is too many";
language.enterValidPassword = "enter valid password";
language.twoPasswordNotEqual = "The two passwords not identical";
language.validateFielLength = function (min, max)
{
    if (min != undefined && max != undefined)
        return "this field must contains at least " + min + " charcters and at most " + max + " characters";
    if(max==undefined)
        return "this field must contains at least " + min + " charcters";
    if(min==undefined&&max!=undefined)
        return "this field must contains at most " + max + " charcters";
}
language.notConnectedToInternet = 'you are not connected to internet';
language.slowInternet = "the internet speed is something slow,please try agin";
language.emailProblem = "problem has been occured during getting your email";
language.loginPoblemAtServer = "problem occured during login operation,please try again and enter valid data to fields";
language.login = "Login";
language.formAlert = "complete some of your data for joining us";
language.changeProfileNameAlert = "You will be logged out after chaning your username,are you sure to log out and update your profile data";
language.loginFaild = "Login faild,please try again";
language.notConnectedFacebook = "you are not connected to facebook,please login to facebook,then register or login to tabeebak site";
language.facebookAlert = "you must agree on giving tabeebak site some information from facebbok about you,so that you can easlly login,Please try login again ";
language.cancelAppointementAlert = "Are you sure to cancel your appointement at doctor";
language.notifyPatientWithCancelAppointement = "Your appointement has been canceled,we will inform doctor with your canceling";
language.notSuccessOperation = "operation has been failed,some error occured at server";
language.allDestricts = "All destricts";
language.cannotLoadData = "can not load data from server now,may be internet is slow,or some problems has been occured at server,please try again";
language.serverProblem = "problem has been occured during execution operation,please try again";
language.professions =[];//not used
language.professions[0] = "Professor of";
language.professions[1] = "Lecturer of";
language.professions[2] = "Consultant of";
language.professions[3] = "Specialist in";
language.professions[4] = "Assistant Lecturer in";
language.professions[5] = "Assistant Professor in";
language.noMatchedItemsForSearch = "There are no any result matched for your search";
language.specialityname = "The speciality of ";
language.specializedDoc = "The specialized doctors of ";
language.noMathchedResult = "No matched result";
language.noWrittenAdvices = "There are no any advices written by you untill now";
language.aboutNumber = "about";
language.otherAdvices = "other advices";
language.ratingWithoutComment = "Rating without comment";
language.noPatientViewsForDoctor = "there are no any patient view for you untill now";
language.changeDoctorView = "change view on doctor";
language.evaluateProblem = "problem has been occured with evalution please refresh page and try again,are you want to refresh page";
language.loginFirst = "please login first,are you want to login now";
language.youHavNoReservation = "you hav no reservation to this doctor yet,so you have no ability to make rating or comment now";
language.haveNoAccount = "you have no account on tabeebak,please register now";
language.fromTime = "from";
language.toTime = "to";
language.noAvailbalAppointements = "No available appointements";
language.pleaseSelectAppointement = "please select appointement from reserving table";
language.waitingTime = function (minutes) {
    if (minutes >= 3) return minutes + "minutes waiting time before entrance to doctor";
    return "now waiting before entrance to doctor";
}
language.noDoctorAtThisSpeciality = "No doctors at this speciality";
language.LikeThisAdvice = "like this advice";
language.dislikeThisAdvice = "cancel like on advice";
language.thankForSharingAdvice = "Thank you for sharing advice";
language.adviceNotShared = "the does not shared successfully";
language.otherAdvices = function (num) { return num + " other advices"; }
language.noCommentsExits = "there are no any comments";
language.validateFielLength = function (min, max) {
    if (min != undefined && max != undefined)
        return "this field must contains at least " + min + " charcters and at most " + max + " characters";
    if (max == undefined)
        return "this field must contains at least " + min + " charcters";
    if (min == undefined && max != undefined)
        return "this field must contains at most " + max + " charcters";
}