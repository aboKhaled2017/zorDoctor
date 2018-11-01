/// <reference path="../../../Scripts/jquery-1.12.4.min.js" />
/// <reference path="../../../Scripts/jquery-ui-1.12.1.min.js" />
/// <reference path="extension.js" />
/// <reference path="../../../js/ImageTools.js" />
/// <reference path="jtable/jquery.jtable.min.js" />
var messageForEnglishInputtext = "اكتب النص باللغة الانجليزية";
var messageForArabicInputtext = "اكتب النص باللغة العربية";
var arMessages;
$(function () {
    arMessages = getArabicMessageForJtable();
    arMessages.addNewRecord = 'اضافة تخصص عام';
    arMessages.editRecord = 'تعديل اسم التخصص';
    var tableTitle = "كل التخصصات الموجودة";
    $('#setting').jtable({
        title: tableTitle,
        messages: getArabicMessageForJtable(),
        messages: arMessages,
        paging: true,
        pageSize:4,
        actions: {
            listAction:   '/admin/setting/specialityDataList',            
            createAction: '/admin/setting/addSpeciality',
            updateAction: '/admin/setting/updateSpeciality',
            deleteAction: '/admin/setting/deleteSpeciality'
        },
        fields: {
            id: {
                key: true,
                list: false
            },
            nameEng: {
                title: 'اسم التخصص بالانجليزية'
            },
            nameAr: {
                title: 'اسم التخصص بالعربية'
            },
            descriptionEng: {
                title: 'وصف التخصص بالانجليزية',
                type: 'textarea'
            },
            descriptionAr: {
                title: 'وصف التخصص بالعربية',
                type: 'textarea'
            },
            img:{
                title:'صورة التخصص',
                display:function(data)
                {
                    return specialityImageThumbnail(data.record);
                },
                edit: false,
                create: false
            },
            superSpecialityID: {
                list: false,
                type: 'hidden',
                edit: false
            },
            subSpecialities: {
                title: '',
                edit: false,
                create: false,
                display: function (data) {
                    return subSpecialitiestable(data.record);
                }
            }
        },
        //Initialize validation logic when a form is created
        formCreated: function (event, data) {
            data.form.css('width', '500px');
            $(data.form.find('input,textarea')).addClass('form-control');
            $(data.form.find('textarea'))
              .css({ 'height': '100px', 'width': '100%' }); 
              data.form.find('input,textarea').addClass('validate[required,funcCall[checkText]]');
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
function subSpecialitiestable(record)
{
    arMessages.addNewRecord = 'اضافة تخصص فرعى';
    arMessages.editRecord = 'تعديل اسم التخصص الفرعى';
    var superSpID = record.id;
    //Create an image that will be used to open child table
    var button = $('<button class="btn btn-info"><i class="fa fa-arrow-down"></i>  التخصصات الفرعية</button>');
    //Open child table when user clicks the image
    button.click(function () {
        $('#setting').jtable('openChildTable',
                button.closest('tr'),
                {
                    title: 'التخصصات الفرعية لقسم ' + record.nameAr,
                    messages: getArabicMessageForJtable(),
                    messages: arMessages,
                    paging: true,
                    pageSize:3,
                    actions: {
                        listAction: '/admin/setting/specialityDataList?superSpecialityID=' + record.id,
                        createAction: '/admin/setting/addSpeciality',
                        updateAction: '/admin/setting/updateSpeciality',
                        deleteAction: '/admin/setting/deleteSpeciality'
                    },
                    fields: {
                        id: {
                            key: true,
                            list: false
                        },
                        nameEng: {
                            title: 'اسم التخصص الفرعى بالانجليزية'
                        },
                        nameAr: {
                            title: 'اسم التخصص الفرعى بالعربية'
                        },
                        descriptionEng: {
                            title: 'وصف التخصص الفرعى بالانجليزية',
                            type: 'textarea'
                        },
                        descriptionAr: {
                            title: 'وصف التخصص الفرعى بالعربية',
                            type: 'textarea'
                        },
                        img: {
                            title: 'صورة التخصص',
                            display: function (data) {
                                return specialityImageThumbnail(data.record);
                            },
                            edit: false,
                            create:false
                        },
                        superSpecialityID: {
                            list: false,
                            input: function (data) {
                                return '<input type="hidden" name="superSpecialityID"  value="' + superSpID + '" />';
                            },
                            edit: false
                        }
                    },
                    //Initialize validation logic when a form is created
                    formCreated: function (event, data) {
                        data.form.css('width', '500px');
                        $(data.form.find('input,textarea')).addClass('form-control');
                        $(data.form.find('textarea'))
                          .css({ 'height': '100px', 'width': '100%' });
                        data.form.find('input,textarea').addClass('validate[required,funcCall[checkText]]');
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
                }, function (data) { //opened handler
                    data.childTable.jtable('load');
                });
    });
    //Return image to show on the person row
    return button;
}
function specialityImageThumbnail(record) {
    var imgpath = "/Areas/users/spImages/" + record.img;
    var imgContainer = $('<div class="imgContainer"></div>');
    var img = $('<img src="' + imgpath + '" class="img-thumbnail specialityImage"/>');
    img.data('name', record.img).data('id', record.id);
    imgContainer.append(img);
    var cameraIcon = $('<div class="takeSpecialityImage"><i class="fa fa-camera fa-lg"></i> تحميل صورة</div>');
    var uploadInput = $('<input type="file" class="specialityImage" accept="image/*">');
    var uploadImgDiv = $('<div></div>');
    uploadImgDiv.append(cameraIcon).append(uploadImgDiv);
    imgContainer.append(uploadImgDiv);
    cameraIcon.click(function (e) {
        e.preventDefault();
        uploadInput.trigger('click');
    });
    uploadInput.change(function (e) {
        var imageInput = this;
        cameraIcon.find('i').toggleLoadingIcon('fa-camera');
        ImageTools.resize(imageInput.files[0], {
            width:300, // maximum width
            height:300 // maximum height
        }, function (blob, didItResize) {
            getImageLoadedFile(imageInput, e, blob, changeDoctorProfileImage,img);
            //getImageLoadedFile(imageInput, e, changeDoctorProfileImage);old one
        });
    });
    return imgContainer;
}
function getImageLoadedFile(input, e, imageBlob, callBack,targetImage) {
    var _URL = window.URL || window.webkitURL;
    var imgLoaded = false;
    var imgInput = $(input);
    var fileSize = imageBlob.size;
    var extension = imgInput.val().split('.').pop().toUpperCase();
    var filename = imgInput.val().split('\\').pop();
    if (!(extension == "PNG" || extension == "JPG" || extension == "GIF" || extension == "JPEG")) {
        alert("هذا الامتداد غير مطلوب");
        return;//file extension not valid
    }
    if (imageBlob.type.indexOf("image") == -1) {
        alert("هذا النوع من الملفات غير مدعم");
        return;//this is not image
    }
    //$('#imageProgress').removeClass('hidden');
    if (fileSize > 0) {
        var img = new Image();
        img.src = _URL.createObjectURL(imageBlob);
        img.onload = function () {
            var width = img.naturalWidth,
            height = img.naturalHeight;
            if (width != height) {
                alert("الصورة لابد ان يكون  طولها وعرضها متساويان");
                $(targetImage).next().find('i').toggleLoadingIcon();
                return;
            }
            else {//image has been accepted   
                $(targetImage).get(0).src = img.src;
                callBack(imageBlob, extension, targetImage);
            }
        }
    }

}
function changeDoctorProfileImage(file, extension, img) {
    var spId = parseInt(img.data('id'));
    var oldImgName = img.data('name');
    var formData = new FormData();
    formData.append('file', file);
    formData.append('extension', extension);
    formData.append('id', spId);
    formData.append('oldImageFileName', oldImgName);
    $.ajax({
        type: 'post',
        url: '/admin/setting/addOrUpdateSpecialityImage',
        data: formData,
        success: function (status, stat) {
            if (status != true) {
                alert("لم يتم تحميل الصورة بنجاح");
            }
            $(img).next().find('i').toggleLoadingIcon();
        },
        processData: false,
        cache: true,
        contentType: false,
        error: function () {
            alert("لقد حدث خطأ لم يتم تحفظ الصورة");
            $(img).next().find('i').toggleLoadingIcon();
        }
    });
}
function checkText(field, rules, i, options) {
    var inpType = field.attr('name');
    var messageFor
    if (inpType == "nameEng" || inpType == "descriptionEng") {
        var isValidInp = $(field).isValidFormat(patterns.englishText, messageForEnglishInputtext)
        if (!isValidInp) return messageForEnglishInputtext;
    }
    else if (inpType == "nameAr" || inpType == "descriptionAr") {
        var isValidInp = $(field).isValidFormat(patterns.arabicText, messageForArabicInputtext)
        if (!isValidInp) return messageForArabicInputtext;
    }
}
