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
    
    public partial class adv
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public adv()
        {
            this.advRelatedPages = new HashSet<advRelatedPage>();
        }
    
        public byte id { get; set; }
        public string description { get; set; }
        public string content { get; set; }
        public string image { get; set; }
        public System.DateTime startDate { get; set; }
        public int amount { get; set; }
        public int waitingTime { get; set; }
        public Nullable<int> waitingAfterClosed { get; set; }
        public bool isViewAgain { get; set; }
        public bool stat { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<advRelatedPage> advRelatedPages { get; set; }
    }
}
