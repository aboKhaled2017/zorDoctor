using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using tabeeb.Areas.users.languages;
namespace tabeeb.Areas.users.Models
{
    public class reservingRecord
    {
        [Required(ErrorMessageResourceType = (typeof(Resource1)), ErrorMessageResourceName = "patientNameIsRequired")]
        [RegularExpression("^[a-zA-Z\u0621-\u064A\040]{2,15}\\s[a-zA-Z\u0621-\u064A\040]{2,15}(?:\\s[a-zA-Z\u0621-\u064A\040]{2,15})?$", ErrorMessageResourceType = (typeof(Resource1)), ErrorMessageResourceName = "enterFullPatientName")]
        public string name { get; set; }
        [Required(ErrorMessageResourceType = (typeof(Resource1)), ErrorMessageResourceName = "phoneRequired")]
        [RegularExpression("[0-9]{11}", ErrorMessageResourceType = (typeof(Resource1)), ErrorMessageResourceName = "phoneNotValid")]
        public string phone { get; set; }
        [Required]
        public DateTime appointementDate { get; set; }
        [Required]
        public string interval { get; set; }
        [Required]
        public Guid docID { get; set; }
    }
}