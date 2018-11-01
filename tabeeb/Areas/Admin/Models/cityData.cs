using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace tabeeb.Areas.Admin.Models
{
    public class cityData
    {
        public string nameEng { get; set; }
        public string nameAr { get; set; }
        public byte id { get; set; }
        public List<destrictData> destricts { get; set; }
    }
}