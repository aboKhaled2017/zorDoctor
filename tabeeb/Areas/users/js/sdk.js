﻿/// <reference path="mainPage.js" />
/// <reference path="en-US-Js.js" />
/// <reference path="extension.js" />
/// <reference path="../../../Scripts/jquery-1.10.2.js" />
var FB;
var patientObjectData=null;
var gapi;
currentLangauge = $('body').attr('lang');
//indicate if facebook sdk has been loaded
var facebookSdkLoaded = false;
/*facebook cnfiguration*/
function getFacebookUserData(type) {
    //if type is [login]->operation is login not register
    /*/me?fields=id,email,name,gender,first_name,last_name,age_range,birthday*/
    if (type == "register")
    {//register new user
        FB.api('/me?fields=id,email,name,gender,birthday', function (patientData) {
            var patient = {
                username: patientData.name,
                mail: patientData.email,
                type: (patientData.gender == 'male') ? true : false,
                birthDate: patientData.birthday,
                providerID: patientData.id,
                providerName: 'facebook',
                phone: null,
            }
            patientObjectData = new Object(patient);
            resetExternalFormSetting();
            settingExternalForm();
            $('#externalLogin').find('#externalForm').data('patient', patient).end().modal('show');
            $('button.closeModal,button.close').click(function () {
                $('.facebook .btn').find('i').toggleLoadingIcon('fa-facebook');
            });
        });
    }
    else {//login to registered user
        FB.api('/me?fields=id', function (patientData) {
            $('.facebook').find('button').eq(0).find('i').toggleLoadingIcon('fa-facebook');
            loginUser(patientData.id,'facebook');           
        });
    }
    
}
function facebookLogin(context) {
    /*
    type[login|register]
    */
    if (!navigator.onLine)
    {
        alert(language.notConnectedToInternet);
        return;
    }
    else if ((navigator.onLine && !facebookSdkLoaded)||FB==undefined)
    {
        alert(language.slowInternet);
        return;
    } 
   // $(context).find('i').removeClass('fa-facebook').addClass('fa-circle-o-notch fa-spin');
    FB.login(function (response)
        {
        if (response.status === 'connected') {
            if (response.authResponse) {
                var type = $(context).data('type');
                getFacebookUserData(type);
            }
            else {
                alert(language.facebookAlert);
            }
        }
        else {//user not connected to facebook
            alert(language.notConnectedFacebook);
        }
    },
    {
        scope: 'public_profile,email,user_birthday',
        auth_type: 'rerequest'
    }
    );
}
// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('user status');
    console.log(JSON.stringify(response));
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {

        googleSignOut(); facebookLogOut();
        // Logged into your app and Facebook.
        location.href = "/users";
    }
    else {
        $('html').removeClass('hidden');
    }
}
// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
}
function intiAndLoadSDK()
{
    window.fbAsyncInit = function () {
        FB.init({
            appId:appFacebookID,
            xfbml: true,
            cookie: true,
            version: facebookVersion
        }); 
        // Now that we've initialized the JavaScript SDK, we call 
        // FB.getLoginStatus().  This function gets the state of the
        // person visiting this page and can return one of three states to
        // the callback you provide.  They can be:
        //
        // 1. Logged into your app ('connected')
        // 2. Logged into Facebook, but not your app ('not_authorized')
        // 3. Not logged into Facebook and can't tell if they are logged into
        //    your app or not.
        //
        // These three cases are handled in the callback function.
        FB.AppEvents.logPageView();
        //checkLoginState();
    };
    (function (d, s, id) {
        var graphLang = (currentLangauge == "ar") ? 'ar_AR' : 'en_US';
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/"+graphLang+"/sdk.js";
        fjs.parentNode.insertBefore(js, fjs); 
        //facebook sdk has been loaded
        facebookSdkLoaded = true;
    }(document, 'script', 'facebook-jssdk'));
    FB = FB;
}   
function getStart()
{
    if (navigator.onLine) {
        intiAndLoadSDK();//load facebook sdk
        //load google sdk
        var script = document.createElement('script');
        script.onload = function () {
            onLoadGoogleCallback();
            $('#googleSignIn').unbind('click');
        };
        //get basic information
        script.src = "https://apis.google.com/js/platform.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
    }
        $('#googleSignIn').click(function () {
            if(!navigator.onLine)
            {
                alert(language.notConnectedToInternet);
            }
            else{
                alert(language.slowInternet);
            }
        });
}
function onLoadGoogleCallback() {
    //called when google sdk has been loaded
    gapi.load('auth2', function () {
        auth2 = gapi.auth2.init({
            client_id: googleAppClientID,
            cookiepolicy: 'single_host_origin',
            scope: 'profile email'
        });
        gapi = gapi;
        //listen to goole button click
        auth2.attachClickHandler(element, {},
          function (googleUser) {
              var type = ($(element).data('type') == "login") ? "login" : "register";
              /*  BasicProfile.getId()
                BasicProfile.getName()
                BasicProfile.getGivenName()
                BasicProfile.getFamilyName()
                BasicProfile.getImageUrl()
                BasicProfile.getEmail()*/
              var p = googleUser.getBasicProfile();
              //this is access token
              //var g_token = googleUser.getAuthResponse().id_token;                       
              if (type == "login")
              {
                  //show loading icon
                  $(element).prev().find('i').toggleLoadingIcon('fa-google-plus');
                  loginUser(p.getId(), 'google');
                  return;
              }
              var patient = {
                  providerID: p.getId(),
                  username: p.getGivenName(),
                  mail: p.getEmail(),
                  type: null,
                  phone: null,
                  birthDate: null,
                  providerName: 'google'
              }
              $(element).find('i').toggleLoadingIcon('fa-google-plus');
              patientObjectData = new Object(patient);
              resetExternalFormSetting();
              settingExternalForm();
              $('#externalLogin').find('#externalForm').data('patient', patient).end().modal('show');              
              $('button.closeModal,button.close').click(function(){
                  $(element).find('i').addClass('fa-google-plus').removeClass('fa-circle-o-notch fa-spin');
              });
          }, function (error) {
              alert(language.emailProblem);
          }
          );
    });

    element = document.getElementById('googleSignIn');
}
function CheckGooglelogin()
{//check if user is signed in
    var isUserIsLoggedNowByGoogle = gapi.auth2.getAuthInstance().isSignedIn.get();
    if (isUserIsLoggedNowByGoogle) {
        location.href = "/"+defaultPathUsers;
    }
    else {
        $('html').removeClass('hidden');
    }
}
function settingExternalForm()
{/*
this function identify the null fields to show in form to be inputed by user to complete registration
*/
    var externalForm = $('#externalForm');
    if (patientObjectData.type == null)
        externalForm.find('.gender').removeClass('hidden');
    if (patientObjectData.birthDate == null)
        externalForm.find('.birthDate').removeClass('hidden');
    if(patientObjectData.type == null||patientObjectData.birthDate == null)
    {
        externalForm.find('.form-alert').text(language.formAlert);
    }
}
function resetExternalFormSetting()
{//this function hide by default the gender and birthdate fields
 //that they will be show on google registering
    var externalForm = $('#externalForm');
    externalForm.find('.gender,.birthDate').addClass('hidden');
}
function loginUser(providerID,providerName)
{/*this function call when external user want to login
*/
    $.post(defaultPathPatients + 'externalLogin', { providerID: providerID, providerName: providerName }, function (result, status) {
        if(result=="error")
        {
            //server problem
            alert(language.loginFaild);
        }
        else if (result) 
        {//login successeded
            location.href = defaultPathUsers;
        }
        else if(!result)
        {//not registered            
            if (providerName == "facebook")
                $('.facebook .btn').find('i').toggleLoadingIcon('fa-facebook');
            else $('#googleSignIn').prev().find('i').toggleLoadingIcon('fa-google-plus');
            alert(language.haveNoAccount);
        }
    });
}
//this function called to load facebook and google sdk
getStart();

