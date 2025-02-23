"use strict";(self.webpackChunkhmfront=self.webpackChunkhmfront||[]).push([[712],{1767:(b,g,o)=>{o.d(g,{S:()=>E});var h=o(1413),m=o(6977),t=o(7705),C=o(3870),u=o(177),e=o(7062),p=o(9417);function O(i,l){1&i&&(t.j41(0,"div")(1,"p"),t.EFF(2,"Received Orders Appear Here"),t.k0s()())}function M(i,l){if(1&i&&(t.j41(0,"div",20)(1,"div")(2,"div",21)(3,"p",22),t.EFF(4,"Order for: "),t.j41(5,"strong"),t.EFF(6),t.k0s()(),t.j41(7,"p",23),t.EFF(8,"Order Size type: "),t.j41(9,"strong"),t.EFF(10),t.k0s()(),t.j41(11,"p",23),t.EFF(12,"Item quantity : "),t.j41(13,"strong"),t.EFF(14),t.k0s()()()()()),2&i){const n=l.$implicit;t.R7$(6),t.JRh(n.product.prodName),t.R7$(4),t.JRh(n.prodSize),t.R7$(4),t.JRh(n.quantity)}}const F=function(i){return["/s/view-order",i]};function P(i,l){if(1&i){const n=t.RV6();t.j41(0,"div",5)(1,"div")(2,"div",6)(3,"div",7)(4,"p"),t.EFF(5,"Orderd by "),t.j41(6,"strong"),t.EFF(7),t.k0s()(),t.j41(8,"p",8),t.EFF(9," Status: "),t.j41(10,"span",9),t.EFF(11),t.k0s()()(),t.j41(12,"div",10)(13,"p",11)(14,"strong"),t.EFF(15),t.nI1(16,"currency"),t.k0s(),t.EFF(17," for "),t.j41(18,"span"),t.EFF(19),t.k0s(),t.EFF(20," item "),t.k0s()()(),t.DNE(21,M,15,3,"div",12),t.j41(22,"div",13)(23,"select",14),t.bIt("ngModelChange",function(r){const s=t.eBV(n).$implicit,c=t.XpG(2);return t.Njj(c.newStatus[s._id]=r)}),t.j41(24,"option",15),t.EFF(25,"Pending"),t.k0s(),t.j41(26,"option",16),t.EFF(27,"Approved"),t.k0s(),t.j41(28,"option",17),t.EFF(29,"Delivered"),t.k0s(),t.j41(30,"option",18),t.EFF(31,"Cancelled"),t.k0s()(),t.j41(32,"button",19),t.bIt("click",function(){const a=t.eBV(n).$implicit,s=t.XpG(2);return t.Njj(s.updateStatus(a._id,a.user._id))}),t.EFF(33,"Update Status"),t.k0s()()()()}if(2&i){const n=l.$implicit,d=t.XpG(2);t.R7$(3),t.Y8G("routerLink",t.eq3(10,F,n.customIdentifer)),t.R7$(4),t.JRh(null==n||null==n.user?null:n.user.name),t.R7$(4),t.SpI("",n.status," "),t.R7$(4),t.SpI("",t.i5U(16,7,null==n?null:n.totalPrice,"INR")," "),t.R7$(4),t.JRh(null==n?null:n.orderItems.length),t.R7$(2),t.Y8G("ngForOf",n.orderItems),t.R7$(2),t.Y8G("ngModel",d.newStatus[n._id])}}function _(i,l){if(1&i){const n=t.RV6();t.j41(0,"button",26,27),t.bIt("click",function(){t.eBV(n);const r=t.XpG(3);return t.Njj(r.getPlacedOrders())}),t.EFF(2),t.k0s()}if(2&i){const n=t.XpG(3);t.Y8G("disabled",n.isLoading),t.R7$(2),t.SpI(" ",n.orders?"Load More":"No items"," ")}}function f(i,l){if(1&i&&(t.j41(0,"div",24),t.DNE(1,_,3,2,"button",25),t.k0s()),2&i){const n=t.XpG(2);t.R7$(1),t.Y8G("ngIf",n.hasMoreOrders&&!n.isLoading)}}function v(i,l){if(1&i&&(t.j41(0,"div",2),t.DNE(1,P,34,12,"div",3),t.DNE(2,f,2,1,"div",4),t.k0s()),2&i){const n=t.XpG();t.R7$(1),t.Y8G("ngForOf",n.orders),t.R7$(1),t.Y8G("ngIf",0!=n.orders.length)}}let E=(()=>{class i{constructor(n){this.productService=n,this.orders=[],this.start=10,this.limit=10,this.isLoading=!1,this.hasMoreOrders=!0,this.destroy$=new h.B,this.newStatus={}}ngOnInit(){this.token=localStorage.getItem("token"),this.getPlacedOrders()}getPlacedOrders(){this.productService.getPlacedOrders(this.start,this.limit,this.token).pipe((0,m.Q)(this.destroy$)).subscribe({next:n=>{console.log("API Response:",n),this.isLoading=!1,n?.orders&&Array.isArray(n.orders)?(this.orders=[...this.orders,...n.orders],this.start+=this.limit,this.initializeStatus(),this.hasMoreOrders=this.start<n.totalOrders):(console.error("Unexpected response structure:",n),this.hasMoreOrders=!1)},error:n=>{console.error("Error fetching orders:",n),this.isLoading=!1}})}initializeStatus(){this.orders?.length>0?this.orders.forEach(n=>{n?.status?this.newStatus[n._id]=n.status:console.warn("Order without status:",n)}):console.warn("No orders to initialize status for.")}updateStatus(n,d){this.productService.updateOrderStatus(n,d,this.newStatus[n],this.token).pipe((0,m.Q)(this.destroy$)).subscribe(a=>{console.log("Order status updated successfully",a),this.getPlacedOrders()},a=>{console.error("Error updating order status",a)})}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}static{this.\u0275fac=function(d){return new(d||i)(t.rXU(C.g))}}static{this.\u0275cmp=t.VBU({type:i,selectors:[["app-supplier-orders-component"]],decls:2,vars:2,consts:[[4,"ngIf"],["class","order-container",4,"ngIf"],[1,"order-container"],["class","order-card",4,"ngFor","ngForOf"],["class","itm-btn",4,"ngIf"],[1,"order-card"],[1,"order-header"],[1,"order-head",3,"routerLink"],[2,"margin-bottom","0.5rem","overflow","hidden"],[2,"background-color","#D6E4F0","padding","3px 7px","border-radius","5px","color","#2657C1"],[1,"order-head2",2,"position","relative","width","100%","margin","0","padding","0"],[2,"position","relative","width","max-content","float","right"],["class","order-item",4,"ngFor","ngForOf"],[1,"order-status"],[1,"status-select","form-select",3,"ngModel","ngModelChange"],["value","Pending"],["value","Approved"],["value","Delivered"],["value","Cancelled"],[1,"update-button",3,"click"],[1,"order-item"],[1,"item"],[1,"product-name"],[1,"order-details","product-info","product-price"],[1,"itm-btn"],["style","",3,"disabled","click",4,"ngIf"],[3,"disabled","click"],["loadingIndicator",""]],template:function(d,r){1&d&&(t.DNE(0,O,3,0,"div",0),t.DNE(1,v,3,2,"div",1)),2&d&&(t.Y8G("ngIf",!r.orders),t.R7$(1),t.Y8G("ngIf",r.orders))},dependencies:[u.Sq,u.bT,e.Wk,p.xH,p.y7,p.wz,p.BC,p.vS,u.oe],styles:[".order-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;gap:1rem;padding:1rem;width:80%;overflow:scroll}*[_ngcontent-%COMP%]{overflow:auto}.order-card[_ngcontent-%COMP%]{display:flex;flex-direction:column;border:1px solid #ccc;border-radius:8px;padding:.5rem 1rem;background-color:#f9f9f9;height:20rem}.order-item[_ngcontent-%COMP%]{justify-content:space-between;padding:.5rem 0;border-bottom:1px solid #eee}.product-name[_ngcontent-%COMP%], .order-details[_ngcontent-%COMP%], .order-status[_ngcontent-%COMP%]{margin:0}.status-select[_ngcontent-%COMP%]{margin-top:.2rem;padding:.5rem;border:1px solid #ccc;border-radius:4px}.update-button[_ngcontent-%COMP%]{margin-top:.5rem;padding:.5rem 1rem;background-color:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer}.update-button[_ngcontent-%COMP%]:hover{background-color:#0056b3}.item[_ngcontent-%COMP%]   p[_ngcontent-%COMP%], .order-head[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin-bottom:.4rem}.order-head[_ngcontent-%COMP%]{background-color:#ebf4f6;padding:0 8px;border-radius:5px;color:#041562}.order-head2[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin-top:.4rem;margin-bottom:0}@media (min-width: 768px){.order-container[_ngcontent-%COMP%]{flex-direction:row;flex-wrap:wrap}.order-card[_ngcontent-%COMP%]{flex:1 1 calc(50% - 2rem);margin:.5rem}}@media (min-width: 1024px){.order-card[_ngcontent-%COMP%]{flex:1 1 calc(33.333% - 2rem)}}@media screen and (orientation: portrait){.order-container[_ngcontent-%COMP%]{flex-direction:row;flex-wrap:wrap;font-size:small;width:100%;overflow:scroll}.order-head[_ngcontent-%COMP%]{margin:0}.order-card[_ngcontent-%COMP%]{flex:1 1 calc(50% - 1rem);height:17rem;overflow:scroll}.order-status[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{font-size:small}.update-button[_ngcontent-%COMP%]{margin-top:.5rem;padding:.5rem 1rem;background-color:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:small}}"]})}}return i})()},712:(b,g,o)=>{o.r(g),o.d(g,{SupplierModule:()=>d});var h=o(177),m=o(7062),t=o(1767),C=o(1413),u=o(6977),e=o(7705),p=o(3870);function O(r,a){if(1&r&&(e.j41(0,"div")(1,"h2"),e.EFF(2,"Order Received"),e.k0s(),e.j41(3,"div",6)(4,"h1"),e.EFF(5),e.k0s()()()),2&r){const s=e.XpG();e.R7$(5),e.JRh(s.order.totalOrders)}}function M(r,a){if(1&r&&(e.j41(0,"div",7)(1,"div")(2,"h2"),e.EFF(3,"Order Delivered"),e.k0s(),e.j41(4,"div",6)(5,"h1"),e.EFF(6),e.k0s()()()()),2&r){const s=e.XpG();e.R7$(6),e.JRh(s.order.deliveredOrders)}}function F(r,a){if(1&r&&(e.j41(0,"div",8)(1,"div")(2,"h2"),e.EFF(3,"Total Sales"),e.k0s(),e.j41(4,"div",6)(5,"h1"),e.EFF(6),e.k0s()()()()),2&r){const s=e.XpG();e.R7$(6),e.JRh(s.order.deliveredOrders)}}function P(r,a){if(1&r&&(e.j41(0,"div")(1,"h2"),e.EFF(2,"Total Items"),e.k0s(),e.j41(3,"div",6)(4,"h1"),e.EFF(5),e.k0s()()()),2&r){const s=e.XpG();e.R7$(5),e.JRh(s.products.count)}}let _=(()=>{class r{constructor(s){this.supplyService=s,this.destroy$=new C.B}ngOnInit(){this.token=localStorage.getItem("token"),this.getOrdersCount(),this.getProductsCount()}getOrdersCount(){this.supplyService.getOrdersCount(this.token).pipe((0,u.Q)(this.destroy$)).subscribe(s=>{console.log(s),this.order=s})}getProductsCount(){this.supplyService.getProductsCount(this.token).pipe((0,u.Q)(this.destroy$)).subscribe(s=>{console.log(s),this.products=s})}ngOnDestroy(){this.destroy$.next(),this.destroy$.complete()}static{this.\u0275fac=function(c){return new(c||r)(e.rXU(p.g))}}static{this.\u0275cmp=e.VBU({type:r,selectors:[["app-supplier"]],decls:7,vars:4,consts:[[1,"s-dashboard"],[1,"s-d-i","s-r"],[4,"ngIf"],["class","s-d-i s-d",4,"ngIf"],["class","s-d-i s-s",4,"ngIf"],[1,"s-d-i","s-i"],[1,"stat-value"],[1,"s-d-i","s-d"],[1,"s-d-i","s-s"]],template:function(c,x){1&c&&(e.j41(0,"div",0)(1,"div",1),e.DNE(2,O,6,1,"div",2),e.k0s(),e.DNE(3,M,7,1,"div",3),e.DNE(4,F,7,1,"div",4),e.j41(5,"div",5),e.DNE(6,P,6,1,"div",2),e.k0s()()),2&c&&(e.R7$(2),e.Y8G("ngIf",x.order),e.R7$(1),e.Y8G("ngIf",x.order),e.R7$(1),e.Y8G("ngIf",x.order),e.R7$(2),e.Y8G("ngIf",x.products))},dependencies:[h.bT],styles:[".s-dashboard[_ngcontent-%COMP%]{width:100%;display:flex;flex-wrap:wrap;gap:30px;justify-content:space-around;padding:15px}.s-d-i[_ngcontent-%COMP%]{background-color:#f5f5f5;border-radius:10px;box-shadow:0 4px 8px #0000001a;padding:20px;flex:1 1 calc(25% - 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-width:250px;transition:transform .3s ease}.s-d-i[_ngcontent-%COMP%]:hover{transform:translateY(-5px)}.s-d-i[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:1.2em;margin-bottom:10px;color:#333}.stat-value[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:3em;margin:0;color:#00796b}.s-dashboard[_ngcontent-%COMP%]{width:100%;display:inline-block}.s-d-i[_ngcontent-%COMP%]{width:25%;display:inline-block;margin:15px}@media screen and (orientation: portrait){.s-d-i[_ngcontent-%COMP%]{flex:1 1 calc(30% - 10px);margin:10px 4px;min-width:8.5rem;overflow:hidden}}@media screen and (max-width: 500px){.s-d-i[_ngcontent-%COMP%]{flex:1 1 calc(30% - 10px);margin:10px 4px;min-width:9.5rem;overflow:hidden}}@media screen and (max-width: 400px){.s-d-i[_ngcontent-%COMP%]{flex:1 1 calc(30% - 10px);margin:10px 4px;min-width:8.5rem;overflow:hidden}}@media screen and (max-width: 400px) and (max-width: 360px){.dash-main[_ngcontent-%COMP%]{display:inline-block;padding-left:.1rem;margin-top:1rem}.s-d-i[_ngcontent-%COMP%]{display:inline-block;flex:none;margin:.1rem;width:1.1rem;max-width:1.1rem;font-size:small}.s-dashboard[_ngcontent-%COMP%]{gap:30px;justify-content:center;padding:1px;height:100%}.s-d-i[_ngcontent-%COMP%]{background-color:#f5f5f5;border-radius:10px;box-shadow:0 4px 8px #0000001a;padding:1px;flex:1 1 calc(40% - 20px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;min-width:250px;transition:transform .3s ease;margin:1rem;position:relative;left:5%}}"]})}}return r})();var f=o(1620),v=o(5458);const E=[{path:"",redirectTo:"dashboard",pathMatch:"full"},{path:"dashboard",component:_},{path:"orders",component:t.S},{path:"",loadChildren:()=>Promise.all([o.e(7578),o.e(5244),o.e(9631),o.e(3765)]).then(o.bind(o,3765)).then(r=>r.MoreModule),canActivate:[f.q,v.K],data:{role:"supplier"}},{path:"",loadChildren:()=>o.e(8018).then(o.bind(o,8018)).then(r=>r.ReqSupModule),canActivate:[f.q,v.K],data:{role:"supplier"}}];let i=(()=>{class r{static{this.\u0275fac=function(c){return new(c||r)}}static{this.\u0275mod=e.$C({type:r})}static{this.\u0275inj=e.G2t({imports:[m.iI.forChild(E),m.iI]})}}return r})();var l=o(5619),n=o(9417);let d=(()=>{class r{static{this.\u0275fac=function(c){return new(c||r)}}static{this.\u0275mod=e.$C({type:r})}static{this.\u0275inj=e.G2t({providers:[l.o],imports:[h.MD,i,n.YN]})}}return r})()}}]);