using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using tabeeb.Areas.Admin.Models;
using tabeeb.Models;
namespace tabeeb.Areas.Admin.Controllers
{
    public class settingController : mainController
    {
        public ActionResult setting(string setting)
        {
            return View(model: setting);
        }
        public JsonResult cityDataList()
        {
            var data = db.cities
                .Select(c => new cityData
                {
                    id = c.id,
                    nameEng = c.nameEng,
                    nameAr = c.nameAr                   
                });           
            try
            {
                return Json(new { Result = "OK", Records = data});
            }
            catch (Exception e)
            {
                return Json(new { Result = "Error", Message = e.Message });
            }
        }
        public JsonResult deleteCity(byte id)
        {
            try
            {
                city city = db.cities.Find(id);
                db.cities.Remove(city);
                db.SaveChanges();
                return Json(new { Result = "OK" });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        public JsonResult addCity([Bind(Include = "nameAr,nameEng")] city city)
        {
            try
            {
                city.id =(byte)(db.cities.Count() + 1);
                db.cities.Add(city);
                db.SaveChanges();
                return Json(new { Result = "OK",Record=city});
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        public JsonResult updateCity([Bind(Include = "id,nameAr,nameEng")] city city)
        {
            if (ModelState.IsValid)
            {
                UpdateFields<city>(city, db.Entry(city), c => c.nameEng, c => c.nameAr);
                db.SaveChanges();
                return Json(new { Result = "OK" });
            }
            return Json(new { Result = "ERROR", Message = "ERROR" });
        }
        public JsonResult destrictDataList(byte cityID)
        {
            var data = db.cities.Find(cityID).destricts
                .Select(c => new destrictData
                {
                    id = c.id,
                    nameEng = c.nameEng,
                    nameAr = c.nameAr
                });
            try
            {
                return Json(new { Result = "OK", Records = data });
            }
            catch (Exception e)
            {
                return Json(new { Result = "Error", Message = e.Message });
            }
        }
        public JsonResult deleteDestrict(byte id)
        {
            try
            {
                destrict destrict = db.destricts.Find(id);
                db.destricts.Remove(destrict);
                db.SaveChanges();
                return Json(new { Result = "OK" });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        public JsonResult addDestrict([Bind(Include = "nameAr,nameEng,cityID")] destrict destrict)
        {
            try
            {
                destrict.id = (byte)(db.destricts.Count() + 1);
                db.destricts.Add(destrict);
                db.SaveChanges();
                return Json(new { Result = "OK", Record = destrict });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        public JsonResult updateDestrict([Bind(Include = "id,nameAr,nameEng,cityID")] destrict destrict)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    UpdateFields<destrict>(destrict, db.Entry(destrict), c => c.nameEng, c => c.nameAr);
                    db.SaveChanges();
                    return Json(new { Result = "OK" });
                }
                return Json(new { Result = "ERROR", Message = "ERROR" });
            }
            catch(Exception ex)
            {
                return Json(new { Result = "ERROR", Message = "ERROR" });
            }
        }
        public JsonResult specialityDataList(byte? superSpecialityID, int jtStartIndex = 0, int jtPageSize = 0)
        {
            var data = db.specialities.Where(s => s.superSpecialityID == superSpecialityID)
                .Select(s => new specialityData
                {
                    id = s.id,
                    nameEng = s.nameEng,
                    nameAr = s.nameAr,
                    descriptionAr=s.descriptionAr,
                    descriptionEng=s.descriptionEng,
                    img=s.img,
                    superSpecialityID=s.superSpecialityID
                }).OrderBy(r => r.id)
                  .Skip(jtStartIndex).Take(jtPageSize).ToList();
            int totalRecords = db.specialities.Count(s => s.superSpecialityID == superSpecialityID);
            try
            {
                return Json(new { Result = "OK", Records = data, TotalRecordCount = totalRecords });
            }
            catch (Exception e)
            {
                return Json(new { Result = "Error", Message = e.Message });
            }
        }
        public JsonResult deleteSpeciality(byte id)
        {
            try
            {
                speciality speciality = db.specialities.Find(id);
                db.specialities.Remove(speciality);
                db.SaveChanges();
                return Json(new { Result = "OK" });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        public JsonResult addSpeciality([Bind(Include = "nameAr,nameEng,descriptionAr,descriptionEng,superSpecialityID")] speciality speciality)
        {
            try
            {
                speciality.id = (byte)(db.specialities.Count() + 1);
                db.specialities.Add(speciality);
                db.SaveChanges();
                return Json(new { Result = "OK", Record = speciality });
            }
            catch (Exception ex)
            {
                return Json(new { Result = "ERROR", Message = ex.Message });
            }
        }
        public JsonResult updateSpeciality([Bind(Include = "id,nameAr,nameEng,descriptionAr,descriptionEng")] speciality speciality)
        {
            if (ModelState.IsValid)
            {
                speciality sp = db.specialities.Find(speciality.id);
                sp.nameEng = speciality.nameEng;
                sp.nameAr = speciality.nameAr;
                sp.descriptionAr = speciality.descriptionAr;
                sp.descriptionEng = speciality.descriptionEng;
                UpdateFields<speciality>(sp, db.Entry(sp),
                    s => s.nameAr, s => s.nameEng, s => s.descriptionEng, s => s.descriptionAr);
                db.SaveChanges();
                return Json(new { Result = "OK" });
            }
            return Json(new { Result = "ERROR", Message = "ERROR" });
        }
        //function to validate personal image of registered doctor
        [HttpPost]
        public JsonResult addOrUpdateSpecialityImage(HttpPostedFileBase file, string extension,byte id, string oldImageFileName)
        {
            var comparer = StringComparer.OrdinalIgnoreCase;
            var supportedTypes = new string[] { "png", "jpg", "jpeg", "gif", "PNG", "JPG", "GIF", "JPEG", "blob" };
            var fileName = "";
            //not valid image
            if (file.ContentLength == 0) return Json(false);
            //file extension
            //not valid extension
            if (!supportedTypes.Contains(extension)) return Json(false);
            //image width and height must be 512 px
            using (var img = Image.FromStream(file.InputStream))
            {
                if (img.Width != img.Height)
                {
                    return Json(false);
                }
            }
            file.InputStream.Position = 0;
            fileName = id + "." + extension;//image name that will be stored in db
            try
            {//delete old image if exists
                string oldPath = Server.MapPath("~/Areas/users/spImages/") + oldImageFileName;
                if (System.IO.File.Exists(oldPath))
                {
                    System.IO.File.Delete(oldPath);
                }
                // get a stream                        
                var stream = file.InputStream;
                // and optionally write the file to disk                       
                var path = Path.Combine(Server.MapPath("~/Areas/users/spImages"), fileName);
                using (var fileStream = System.IO.File.Create(path))
                {
                    stream.CopyTo(fileStream);
                }
                speciality sp = db.specialities.Find(id);
                sp.img = fileName;
                UpdateFields<speciality>(sp, db.Entry(sp), s => s.img);
                db.SaveChanges();
                return Json(true);
            }
            catch (Exception)
            {
                return Json(false);
            }
        }
	}
}