//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace tabeeb.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class complain
    {
        public System.Guid id { get; set; }
        public string name { get; set; }
        public string mail { get; set; }
        public string message { get; set; }
        public string phone { get; set; }
        public Nullable<System.DateTime> dateOfJoin { get; set; }
        public Nullable<bool> general { get; set; }
    }
}
