using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using tabeeb.Models;
namespace tabeeb.Areas.Admin.Controllers
{
    public class patientController : mainController
    {
        private static int numOfPtRequested = 0;
        public ActionResult patient(string getPt="")
        {
            int num = 0;
            try
            {
                num = int.Parse(getPt);
            }
            catch (Exception) { num = 0; }
            if (num > 0) numOfPtRequested = num;
            else numOfPtRequested = 0;
            ViewBag.controller = "patient";
            return View();
        }
        public JsonResult List(string username, string dateOfregister, int jtStartIndex = 0, int jtPageSize = 0, string jtSorting = null)
        {
            try
            {
                IEnumerable<patient> data = new List<patient>();
                data = db.patients;
                //filter data
                if (!string.IsNullOrEmpty(username))
                {
                    data = data
                        .Where(p=>p.username==username);
                }
                if (!string.IsNullOrEmpty(dateOfregister))
                {
                    DateTime dateOfJoin = DateTime.Parse(dateOfregister);
                    data = data
                        .Where(d => d.dateOfJoin.Date == dateOfJoin.Date);
                } //end of filter 
                var patientsdata = data.Select(d => new
                {
                    d.id,
                    d.mail,
                    d.phone,
                    d.dateOfJoin,
                    d.username,
                    reservingsCount = d.reservings.Count
                }).OrderBy(d => d.dateOfJoin)
                                   .Skip(jtStartIndex).Take(jtPageSize);

                return Json(new { Result = "OK", Records = patientsdata, TotalRecordCount = data.Count() }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json(new { Result = "Error", Message = e.Message });
            }
        }
        public JsonResult Delete(Guid id)
        {
            try
            {
                db.patients.Remove(db.patients.Find(id));
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