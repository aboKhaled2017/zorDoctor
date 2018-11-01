/// <reference path="../../../Scripts/jquery-1.12.4.min.js" />
/// <reference path="../../../Scripts/jquery-ui-1.12.1.min.js" />
/// <reference path="extension.js" />
/// <reference path="adminTable.js" />
/// <reference path="jtable/jquery.jtable.min.js" />
var modelType;
$(function () {
   var arMessages = getArabicMessageForJtable();
    var dataContainer = $('#patients');
    var tableTitle = "المستخدمين" 
    dataContainer.jtable({
        title: tableTitle,
        paging: true,
        pageSize: 6,
        actions: {
            listAction:   '/admin/patient/List',            
            deleteAction: '/admin/patient/Delete'
        },
        messages: arMessages,
        fields: {
            id: {
                key: true,
                list: false
            },
            username: {
                title: 'اسم المستخدم'
            },
            dateOfJoin: {
                title: 'تاريخ التسجيل',
                type:'date'
            },
            phone: {
                title: 'رقم التليفون',
                sorting:false
            },
            mail: {
                title: 'البريد الالكترونى'
            }
        }       
    });
    //Re-load records when user click 'load records' button.
    $('#LoadRecordsButton').click(function (e) {
        e.preventDefault();
        dataContainer.jtable('load', {
            doctorName: $('#docName').val(),
            dateOfregister: $('#dateOfregister').val()
        });
    });
    //Load all records when page is first shown
    $('#LoadRecordsButton').click();
    dataContainer.jtable('load');
});

