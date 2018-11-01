/// <reference path="../../../Scripts/jquery-1.12.4.min.js" />
/// <reference path="../../../Scripts/jquery-ui-1.12.1.min.js" />
/// <reference path="extension.js" />
/// <reference path="jtable/jquery.jtable.min.js" />
var messageForEnglishInputtext = "اكتب النص باللغة الانجليزية";
var messageForArabicInputtext = "اكتب النص باللغة العربية";
var arMessages;
$(function () {
    arMessages = getArabicMessageForJtable();
    arMessages.addNewRecord = 'اضافة محافظة جديدة';
    arMessages.editRecord = 'تعديل اسم المحافظة';
    var tableTitle = "كل المحافظات الموجودة" 
    $('#setting').jtable({
        title: tableTitle,
        messages: arMessages,
        actions: {
            listAction:   '/admin/setting/cityDataList',            
            createAction: '/admin/setting/addCity',
            updateAction: '/admin/setting/updateCity',
            deleteAction: '/admin/setting/deleteCity'
        },
        fields: {
            id: {
                key: true,
                list: false
            },
            nameEng: {
                title: 'اسم المحافظة بالانجليزية'
            },
            nameAr: {
                title: 'اسم المحافظة بالعربية'
            },
            destricts: {
                title: 'المناطق داخل المحافظة',
                width: '40%',
                create:false,
                edit:false,
                display:function(data)
                {
                    return destrictsTable(data);
                }
            },           
        },
        //Initialize validation logic when a form is created
        formCreated: function (event, data) {
            data.form.addClass('');
            $(data.form.find('input')).addClass('form-control');
            data.form.find('input').addClass('validate[required]');
            data.form.find('input[name="nameEng"]').addClass('validate[funcCall[checkText]]');
            data.form.find('input[name="nameAr"]').addClass('validate[funcCall[checkText]]');
            data.form.validationEngine();
        },
        //Validate form when it is being submitted
        formSubmitting: function (event, data) {
            return data.form.validationEngine('validate');
        },
        //Dispose validation logic when form is closed
        formClosed: function (event, data) {
            data.form.validationEngine('hide');
            data.form.validationEngine('detach');
        }
    });
    $('#setting').jtable('load');
});
function destrictsTable(data)
{
    var cityID = data.record.id;
    var destrictContainer = $('<div class="destrctsTd"></div>');
    var button = $('<button class="btn btn-info"><i class="fa fa-arrow-down"></i> كل المناطق الموجودة بمحافظة ' + data.record.nameAr + '</button>');
    button.click(function () {
        var btn = $(this);
        if (!btn.hasClass('opened')) {//open button to load destricts
            btn.addClass('opened');
            btn.find('i').removeClass('fa-arrow-down').addClass('fa-arrow-up');
            if(btn.data('loaded'))
            {
                btn.next().slideToggle();
                return;
            }
        }
        else {
            btn.removeClass('opened');
            btn.find('i').removeClass('fa-arrow-up').addClass('fa-arrow-down');
            btn.next().slideToggle();
            return;
        }
        var destrictContainer = btn.parents('.destrctsTd');
        var destrictTable = $('<table class="destrictTable"></table>');
        arMessages.addNewRecord = 'اضافة منطقة';
        arMessages.editRecord = 'تعديل اسم المنطقة';
        destrictTable.jtable({
            title: 'جدول المناطق',
            messages: getArabicMessageForJtable(),
            messages:arMessages,
            actions: {
                listAction: '/admin/setting/destrictDataList?cityID='+data.record.id,
                createAction: '/admin/setting/addDestrict',
                updateAction: '/admin/setting/updateDestrict',
                deleteAction: '/admin/setting/deleteDestrict'
            },
            fields: {
                id: {
                    key: true,
                    list: false
                },
                nameEng: {
                    title: 'اسم المنطقة بالانجليزية'
                },
                nameAr: {
                    title: 'اسم المنطقة بالعربية'
                },
                cityID: {
                    list: false,
                    create: true,
                    edit: true,
                    input: function (data) {
                            return '<input type="hidden" name="cityID"  value="' + cityID+ '" />';
                    }
                }
            },
            //Initialize validation logic when a form is created
            formCreated: function (event, data) {
                data.form.addClass('');
                $(data.form.find('input')).addClass('form-control');
                data.form.find('input').addClass('validate[required]');
                data.form.find('input[name="nameEng"]').addClass('validate[funcCall[checkText]]');
                data.form.find('input[name="nameAr"]').addClass('validate[funcCall[checkText]]');
                data.form.validationEngine();
            },
            //Validate form when it is being submitted
            formSubmitting: function (event, data) {
                return data.form.validationEngine('validate');
            },
            //Dispose validation logic when form is closed
            formClosed: function (event, data) {
                data.form.validationEngine('hide');
                data.form.validationEngine('detach');
            }
        });
        destrictContainer.append(destrictTable);
        destrictTable.jtable("load");
        btn.data('loaded',true);
        //destrictTable.slideToggle();
    });    
    destrictContainer.append(button);
    return destrictContainer;
}
function checkText(field, rules, i, options) {
    var inpType = field.attr('name');
    var messageFor
    if (inpType == "nameEng")
    {
        var isValidInp = $(field).isValidFormat(patterns.englishText, messageForEnglishInputtext)
        if (!isValidInp) return messageForEnglishInputtext;
    }
    else if (inpType == "nameAr")
    {
        var isValidInp = $(field).isValidFormat(patterns.arabicText, messageForArabicInputtext)
        if (!isValidInp) return messageForArabicInputtext;
    }
}