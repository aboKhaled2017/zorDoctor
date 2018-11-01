/// <reference path="adminTable.js" />
/// <reference path="../../../Scripts/jquery-1.12.4.min.js" />
/// <reference path="../../../Scripts/jquery-ui-1.12.1.min.js" />
/// <reference path="extension.js" />
/// <reference path="jtable/jquery.jtable.min.js" />
var todayReservings = "حجوزات اليوم";
var reservingConfirm = "تأكيد الحجز"; 
var reservigIsConfirmed = "تم تأكيد الحجز";
$(document).ready(function () {
    $('#reservingsToday').jtable({
        title: todayReservings,
        paging: true,
        pageSize: 8,
        selecting: true,
        actions: {
            listAction: '/admin/reserving/reservingDataList',
            deleteAction: '/admin/reserving/deleteReserving',
        },
        messages:getArabicMessageForJtable(),
        fields: {
            id: {
                key: true,
                list: false
            },
            patientName: {
                title: 'اسم المريض'
            },
            patientPhone: {
                title: 'رقم تليفون المريض'
            },
            doctorPhone: {
                title: 'رقم هاتف الطبيب'
            },
            doctorName: {
                title: 'اسم الطبيب'
                //create: false,
                //edit: false
            },
           confirm:{
               title: 'التأكيد على الحجز',
               width:'5%',
            display: function (data) {
                return createConfirmButton(data.record);
            },
            create: true,
            edit: false
        }
            /*confirm: {
                title: 'confirm',
                width: '10%',
                type: 'radiobutton',
                list: 'false',
                defaultValue: 'false',
                options: { 'false': 'not confirme', 'true': 'confirm' }
            },
            type: {
                title: 'Type',
                width: '15%',
                list: false,
                type: 'radiobutton',
                options: { 'false': 'male', 'true': 'female' },
                defaultValue: 'false',
                onchange : 'select_function(this)'
            },
            docSpId: {
                title: 'Select doctor speciality',
                create: true,
                edit: true,
                list: false,
                dependsOn: ['id'],
                options: ['الباطنة','النسا والتوليد','امراض جلدية']
            }*/
        }
    });
    $('#reservingsToday').jtable('load');
});
function createConfirmButton(record)
{
    var confirmBtn = (record.confirm)
    ? $('<div class="bg-success reservingIsConfirmed"><i class="glyphicon glyphicon-ok-sign fa-lg"></i> ' + reservigIsConfirmed + '</div>')
    : $('<button class="btn btn-primary">' + reservingConfirm + '</button>');   
    if (!record.confirm)
    {
        confirmBtn.click(function () {
            var btn = $(this);
            btn.append('<i></i>').find('i').toggleTextWithLoadingIcon(); 
            $.post('/admin/reserving/confirmReserving', { id: record.id }, function (data, status) {
                if (data) {
                    btn.replaceWith('<div class="bg-success reservingIsConfirmed"><i class="glyphicon glyphicon-ok-sign fa-lg"></i> ' + reservigIsConfirmed + '</div>')
                }
                else {
                    alert('error at server,please try again');
                }
            }).fail(function () { alert('error at server,please try again'); })
                .error(function () { alert('error at server,please try again'); })
                .complete(function () {
                btn.find('i').toggleTextWithLoadingIcon();
            });
        });
    }
    return confirmBtn;
}