"use strict";(self.webpackChunkhmfront=self.webpackChunkhmfront||[]).push([[9993],{9993:(W,_,l)=>{l.r(_),l.d(_,{ReqAdminModule:()=>L});var c=l(177),p=l(2419),m=l(5286),u=l(7605),e=l(7705),a=l(3976);const f=function(n){return["/buyer/request-requirement/",n]};function b(n,o){if(1&n&&(e.j41(0,"button",8),e.EFF(1,"View"),e.k0s()),2&n){const t=e.XpG().$implicit;e.Y8G("routerLink",e.eq3(1,f,t.customIdentifier))}}function h(n,o){if(1&n){const t=e.RV6();e.j41(0,"button",9),e.bIt("click",function(){e.eBV(t);const r=e.XpG().$implicit,s=e.XpG();return e.Njj(s.forwardToSuppliers(r._id))}),e.EFF(1,"Forward to Suppliers"),e.k0s()}}function F(n,o){1&n&&(e.j41(0,"button",10),e.EFF(1,"Forwarded"),e.k0s())}function v(n,o){if(1&n&&(e.j41(0,"button",10),e.EFF(1),e.k0s()),2&n){const t=e.XpG().$implicit;e.R7$(1),e.JRh(t.status)}}function k(n,o){if(1&n&&(e.j41(0,"div",2)(1,"div",3)(2,"p"),e.EFF(3),e.k0s()(),e.j41(4,"div",4),e.DNE(5,b,2,3,"button",5),e.DNE(6,h,2,0,"button",6),e.DNE(7,F,2,0,"button",7),e.DNE(8,v,2,1,"button",7),e.k0s()()),2&n){const t=o.$implicit,i=e.XpG();e.R7$(3),e.SpI("",i.truncateText(t.reqDetails,15),".."),e.R7$(2),e.Y8G("ngIf",t.reqDetails.length>1),e.R7$(1),e.Y8G("ngIf","Pending"===t.status),e.R7$(1),e.Y8G("ngIf","Forwarded"===t.status),e.R7$(1),e.Y8G("ngIf","Forwarded"!==t.status&&"Pending"!==t.status)}}let C=(()=>{class n{constructor(t){this.adminService=t,this.destroy$=new m.B7,this.token=localStorage.getItem("token")}ngOnInit(){this.getRequirements()}getRequirements(){this.adminService.getAllRequirements(this.token).pipe((0,u.Q)(this.destroy$)).subscribe(t=>{this.requirements=t,console.log(t)})}truncateText(t,i){return t.length>i?t.substring(0,i)+"...":t}forwardToSuppliers(t){this.adminService.forwardRequirement(t,this.token).pipe((0,u.Q)(this.destroy$)).subscribe(i=>{console.log(i),this.getRequirements()},i=>{})}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}static{this.\u0275fac=function(i){return new(i||n)(e.rXU(a.z))}}static{this.\u0275cmp=e.VBU({type:n,selectors:[["app-req-admin"]],decls:2,vars:1,consts:[[1,"requests"],["class","request",4,"ngFor","ngForOf"],[1,"request"],[1,"r-s-t"],[1,"r-s-btn"],["class","v-b",3,"routerLink",4,"ngIf"],["class","f-s",3,"click",4,"ngIf"],["class","f-d",4,"ngIf"],[1,"v-b",3,"routerLink"],[1,"f-s",3,"click"],[1,"f-d"]],template:function(i,r){1&i&&(e.j41(0,"div",0),e.DNE(1,k,9,5,"div",1),e.k0s()),2&i&&(e.R7$(1),e.Y8G("ngForOf",r.requirements))},dependencies:[c.Sq,c.bT,p.Wk],styles:[".requests[_ngcontent-%COMP%]{width:100%;display:inline-block;gap:2px}.request[_ngcontent-%COMP%]{width:15%;display:inline-block;margin:1rem;border:1px solid #161D6F;border-radius:20px}.requests[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{position:relative;left:1rem}.r-s-btn[_ngcontent-%COMP%]{width:100%;text-align:center}.request[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{border-radius:8px;padding:8px 0;width:90%;border:none;margin-bottom:.4rem}.f-d[_ngcontent-%COMP%]{background-color:#bde8ca;color:#0d7c66;font-weight:700}.f-s[_ngcontent-%COMP%]{background-color:#e9efec;color:#16325b;font-weight:700}.f-s[_ngcontent-%COMP%]:hover{background-color:#16325b;color:#e9efec;font-weight:700}@media screen and (orientation: portrait){.requests[_ngcontent-%COMP%]{display:inline-block}.request[_ngcontent-%COMP%]{width:40%;display:inline-grid;height:10rem}}"]})}}return n})();var d=l(9417);function y(n,o){if(1&n&&(e.j41(0,"div",5),e.EFF(1),e.k0s()),2&n){const t=e.XpG();e.R7$(1),e.SpI(" ",t.errorMessage," ")}}function R(n,o){1&n&&(e.j41(0,"div",6)(1,"p",7),e.EFF(2,"Loading product submissions..."),e.k0s()())}function E(n,o){if(1&n&&(e.j41(0,"option",20),e.EFF(1),e.k0s()),2&n){const t=o.$implicit,i=e.XpG(4);e.Y8G("value",t.requirement._id),e.R7$(1),e.SpI(" ",i.truncateText(t.requirement.reqDetails,15),".. ")}}function q(n,o){if(1&n){const t=e.RV6();e.j41(0,"div",17)(1,"select",18),e.bIt("ngModelChange",function(r){e.eBV(t);const s=e.XpG().$implicit;return e.Njj(s.requirement._id=r)}),e.DNE(2,E,2,2,"option",19),e.k0s()()}if(2&n){const t=e.XpG().$implicit,i=e.XpG(2);e.R7$(1),e.Mz_("id","requirementId-",t._id,""),e.Y8G("ngModel",t.requirement._id),e.R7$(1),e.Y8G("ngForOf",i.requirements)}}function $(n,o){1&n&&(e.j41(0,"button",21),e.EFF(1,"Forward"),e.k0s())}function S(n,o){if(1&n&&(e.j41(0,"small",22),e.EFF(1),e.k0s()),2&n){const t=e.XpG().$implicit;e.R7$(1),e.JRh(t.status)}}function P(n,o){if(1&n){const t=e.RV6();e.j41(0,"tr")(1,"td"),e.EFF(2),e.k0s(),e.j41(3,"td"),e.EFF(4),e.k0s(),e.j41(5,"td"),e.EFF(6),e.k0s(),e.j41(7,"td"),e.EFF(8),e.nI1(9,"currency"),e.k0s(),e.j41(10,"td"),e.nrm(11,"img",12),e.k0s(),e.j41(12,"td")(13,"form",13),e.bIt("ngSubmit",function(){const s=e.eBV(t).$implicit,g=e.XpG(2);return e.Njj(g.forwardSubmission(s._id,s.requirement._id,g.token))}),e.DNE(14,q,3,3,"div",14),e.j41(15,"div"),e.DNE(16,$,2,0,"button",15),e.DNE(17,S,2,1,"small",16),e.k0s()()()()}if(2&n){const t=o.$implicit,i=e.XpG(2);e.R7$(2),e.SpI("",i.truncateText(t.requirement.reqDetails,15),".."),e.R7$(2),e.JRh(t.supplier.name),e.R7$(2),e.JRh(i.truncateText(t.name,15)),e.R7$(2),e.JRh(e.i5U(9,9,t.price,"INR")),e.R7$(3),e.FS9("alt",t.name),e.Y8G("src",t.image,e.B4B),e.R7$(3),e.Y8G("ngIf","Pending"===t.status),e.R7$(2),e.Y8G("ngIf","Pending"===t.status),e.R7$(1),e.Y8G("ngIf","Pending"!==t.status)}}function j(n,o){if(1&n&&(e.j41(0,"div",8)(1,"table",9)(2,"thead",10)(3,"tr")(4,"th"),e.EFF(5,"Requirement"),e.k0s(),e.j41(6,"th"),e.EFF(7,"Supplier"),e.k0s(),e.j41(8,"th"),e.EFF(9,"Product Detail"),e.k0s(),e.j41(10,"th"),e.EFF(11,"Price"),e.k0s(),e.j41(12,"th"),e.EFF(13,"Image"),e.k0s(),e.j41(14,"th"),e.EFF(15,"Action"),e.k0s()()(),e.j41(16,"tbody"),e.DNE(17,P,18,12,"tr",11),e.k0s()()()),2&n){const t=e.XpG();e.R7$(17),e.Y8G("ngForOf",t.requirements)}}function x(n,o){1&n&&(e.j41(0,"div"),e.EFF(1,"Loading..."),e.k0s())}function D(n,o){if(1&n&&(e.j41(0,"div"),e.EFF(1),e.k0s()),2&n){const t=e.XpG();e.R7$(1),e.JRh(t.error)}}function O(n,o){if(1&n){const t=e.RV6();e.j41(0,"li")(1,"p")(2,"strong"),e.EFF(3,"Product Name:"),e.k0s(),e.EFF(4),e.k0s(),e.j41(5,"p")(6,"strong"),e.EFF(7,"Price:"),e.k0s(),e.EFF(8),e.k0s(),e.nrm(9,"img",4),e.j41(10,"h3"),e.EFF(11,"Supplier Details"),e.k0s(),e.j41(12,"p")(13,"strong"),e.EFF(14,"Name:"),e.k0s(),e.EFF(15),e.k0s(),e.j41(16,"p")(17,"strong"),e.EFF(18,"Email:"),e.k0s(),e.EFF(19),e.k0s(),e.j41(20,"p")(21,"strong"),e.EFF(22,"Phone:"),e.k0s(),e.EFF(23),e.k0s(),e.j41(24,"p")(25,"strong"),e.EFF(26,"Address:"),e.k0s(),e.EFF(27),e.k0s(),e.j41(28,"h3"),e.EFF(29,"Buyer Details"),e.k0s(),e.j41(30,"p")(31,"strong"),e.EFF(32,"Name:"),e.k0s(),e.EFF(33),e.k0s(),e.j41(34,"p")(35,"strong"),e.EFF(36,"Email:"),e.k0s(),e.EFF(37),e.k0s(),e.j41(38,"p")(39,"strong"),e.EFF(40,"Phone:"),e.k0s(),e.EFF(41),e.k0s(),e.j41(42,"p")(43,"strong"),e.EFF(44,"Address:"),e.k0s(),e.EFF(45),e.k0s(),e.j41(46,"button",5),e.bIt("click",function(){const s=e.eBV(t).$implicit,g=e.XpG(2);return e.Njj(g.confirmDelivery(s._id))}),e.EFF(47,"Confirm Delivery"),e.k0s()()}if(2&n){const t=o.$implicit;e.R7$(4),e.SpI(" ",t.name,""),e.R7$(4),e.SpI(" ",t.price,""),e.R7$(1),e.FS9("src",t.image,e.B4B),e.R7$(6),e.SpI(" ",t.supplier.name,""),e.R7$(4),e.SpI(" ",t.supplier.email,""),e.R7$(4),e.SpI(" ",t.supplier.phone,""),e.R7$(4),e.SjE(" ",t.supplier.street,", ",t.supplier.apartment,", ",t.supplier.city,", ",t.supplier.zip,", ",t.supplier.country,""),e.R7$(6),e.SpI(" ",t.requirement.buyer.name,""),e.R7$(4),e.SpI(" ",t.requirement.buyer.email,""),e.R7$(4),e.SpI(" ",t.requirement.buyer.phone,""),e.R7$(4),e.SjE(" ",t.requirement.buyer.street,", ",t.requirement.buyer.apartment,", ",t.requirement.buyer.city,", ",t.requirement.buyer.zip,", ",t.requirement.buyer.country,"")}}function M(n,o){if(1&n&&(e.j41(0,"div",2)(1,"h2"),e.EFF(2,"Requested Deliveries"),e.k0s(),e.j41(3,"ul"),e.DNE(4,O,48,19,"li",3),e.k0s()()),2&n){const t=e.XpG();e.R7$(4),e.Y8G("ngForOf",t.requestedSubmissions)}}function w(n,o){1&n&&(e.j41(0,"div")(1,"p"),e.EFF(2,"No requested deliveries found."),e.k0s()())}function T(n,o){1&n&&(e.j41(0,"div",5),e.EFF(1,"Loading completed products..."),e.k0s())}function A(n,o){if(1&n&&(e.j41(0,"div",6),e.EFF(1),e.k0s()),2&n){const t=e.XpG();e.R7$(1),e.JRh(t.error)}}function N(n,o){1&n&&(e.j41(0,"p"),e.EFF(1," status: "),e.j41(2,"strong"),e.EFF(3,"Delivery Requested "),e.k0s()())}function Y(n,o){1&n&&(e.j41(0,"p"),e.EFF(1," status: "),e.j41(2,"strong"),e.EFF(3," Delivered "),e.k0s()())}function X(n,o){if(1&n){const t=e.RV6();e.j41(0,"button",13),e.bIt("click",function(){e.eBV(t);const r=e.XpG().$implicit,s=e.XpG(2);return e.Njj(s.updateDelivery(r.requirement._id,r._id))}),e.EFF(1,"Mark Delivered"),e.k0s()}}function B(n,o){1&n&&(e.j41(0,"button",14),e.EFF(1,"Delivered"),e.k0s())}const V=function(n){return["/buyer/request-requirement/",n]};function z(n,o){if(1&n&&(e.j41(0,"li",8)(1,"h3"),e.EFF(2),e.nI1(3,"currency"),e.k0s(),e.j41(4,"p",9)(5,"strong"),e.EFF(6,"Requirement:"),e.k0s(),e.EFF(7),e.k0s(),e.DNE(8,N,4,0,"p",4),e.DNE(9,Y,4,0,"p",4),e.nrm(10,"img",10),e.j41(11,"div")(12,"details")(13,"summary"),e.EFF(14,"Supplier Details"),e.k0s(),e.j41(15,"p"),e.EFF(16),e.k0s(),e.j41(17,"p"),e.EFF(18),e.k0s(),e.j41(19,"p"),e.EFF(20),e.k0s(),e.j41(21,"p"),e.EFF(22),e.k0s(),e.j41(23,"p"),e.EFF(24),e.k0s(),e.j41(25,"p"),e.EFF(26),e.k0s(),e.j41(27,"p"),e.EFF(28),e.k0s()()(),e.j41(29,"div")(30,"details")(31,"summary"),e.EFF(32,"Buyer Details"),e.k0s(),e.j41(33,"p"),e.EFF(34),e.k0s(),e.j41(35,"p"),e.EFF(36),e.k0s(),e.j41(37,"p"),e.EFF(38),e.k0s(),e.j41(39,"p"),e.EFF(40),e.k0s(),e.j41(41,"p"),e.EFF(42),e.k0s(),e.j41(43,"p"),e.EFF(44),e.k0s(),e.j41(45,"p"),e.EFF(46),e.k0s()()(),e.DNE(47,X,2,0,"button",11),e.DNE(48,B,2,0,"button",12),e.k0s()),2&n){const t=o.$implicit,i=e.XpG(2);e.R7$(2),e.Lme("",t.name," - ",e.i5U(3,24,t.price,"INR"),""),e.R7$(2),e.Y8G("routerLink",e.eq3(27,V,t.requirement.customIdentifier)),e.R7$(3),e.SpI(" ",i.truncateText(t.requirement.reqDetails,15),""),e.R7$(1),e.Y8G("ngIf","Completed"===t.status),e.R7$(1),e.Y8G("ngIf","Delivered"===t.status),e.R7$(1),e.FS9("alt",t.name),e.Y8G("src",t.image,e.B4B),e.R7$(6),e.SpI("ID: ",t.supplier._id,""),e.R7$(2),e.SpI("Name: ",t.supplier.name,""),e.R7$(2),e.SpI("Phone: ",t.supplier.phone,""),e.R7$(2),e.SpI("email: ",t.supplier.email,""),e.R7$(2),e.SpI("Street: ",t.supplier.street,""),e.R7$(2),e.SpI("City: ",t.supplier.city,""),e.R7$(2),e.SpI("Zip: ",t.supplier.zip,""),e.R7$(6),e.SpI("ID: ",t.requirement.buyer._id,""),e.R7$(2),e.SpI("Name: ",t.requirement.buyer.name,""),e.R7$(2),e.SpI("Phone: ",t.requirement.buyer.phone,""),e.R7$(2),e.SpI("email: ",t.requirement.buyer.email,""),e.R7$(2),e.SpI("Street: ",t.requirement.buyer.street,""),e.R7$(2),e.SpI("City: ",t.requirement.buyer.city,""),e.R7$(2),e.SpI("Zip: ",t.requirement.buyer.zip,""),e.R7$(1),e.Y8G("ngIf","Completed"===t.status),e.R7$(1),e.Y8G("ngIf","Delivered"===t.status)}}function U(n,o){if(1&n&&(e.j41(0,"ul"),e.DNE(1,z,49,29,"li",7),e.k0s()),2&n){const t=e.XpG();e.R7$(1),e.Y8G("ngForOf",t.completedProducts)}}const Q=[{path:"admin-requirements",component:C},{path:"submitted-prod-info",component:(()=>{class n{constructor(t){this.adminService=t,this.destroy$=new m.B7,this.requirements=[]}ngOnInit(){this.token=localStorage.getItem("token"),this.loadProductSubmissions()}loadProductSubmissions(){this.adminService.getProductSubmissions(this.token).pipe((0,u.Q)(this.destroy$)).subscribe(t=>{this.requirements=t.productSubmissions,console.log(t)})}truncateText(t,i){return t.length>i?t.substring(0,i)+"...":t}forwardSubmission(t,i,r){this.adminService.forwardProductSubmission(t,i,this.token).pipe((0,u.Q)(this.destroy$)).subscribe(s=>{alert("Product submission forwarded successfully"),this.loadProductSubmissions()},s=>{this.errorMessage=`Error forwarding product submission: ${s.message}`,console.error("Error details:",s)})}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}static{this.\u0275fac=function(i){return new(i||n)(e.rXU(a.z))}}static{this.\u0275cmp=e.VBU({type:n,selectors:[["app-admin-prod-sub"]],decls:6,vars:3,consts:[[1,"container","my-5"],[1,"text-center","mb-4"],["class","alert alert-danger text-center",4,"ngIf"],["class","text-center",4,"ngIf"],["class","table-responsive",4,"ngIf"],[1,"alert","alert-danger","text-center"],[1,"text-center"],[1,"mt-2"],[1,"table-responsive"],[1,"table","table-striped","table-hover","align-middle"],[1,"table-dark"],[4,"ngFor","ngForOf"],["width","100",1,"img-fluid","rounded","shadow-sm",3,"src","alt"],[3,"ngSubmit"],["class","form-group",4,"ngIf"],["type","submit","class","btn btn-primary mt-2 w-100",4,"ngIf"],["class","btn btn-success mt-2 w-100",4,"ngIf"],[1,"form-group"],["name","requirementId","required","",1,"form-select",3,"id","ngModel","ngModelChange"],[3,"value",4,"ngFor","ngForOf"],[3,"value"],["type","submit",1,"btn","btn-primary","mt-2","w-100"],[1,"btn","btn-success","mt-2","w-100"]],template:function(i,r){1&i&&(e.j41(0,"div",0)(1,"h2",1),e.EFF(2,"Submitted Product Information"),e.k0s(),e.DNE(3,y,2,1,"div",2),e.DNE(4,R,3,0,"div",3),e.DNE(5,j,18,1,"div",4),e.k0s()),2&i&&(e.R7$(3),e.Y8G("ngIf",r.errorMessage),e.R7$(1),e.Y8G("ngIf",!r.requirements.length&&!r.errorMessage),e.R7$(1),e.Y8G("ngIf",r.requirements.length))},dependencies:[c.Sq,c.bT,d.qT,d.xH,d.y7,d.wz,d.BC,d.cb,d.YS,d.vS,d.cV,c.oe],styles:[".table[_ngcontent-%COMP%]{width:40rem;margin-bottom:1rem;color:#212529}.table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{vertical-align:bottom;border-bottom:2px solid #dee2e6}.table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   tr[_ngcontent-%COMP%]:hover{background-color:#f8f9fa}.img-fluid[_ngcontent-%COMP%]{max-width:100%;height:auto}.btn-primary[_ngcontent-%COMP%], .btn-success[_ngcontent-%COMP%]{text-transform:uppercase;font-weight:700}.spinner-border[_ngcontent-%COMP%]{width:3rem;height:3rem}.table[_ngcontent-%COMP%]   th[_ngcontent-%COMP%]{width:max-content}th[_ngcontent-%COMP%]{white-space:nowrap;text-align:left}.table[_ngcontent-%COMP%]{table-layout:auto}@media screen and (orientation: portrait){.table[_ngcontent-%COMP%]{width:50%;font-size:small;overflow:scroll}.table-responsive[_ngcontent-%COMP%]{overflow:scroll}}"]})}}return n})()},{path:"deliveries-reqs",component:(()=>{class n{constructor(t){this.deliveryService=t,this.destroy$=new m.B7,this.requestedSubmissions=[],this.loading=!1,this.error=""}ngOnInit(){this.token=localStorage.getItem("token"),this.getRequestedSubmissions()}getRequestedSubmissions(){this.loading=!0,this.deliveryService.getRequestedSubmissions(this.token).pipe((0,u.Q)(this.destroy$)).subscribe(t=>{this.requestedSubmissions=t,this.loading=!1,console.log(t)},t=>{this.error="Error fetching requested submissions",this.loading=!1})}confirmDelivery(t){this.deliveryService.confirmDelivery(t,this.token).pipe((0,u.Q)(this.destroy$)).subscribe(i=>{this.requestedSubmissions=this.requestedSubmissions.filter(r=>r._id!==t),alert("Delivery confirmed successfully!")},i=>{this.error="Error confirming delivery"})}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}static{this.\u0275fac=function(i){return new(i||n)(e.rXU(a.z))}}static{this.\u0275cmp=e.VBU({type:n,selectors:[["app-admin-del-reqs"]],decls:4,vars:4,consts:[[4,"ngIf"],["class","del-req",4,"ngIf"],[1,"del-req"],[4,"ngFor","ngForOf"],["alt","",3,"src"],[3,"click"]],template:function(i,r){1&i&&(e.DNE(0,x,2,0,"div",0),e.DNE(1,D,2,1,"div",0),e.DNE(2,M,5,1,"div",1),e.DNE(3,w,3,0,"div",0)),2&i&&(e.Y8G("ngIf",r.loading),e.R7$(1),e.Y8G("ngIf",r.error),e.R7$(1),e.Y8G("ngIf",!r.loading&&r.requestedSubmissions.length>0),e.R7$(1),e.Y8G("ngIf",!r.loading&&0===r.requestedSubmissions.length))},dependencies:[c.Sq,c.bT],styles:[".component-container[_ngcontent-%COMP%]{padding:20px;background-color:#f8f9fa;border-radius:8px;box-shadow:0 0 10px #0000001a;max-width:800px;margin:0 auto}h2[_ngcontent-%COMP%]{text-align:center;color:#343a40;margin-bottom:20px}h3[_ngcontent-%COMP%]{color:#007bff;margin-top:15px;margin-bottom:10px}ul[_ngcontent-%COMP%]{list-style-type:none;padding:0}li[_ngcontent-%COMP%]{background-color:#fff;margin-bottom:20px;padding:15px;border-radius:8px;border:1px solid #dee2e6;box-shadow:0 0 5px #0000000d}p[_ngcontent-%COMP%]{margin:5px 0;color:#495057}button[_ngcontent-%COMP%]{display:inline-block;padding:10px 20px;font-size:14px;font-weight:700;color:#fff;background-color:#28a745;border:none;border-radius:4px;cursor:pointer;transition:background-color .3s}button[_ngcontent-%COMP%]:hover{background-color:#218838}.loading[_ngcontent-%COMP%]{text-align:center;font-size:18px;color:#6c757d}.error[_ngcontent-%COMP%]{text-align:center;font-size:18px;color:#dc3545}.del-req[_ngcontent-%COMP%]{width:60%;height:max-content}.del-req[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{width:95%}.del-req[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:12rem;height:7rem;border-radius:5px;object-fit:cover}@media screen and (orientation: portrait){.del-req[_ngcontent-%COMP%]{width:87%}}"]})}}return n})()},{path:"admin-deliveries",component:(()=>{class n{constructor(t){this.productService=t,this.destroy$=new m.B7,this.completedProducts=[],this.loading=!0,this.error=null}ngOnInit(){this.token=localStorage.getItem("token"),this.getDelivery()}getDelivery(){this.productService.getCompletedProductsForAdmin(this.token).pipe((0,u.Q)(this.destroy$)).subscribe({next:t=>{this.completedProducts=t,this.loading=!1,console.log(t)},error:t=>{this.error=t.message||"Failed to load completed products",this.loading=!1}})}updateDelivery(t,i){this.productService.updateDelivery(t,i,this.token).pipe((0,u.Q)(this.destroy$)).subscribe(r=>{alert("Delivered successfully!"),this.getDelivery()},r=>{this.error="Error confirming delivery"})}truncateText(t,i){return t.length>i?t.substring(0,i)+"...":t}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}static{this.\u0275fac=function(i){return new(i||n)(e.rXU(a.z))}}static{this.\u0275cmp=e.VBU({type:n,selectors:[["app-admin-deliveries"]],decls:7,vars:3,consts:[[1,"component-container"],[1,"delivery"],["class","loading",4,"ngIf"],["class","error",4,"ngIf"],[4,"ngIf"],[1,"loading"],[1,"error"],["class","del-prod",4,"ngFor","ngForOf"],[1,"del-prod"],[2,"text-decoration","underline",3,"routerLink"],[1,"product-image",3,"src","alt"],["class","btn-cmplt",3,"click",4,"ngIf"],["class","btn-dlvd","disabled","",4,"ngIf"],[1,"btn-cmplt",3,"click"],["disabled","",1,"btn-dlvd"]],template:function(i,r){1&i&&(e.j41(0,"div",0)(1,"div",1)(2,"h2"),e.EFF(3,"Products Deliveries"),e.k0s(),e.DNE(4,T,2,0,"div",2),e.DNE(5,A,2,1,"div",3),e.DNE(6,U,2,1,"ul",4),e.k0s()()),2&i&&(e.R7$(4),e.Y8G("ngIf",r.loading),e.R7$(1),e.Y8G("ngIf",r.error),e.R7$(1),e.Y8G("ngIf",!r.loading&&!r.error))},dependencies:[c.Sq,c.bT,p.Wk,c.oe],styles:[".component-container[_ngcontent-%COMP%], .delivery[_ngcontent-%COMP%]{width:100%}.delivery[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]{margin-left:-2rem}.del-prod[_ngcontent-%COMP%]{width:22%;height:15rem;display:inline-block;background-color:#fff;padding:5px;margin:0 8px 0 0;overflow-x:scroll}.del-prod[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{height:5rem;width:8rem;border-radius:7px;object-fit:cover}.del-prod[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{border:none;border-radius:5px;padding:7px 0}.btn-cmplt[_ngcontent-%COMP%]{background-color:#16325b;color:#fff5e4}@media screen and (orientation: portrait){.delivery[_ngcontent-%COMP%]   ul[_ngcontent-%COMP%]{margin-left:-1rem}.del-prod[_ngcontent-%COMP%]{width:50%;position:relative;left:0;margin:0;padding:0 5px;font-size:small}}"]})}}return n})()}];let J=(()=>{class n{static{this.\u0275fac=function(i){return new(i||n)}}static{this.\u0275mod=e.$C({type:n})}static{this.\u0275inj=e.G2t({imports:[p.iI.forChild(Q),p.iI]})}}return n})(),L=(()=>{class n{static{this.\u0275fac=function(i){return new(i||n)}}static{this.\u0275mod=e.$C({type:n})}static{this.\u0275inj=e.G2t({imports:[c.MD,J,d.YN,d.X1]})}}return n})()}}]);