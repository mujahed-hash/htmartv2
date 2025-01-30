"use strict";(self.webpackChunkhmfront=self.webpackChunkhmfront||[]).push([[9631],{9631:(D,M,r)=>{r.d(M,{fg:()=>k,fS:()=>F});var h=r(4085),d=r(6860),s=r(7705),b=r(1235),p=r(5286);const x=(0,d.BQ)({passive:!0});let A=(()=>{class n{constructor(e,t){this._platform=e,this._ngZone=t,this._monitoredElements=new Map}monitor(e){if(!this._platform.isBrowser)return b.w;const t=(0,h.i8)(e),i=this._monitoredElements.get(t);if(i)return i.subject;const a=new p.B7,o="cdk-text-field-autofilled",u=l=>{"cdk-text-field-autofill-start"!==l.animationName||t.classList.contains(o)?"cdk-text-field-autofill-end"===l.animationName&&t.classList.contains(o)&&(t.classList.remove(o),this._ngZone.run(()=>a.next({target:l.target,isAutofilled:!1}))):(t.classList.add(o),this._ngZone.run(()=>a.next({target:l.target,isAutofilled:!0})))};return this._ngZone.runOutsideAngular(()=>{t.addEventListener("animationstart",u,x),t.classList.add("cdk-text-field-autofill-monitored")}),this._monitoredElements.set(t,{subject:a,unlisten:()=>{t.removeEventListener("animationstart",u,x)}}),a}stopMonitoring(e){const t=(0,h.i8)(e),i=this._monitoredElements.get(t);i&&(i.unlisten(),i.subject.complete(),t.classList.remove("cdk-text-field-autofill-monitored"),t.classList.remove("cdk-text-field-autofilled"),this._monitoredElements.delete(t))}ngOnDestroy(){this._monitoredElements.forEach((e,t)=>this.stopMonitoring(t))}static{this.\u0275fac=function(t){return new(t||n)(s.KVO(d.OD),s.KVO(s.SKi))}}static{this.\u0275prov=s.jDH({token:n,factory:n.\u0275fac,providedIn:"root"})}}return n})(),w=(()=>{class n{static{this.\u0275fac=function(t){return new(t||n)}}static{this.\u0275mod=s.$C({type:n})}static{this.\u0275inj=s.G2t({})}}return n})();var m=r(9417),f=r(6600),_=r(2316);const H=new s.nKC("MAT_INPUT_VALUE_ACCESSOR"),R=["button","checkbox","file","hidden","image","radio","range","reset","submit"];let I=0;const T=(0,f.J8)(class{constructor(n,g,e,t){this._defaultErrorStateMatcher=n,this._parentForm=g,this._parentFormGroup=e,this.ngControl=t,this.stateChanges=new p.B7}});let k=(()=>{class n extends T{get disabled(){return this._disabled}set disabled(e){this._disabled=(0,h.he)(e),this.focused&&(this.focused=!1,this.stateChanges.next())}get id(){return this._id}set id(e){this._id=e||this._uid}get required(){return this._required??this.ngControl?.control?.hasValidator(m.k0.required)??!1}set required(e){this._required=(0,h.he)(e)}get type(){return this._type}set type(e){this._type=e||"text",this._validateType(),!this._isTextarea&&(0,d.MU)().has(this._type)&&(this._elementRef.nativeElement.type=this._type)}get value(){return this._inputValueAccessor.value}set value(e){e!==this.value&&(this._inputValueAccessor.value=e,this.stateChanges.next())}get readonly(){return this._readonly}set readonly(e){this._readonly=(0,h.he)(e)}constructor(e,t,i,a,o,u,l,S,L,C){super(u,a,o,i),this._elementRef=e,this._platform=t,this._autofillMonitor=S,this._formField=C,this._uid="mat-input-"+I++,this.focused=!1,this.stateChanges=new p.B7,this.controlType="mat-input",this.autofilled=!1,this._disabled=!1,this._type="text",this._readonly=!1,this._neverEmptyInputTypes=["date","datetime","datetime-local","month","time","week"].filter(y=>(0,d.MU)().has(y)),this._iOSKeyupListener=y=>{const c=y.target;!c.value&&0===c.selectionStart&&0===c.selectionEnd&&(c.setSelectionRange(1,1),c.setSelectionRange(0,0))};const v=this._elementRef.nativeElement,E=v.nodeName.toLowerCase();this._inputValueAccessor=l||v,this._previousNativeValue=this.value,this.id=this.id,t.IOS&&L.runOutsideAngular(()=>{e.nativeElement.addEventListener("keyup",this._iOSKeyupListener)}),this._isServer=!this._platform.isBrowser,this._isNativeSelect="select"===E,this._isTextarea="textarea"===E,this._isInFormField=!!C,this._isNativeSelect&&(this.controlType=v.multiple?"mat-native-select-multiple":"mat-native-select")}ngAfterViewInit(){this._platform.isBrowser&&this._autofillMonitor.monitor(this._elementRef.nativeElement).subscribe(e=>{this.autofilled=e.isAutofilled,this.stateChanges.next()})}ngOnChanges(){this.stateChanges.next()}ngOnDestroy(){this.stateChanges.complete(),this._platform.isBrowser&&this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement),this._platform.IOS&&this._elementRef.nativeElement.removeEventListener("keyup",this._iOSKeyupListener)}ngDoCheck(){this.ngControl&&(this.updateErrorState(),null!==this.ngControl.disabled&&this.ngControl.disabled!==this.disabled&&(this.disabled=this.ngControl.disabled,this.stateChanges.next())),this._dirtyCheckNativeValue(),this._dirtyCheckPlaceholder()}focus(e){this._elementRef.nativeElement.focus(e)}_focusChanged(e){e!==this.focused&&(this.focused=e,this.stateChanges.next())}_onInput(){}_dirtyCheckNativeValue(){const e=this._elementRef.nativeElement.value;this._previousNativeValue!==e&&(this._previousNativeValue=e,this.stateChanges.next())}_dirtyCheckPlaceholder(){const e=this._getPlaceholder();if(e!==this._previousPlaceholder){const t=this._elementRef.nativeElement;this._previousPlaceholder=e,e?t.setAttribute("placeholder",e):t.removeAttribute("placeholder")}}_getPlaceholder(){return this.placeholder||null}_validateType(){R.indexOf(this._type)}_isNeverEmpty(){return this._neverEmptyInputTypes.indexOf(this._type)>-1}_isBadInput(){let e=this._elementRef.nativeElement.validity;return e&&e.badInput}get empty(){return!(this._isNeverEmpty()||this._elementRef.nativeElement.value||this._isBadInput()||this.autofilled)}get shouldLabelFloat(){if(this._isNativeSelect){const e=this._elementRef.nativeElement,t=e.options[0];return this.focused||e.multiple||!this.empty||!!(e.selectedIndex>-1&&t&&t.label)}return this.focused||!this.empty}setDescribedByIds(e){e.length?this._elementRef.nativeElement.setAttribute("aria-describedby",e.join(" ")):this._elementRef.nativeElement.removeAttribute("aria-describedby")}onContainerClick(){this.focused||this.focus()}_isInlineSelect(){const e=this._elementRef.nativeElement;return this._isNativeSelect&&(e.multiple||e.size>1)}static{this.\u0275fac=function(t){return new(t||n)(s.rXU(s.aKT),s.rXU(d.OD),s.rXU(m.vO,10),s.rXU(m.cV,8),s.rXU(m.j4,8),s.rXU(f.es),s.rXU(H,10),s.rXU(A),s.rXU(s.SKi),s.rXU(_.xb,8))}}static{this.\u0275dir=s.FsC({type:n,selectors:[["input","matInput",""],["textarea","matInput",""],["select","matNativeControl",""],["input","matNativeControl",""],["textarea","matNativeControl",""]],hostAttrs:[1,"mat-mdc-input-element"],hostVars:18,hostBindings:function(t,i){1&t&&s.bIt("focus",function(){return i._focusChanged(!0)})("blur",function(){return i._focusChanged(!1)})("input",function(){return i._onInput()}),2&t&&(s.Mr5("id",i.id)("disabled",i.disabled)("required",i.required),s.BMQ("name",i.name||null)("readonly",i.readonly&&!i._isNativeSelect||null)("aria-invalid",i.empty&&i.required?null:i.errorState)("aria-required",i.required)("id",i.id),s.AVh("mat-input-server",i._isServer)("mat-mdc-form-field-textarea-control",i._isInFormField&&i._isTextarea)("mat-mdc-form-field-input-control",i._isInFormField)("mdc-text-field__input",i._isInFormField)("mat-mdc-native-select-inline",i._isInlineSelect()))},inputs:{disabled:"disabled",id:"id",placeholder:"placeholder",name:"name",required:"required",type:"type",errorStateMatcher:"errorStateMatcher",userAriaDescribedBy:["aria-describedby","userAriaDescribedBy"],value:"value",readonly:"readonly"},exportAs:["matInput"],features:[s.Jv_([{provide:_.qT,useExisting:n}]),s.Vt3,s.OA$]})}}return n})(),F=(()=>{class n{static{this.\u0275fac=function(t){return new(t||n)}}static{this.\u0275mod=s.$C({type:n})}static{this.\u0275inj=s.G2t({imports:[f.yE,_.RG,_.RG,w,f.yE]})}}return n})()}}]);