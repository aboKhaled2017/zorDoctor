using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using tabeeb.Models;
using tabeeb.Controllers;
using System.Threading;
namespace tabeeb.Areas.Admin.Controllers
{
    public class doctorController : mainController
    {
        public ActionResult doctor(string getDocs =null)
        {
            ViewBag.controller = "doctor";
            return View(model:getDocs);
        }
        public JsonResult List(string doctorName, string dateOfregister,int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null, string type = null)
        {            
            try
            {
                var data = new List<doctor>();
                //get data based on type
                if (string.IsNullOrEmpty(type)) data = db.doctorInfoes.getDoctors().ToList();
                else if (type == "pending")
                    data = db.doctorInfoes.Where(d => !d.profileIsAccepted).getDoctors().ToList();
                else if (type == "panning")
                    data = db.doctorInfoes.Where(d => d.profileIsAccepted && !d.stat).getDoctors().ToList();
                else if (type == "noProfile")
                    data = db.doctors.ToList().Where(d => !d.isProfileCreated()).ToList();
                //data are got now
                //filter data
                if (!string.IsNullOrEmpty(doctorName))
                {
                    data = data.Where(d => d.doctorInfo.getFullname("ar").Contains(doctorName)).ToList();
                }
                if (!string.IsNullOrEmpty(dateOfregister))
                {
                    DateTime dateOfJoin = DateTime.Parse(dateOfregister);
                    data = data.Where(d => d.dateOfJoin.Date == dateOfJoin.Date).ToList();
                } //ebd of filter data
                if(type=="noProfile")
                {
                    var doctordata = data.Select(d => new
                    {
                        d.id,
                        d.mail,
                        d.phone,
                        d.bookingType,
                        d.dateOfJoin,
                        d.proImage,
                        city = d.destrict.city.nameAr,
                        destName = d.destrict.nameAr,                        
                        specialities = d.specialities.Select(s => new { name = s.nameAr }),
                        specialitiesParentID = d.specialities.FirstOrDefault().superSpecialityID
                    }).OrderBy(d => d.dateOfJoin)
                                    .Skip(jtStartIndex).Take(jtPageSize);
                    return Json(new { Result = "OK", Records = doctordata, TotalRecordCount = data.Count }, JsonRequestBehavior.AllowGet);
                }            
                var doctors =data.Select(d => new
                {
                    d.id,
                    d.mail,
                    d.phone,
                    d.bookingType,
                    d.dateOfJoin,
                    name = d.doctorInfo.fnameAr + " " + d.doctorInfo.lnameAr,
                    d.proImage,
                    d.doctorInfo.stat,
                    d.doctorInfo.examinFees,
                    d.doctorInfo.education,
                    city = d.destrict.city.nameAr,
                    destName = d.destrict.nameAr,
                    allReservings = d.reservings.Count,
                    dayReservings = d.reservings.Where(res => res.doctorID == d.id && (res.reservingDate).Year == DateTime.Now.Year && (res.reservingDate).Month == DateTime.Now.Month && (res.reservingDate).Day == DateTime.Now.Day).ToList().Count(),
                    specialities = d.specialities.Select(s => new { name = s.nameAr }),
                    specialitiesParentID = d.specialities.FirstOrDefault().superSpecialityID
                }).OrderBy(d => d.dateOfJoin)
                .Skip(jtStartIndex).Take(jtPageSize);
                return Json(new { Result = "OK", Records = doctors,TotalRecordCount = data.Count},JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { Result = "Error", Message = e.Message });
            }
        }
        public JsonResult activation(Guid id)
        {/*this method activate doctor profile to be accepted for seeing by patients on site*/
            try
            {
                doctorInfo doctorInfo = db.doctorInfoes.Single(doc => doc.doctorID == id);
                //only set at first time function is called
                if (!doctorInfo.profileIsAccepted) doctorInfo.profileIsAccepted = true;
                doctorInfo.stat = !doctorInfo.stat;
                db.Entry(doctorInfo).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();
                string to = doctorInfo.doctor.mail;
                string subject = "your profile is accepted by tabeebek website adminstration";
                string messageBody = 
                        "<html>"+
                        "<body>"+
                        "<h2>hi " + doctorInfo.doctor.username+ "</h2>" +
                        "<p>"+
                        "Your profile is revisited and accepted by tabeebak website adminstration and"+
                        "<br>from now you can start setting your appointements of examins and bookings,then start your work on tabeebek</p>"+
                        "<a href=localhost/doctors/doctor/doctorPage'>Go to doctor page</a>" +
                        "</body>"+
                        "</html>";
                globalController.sendMailTo(to,subject,messageBody,"sync");
                return Json(new {result=true},JsonRequestBehavior.AllowGet);
            }
            catch(Exception ex)
            {
                return Json(new { result = false }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult GetbyID(int ID)
        {
            var doctor = db.doctors.Find(ID);
            return Json(doctor, JsonRequestBehavior.AllowGet);
        }
        public JsonResult Update(patient doc)
        {
            try
            {
                db.Entry(doc).State = System.Data.Entity.EntityState.Modified;
                db.SaveChanges();
                return Json(true, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult Delete(Guid id)
        {
            try
            {
                db.doctors.Remove(db.doctors.Find(id));
                db.SaveChanges();
                return Json(new { Result = "OK" });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
	}
}