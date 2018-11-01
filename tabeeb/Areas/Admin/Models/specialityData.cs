using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace tabeeb.Areas.Admin.Models
{
    public class specialityData
    {
        public byte id { get; set; }
        public string nameEng { get; set; }
        public string nameAr { get; set; }
        public string descriptionEng { get; set; }
        public string descriptionAr { get; set; }
        public string img { get; set; }
        public byte? superSpecialityID { get; set; }

    }
}