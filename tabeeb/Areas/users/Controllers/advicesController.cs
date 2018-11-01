using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using tabeeb.Models;
using tabeeb.Controllers;
using tabeeb.Areas.users.Models;
using tabeeb.Areas.doctors.Models;
namespace tabeeb.Areas.users.Controllers
{
    /*this is for operation on doctors advices pages*/
    public class advicesController : mainController
    {
        /*get doctor advices*/
        public ActionResult advices(byte spID=0,string doctorID=null,int pageNumber = 1)
        {
            patient currrentPatient = getCurrentpatient();
            IEnumerable<advice> data =new List<advice>();//list of advicesif doctorID was not empty or null
            if (!string.IsNullOrEmpty(doctorID))
            {
                var id = Guid.Parse(doctorID);
                data = db.doctors.Find(id).advices;
            }
            else if(spID!=0)//if specialityID not 0
            {
                data = db.specialities.Where(s => s.id == spID)
                    .allDoctors()
                    .activatedDoctors()
                    .allAdvices();
            }
            else
            {
                data = db.advices;
            }
            var doctorAdvices = data.ToList().Where(a => a.doctor.isActivated())
                .OrderByDescending(a => a.dateOfJoin)
                .Select(ad =>
                    new adviceCard
                    {
                        date = ad.dateOfJoin,
                        content = ad.adviceContent,
                        id = ad.id,
                        comments = ad.commentOnAdvices.Count(c => c.comment != null),
                        likes = ad.commentOnAdvices.Count(c => c.like == true),
                        shares = ad.commentOnAdvices.Count(c => c.share == true),
                        seens = ad.commentOnAdvices.Count(c =>c.seen),
                        name=(currentLanguage == "en")
                        ?ad.doctor.doctorInfo.fnameEng+" "+ad.doctor.doctorInfo.lnameEng
                        :ad.doctor.doctorInfo.fnameAr+" "+ad.doctor.doctorInfo.lnameAr,
                        speciality = (currentLanguage == "en") ? ad.doctor.doctorInfo.profTitleEng : ad.doctor.doctorInfo.profTitleAr,
                        image=ad.doctor.doctorInfo.image,
                        doctorID=ad.doctorID,
                        isLiked = (currrentPatient == null) ? false : ad.commentOnAdvices.Any(c => c.patient.id== currrentPatient.id&&c.like),
                        isPatientCommented=(currrentPatient == null) ? false:ad.commentOnAdvices.Any(c=>c.patientID==currrentPatient.id)
                    })
                    .Skip((pageNumber - 1) * maxNumberOfAdvicesCardsForEachPage)
                    .Take(maxNumberOfAdvicesCardsForEachPage).ToList();
            paginationInfo paging = new paginationInfo();
            paging.currentPage = pageNumber;
            paging.itemsPerPage = maxNumberOfAdvicesCardsForEachPage;
            paging.totalItems = data.Count(a => a.doctor.doctorInfo.profileIsAccepted);
            var allData = new Tuple<List<specialityWithDoctorsData>, List<adviceCard>, paginationInfo>
                (db.specialities.getSpecialityWithDoctorsDataList().ToList(),doctorAdvices.ToList(),paging);
            return View(allData);
        }
        [HttpPost]
        /*add comment on advice by javascript*/
        [areaAuthorize("users", Roles = "user")]
        public JsonResult addCommentOnAdvice(Guid adviceID,string comment)
        {
            try
            {
                patient currentPt = getCurrentpatient();
                commentOnAdvice newcomment = new commentOnAdvice();
                newcomment.id = Guid.NewGuid();
                newcomment.comment = comment;
                newcomment.seen = true;
                newcomment.adviceID = adviceID;
                newcomment.patientID = currentPt.id;
                db.commentOnAdvices.Add(newcomment);
                db.SaveChanges();
                return Json(new { name=currentPt.username}, JsonRequestBehavior.AllowGet);
            }
            catch(Exception)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }
        [HttpPost]
        [areaAuthorize("users", Roles = "user")]
        /*increments likes/shares/seens number of the advice by javascript*/
        public JsonResult incrementAdviceNotificationByOne(Guid adviceID, string type)
        {
            try
            {
                patient currentPt = getCurrentpatient();
                commentOnAdvice isPatientCommented = db.commentOnAdvices.FirstOrDefault(c => c.patientID == currentPt.id && c.adviceID == adviceID);
                if(isPatientCommented!=null)
                {//user already has record on this advice
                    isPatientCommented.like = !isPatientCommented.like;
                    db.Entry(isPatientCommented).State = System.Data.Entity.EntityState.Modified;
                    db.SaveChanges();
                    return Json(true, JsonRequestBehavior.AllowGet);
                }
                else
                {//user has no record on this advice before
                    commentOnAdvice newcomment = new commentOnAdvice();
                    newcomment.id = Guid.NewGuid(); 
                    newcomment.seen = true;
                    newcomment.adviceID = adviceID;
                    newcomment.patientID =currentPt.id;                   
                    switch (type)
                    {
                        case "share": newcomment.share = true; break;
                        case "like": newcomment.like = true; break;
                        default: break;
                    }
                    db.commentOnAdvices.Add(newcomment);
                    db.SaveChanges();
                    return Json(true, JsonRequestBehavior.AllowGet);
                }                
            }
            catch (Exception ex)
            {
                return Json(false, JsonRequestBehavior.AllowGet);
            }
        }
        /*get comments of one advice*/
        public JsonResult getAdviceComments( Guid adviceID,byte pageNumber=1,byte pageSize=3)
        {
            var comments = db.commentOnAdvices
                .Where(com => com.adviceID == adviceID && com.comment != null)
                .OrderBy(c=>c.like)
                .Skip((pageNumber-1)*pageSize).Take(pageSize)
                .Select(p => new {patientName=p.patient.username,p.comment }).ToList();
            var count=db.commentOnAdvices.Count(com => com.adviceID == adviceID && com.comment != null);
            return Json(new { data = comments, total =count}, JsonRequestBehavior.AllowGet);
        }

    }
}