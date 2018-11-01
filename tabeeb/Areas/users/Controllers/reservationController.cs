using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using tabeeb.Models;
using tabeeb.Controllers;
using tabeeb.Areas.users.languages;
using System.Text.RegularExpressions;
using tabeeb.Areas.users.Models;
namespace tabeeb.Areas.users.Controllers
{
    //this class handle resevation operations when user book appointements on doctors
    public class reservationController : mainController
    {
        //add reservation record to database
        public ActionResult reservation(reservingRecord reservingData)
        {
            try
            {
                //booked doctor
                var targetDoctor = db.doctors.Find(reservingData.docID);
                if (!(ModelState.IsValid&&isAppointementValid(targetDoctor.doctorInfo.reservingType, reservingData.interval)))
                {//reservation data is not valid
                    TempData["error"] =Resource1.invalidBookingData;//show error data on page
                    //redirect to reservation page
                    return RedirectToAction("doctorReservingsPage", new { id = reservingData.docID });
                }
                patient currentPatient = getCurrentpatient();
                if (currentPatient != null)
                {
                    //number of resrevation that patient already reserved before for the same doctor
                    int numberOfreservingAtTheSameDoctorAtTheSameDate = currentPatient.reservings.Count(r => r.doctorID == reservingData.docID && r.reservingDate == reservingData.appointementDate.Date);
                    //onlay available for patinet to reserve 2 times at same doctor at same date
                    if (numberOfreservingAtTheSameDoctorAtTheSameDate > 2)
                    {
                        TempData["error"] = Resource1.maxBookingNumber;
                        return RedirectToAction("doctorReservingsPage", new { id = reservingData.docID });
                    }
                    //return if this patient has already booked at this doctor ,with the same date ,with the same patient name
                    bool isHasAnybookingForThatPatient =
                        currentPatient.reservings.Any(r => r.doctorID == reservingData.docID && r.reservingDate == reservingData.appointementDate.Date && r.patientName == reservingData.name);
                    //user can not book a reservation at the same doctor with the same time with the same patient name
                    if (isHasAnybookingForThatPatient)
                    {
                        TempData["error"] = Resource1.haveBookingAlready;
                        return RedirectToAction("doctorReservingsPage", new { id = reservingData.docID });
                    }
                }
                //add new reservation record at database
                reserving newReservation = new reserving();
                newReservation.doctorID = reservingData.docID;
                newReservation.patientName = reservingData.name;
                newReservation.patientID = (currentPatient!=null)?currentPatient.id:new Nullable<Guid>();
                newReservation.reservingDate = reservingData.appointementDate.Date;
                newReservation.visitType = true;
                newReservation.phone = reservingData.phone;
                newReservation.interval = reservingData.interval;
                newReservation.id = Guid.NewGuid();
                db.reservings.Add(newReservation);
                db.SaveChanges();              
                thankForBookingData bookingDoneData=new thankForBookingData();
                bookingDoneData.name = reservingData.name;
                bookingDoneData.clinicAddress = (currentLanguage == "en") ? targetDoctor.doctorInfo.clinicAddressEng : targetDoctor.doctorInfo.clinicAddressAr;
                bookingDoneData.appointementDate=reservingData.appointementDate;
                bookingDoneData.interval = reservingData.interval;
                bookingDoneData.bookingType = targetDoctor.bookingType;
                Response.Headers.Add("Referer", "/");
                //go to thank you page(booking is done)
                return RedirectToAction("thankYouForBooking", bookingDoneData);
            }
            catch(Exception)
            {
                TempData["error"] = Resource1.serverProblem;
                return RedirectToAction("doctorReservingsPage", new { id = reservingData.docID });
            }            
        }
        //reservation done page
        public ActionResult thankYouForBooking(thankForBookingData data)
        {
            return View(data);
        }
        //page that show appointements for user in order to book his appointements
        public ActionResult doctorReservingsPage(Guid id)
        {
            try
            {
                var doctor= db.doctors.activatedDoctors().Single(d => d.id == id);
                var doctorData =doctor.getDoctorPageInfo(true);
                var appointements = doctor.appointements.Select(a=>new Tuple<Guid,DateTime?,string>(a.id,a.dateOfBooking,a.interval));
                ViewData.Add("appointements",appointements.ToList());
                ViewData.Add("scedualedDayesCount",doctor.doctorInfo.numberOfScedualedDayes);
                return View(doctorData);
            }
            catch
            {
                return Redirect("/" + defaultPathForUsersArea);
            }
            
        }
        //this function check that reservation data is valid 
        private bool isAppointementValid(bool bookingType,string interval)
        {
            if(bookingType)
            { 
                Regex intervalRgx=new Regex("^{\"from\":\"(\\d\\d:\\d\\d\\s(AM|PM))\",\"to\":\"(\\d\\d:\\d\\d\\s(AM|PM))\"}$");
                if(!intervalRgx.IsMatch(interval))return false;
            }
            else{
                Regex intervalRgx=new Regex("^(\\d\\d:\\d\\d\\s(AM|PM))$");
                if(!intervalRgx.IsMatch(interval))return false;
            }
            return true;
        }
	}
}