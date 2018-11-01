using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using tabeeb.Models;
namespace tabeeb.Areas.Admin.Controllers
{
    public class reservingController : mainController
    {
        private static bool dayReservingsResquest = false;
        // GET: /Admin/reserving/
        public ActionResult reserving(string getRes = "")
        {
            if (getRes != "") dayReservingsResquest = true;
            else dayReservingsResquest = false;
            ViewBag.controller = "reserving";
            return View();
        }
        public ActionResult reservingPage()
        {
            return View();
        }
        public JsonResult reservingDataList(int jtStartIndex=0,int jtPageSize=0)
        {
            var data = db.reservings
                .Where(res => 
                    res.reservingDate.Year == DateTime.Now.Year &&
                    res.reservingDate.Month == DateTime.Now.Month &&
                    res.reservingDate.Day == DateTime.Now.Day)
                .Select(r => new
            {
                r.id,
                r.patientName,
                r.reservingDate,
                doctorName = r.doctor.doctorInfo.fnameAr + " " + r.doctor.doctorInfo.lnameAr,
                patientPhone = r.phone,
                doctorPhone = r.doctor.phone,
                confirm = r.confirmed
            })
            .OrderBy(r=>r.doctorPhone)
            .Skip(jtStartIndex).Take(jtPageSize).ToList();
            int totalRecords = db.reservings
                .Count(res =>
                    res.reservingDate.Year == DateTime.Now.Year &&
                    res.reservingDate.Month == DateTime.Now.Month &&
                    res.reservingDate.Day == DateTime.Now.Day);
            try
            {
                return Json(new { Result = "OK", Records = data,TotalRecordCount=totalRecords});
            }
            catch (Exception e)
            {
                return Json(new { Result = "Error", Message = e.Message });
            }
        }
        public JsonResult confirmReserving(Guid id)
        {
            try
            {
                reserving findReserving = db.reservings.Find(id);
                findReserving.confirmed = true;
                UpdateFields<reserving>(findReserving, db.Entry(findReserving), r => r.confirmed);
                db.SaveChanges();
                return Json(true);
            }
            catch (Exception e)
            {
                return Json(false);
            }
        }
        public JsonResult deleteReserving(Guid id)
        {
            try
            {
                reserving findReserving = db.reservings.Find(id);
                db.reservings.Remove(findReserving);
                db.SaveChanges();
                return Json(new { Result = "OK"});
            }
            catch (Exception ex)
            {
                return Json(new { Result = "Error",Message=ex.Message});
            }
        }
    }
}