(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{4377:function(n,t,e){"use strict";e.r(t),e.d(t,{__N_SSP:function(){return g},default:function(){return x}});var r=e(7294),i=e(9473),o=e(1287),a=e(2587);var u=e(2937);function c(n){return function(n){if(Array.isArray(n))return(0,a.Z)(n)}(n)||function(n){if("undefined"!==typeof Symbol&&null!=n[Symbol.iterator]||null!=n["@@iterator"])return Array.from(n)}(n)||(0,u.Z)(n)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}var l=e(6835),s=e(8444),f=e(2831),d=e(1889),p=e(3075),m=e(3551),h=e(5893),v=function(){var n=(0,i.v9)((function(n){return n.post})),t=n.imagePaths,e=n.addPostDone,o=(0,i.I0)(),a=(0,m.Z)(""),u=(0,l.Z)(a,3),v=u[0],y=u[1],g=u[2];(0,r.useEffect)((function(){e&&g("")}),[e]);var x=(0,r.useCallback)((function(){if(!v||!v.trim())return alert("\uac8c\uc2dc\uae00\uc744 \uc791\uc131\ud558\uc138\uc694.");var n=new FormData;t.forEach((function(t){n.append("image",t)})),n.append("content",v),o({type:p.z9,data:n})}),[v,t]),w=(0,r.useRef)(),E=(0,r.useCallback)((function(){w.current.click()}),[w.current]),b=(0,r.useCallback)((function(n){console.log("images",n.target.files);var t=new FormData;c(n.target.files).forEach((function(n){t.append("image",n)})),o({type:p.QA,data:t})}),[]),j=(0,r.useCallback)((function(n){return function(){o({type:p.Po,data:n})}}),[]);return(0,h.jsxs)(s.Z,{style:{margin:"10px 0 20px"},encType:"multipart/form-data",onFinish:x,children:[(0,h.jsx)(f.Z.TextArea,{value:v,onChange:y,maxLength:140,placeholder:"\uc5b4\ub5a4 \uc2e0\uae30\ud55c \uc77c\uc774 \uc788\uc5c8\ub098\uc694?"}),(0,h.jsxs)("div",{children:[(0,h.jsx)("input",{type:"file",name:"image",multiple:!0,hidden:!0,ref:w,onChange:b}),(0,h.jsx)(d.Z,{onClick:E,children:"\uc774\ubbf8\uc9c0 \uc5c5\ub85c\ub4dc"}),(0,h.jsx)(d.Z,{type:"primary",style:{float:"right"},htmlType:"submit",children:"\uc9f9\uc9f9"})]}),(0,h.jsx)("div",{children:t.map((function(n,t){return(0,h.jsxs)("div",{style:{display:"inline-block"},children:[(0,h.jsx)("img",{src:"http://localhost:3065/".concat(n),style:{width:"200px"},alt:n}),(0,h.jsx)("div",{children:(0,h.jsx)(d.Z,{onClick:j(t),children:"\uc81c\uac70"})})]},n)}))})]})},y=e(9160),g=!0,x=function(){var n=(0,i.I0)(),t=(0,i.v9)((function(n){return n.post})),e=t.mainPosts,a=t.hasMorePosts,u=t.loadPostsLoading,c=t.retweetError,l=(0,i.v9)((function(n){return n.user})).me;return(0,r.useEffect)((function(){c&&alert(c)}),[c]),(0,r.useEffect)((function(){var t=function(){if(window.scrollY+document.documentElement.clientHeight>document.documentElement.scrollHeight-300&&a&&!u){var t,r=null===(t=e[e.length-1])||void 0===t?void 0:t.id;n({type:p.aO,lastId:r})}};return window.addEventListener("scroll",t),function(){window.removeEventListener("scroll",t)}}),[e.length,a,u]),(0,h.jsxs)(o.Z,{children:[l&&(0,h.jsx)(v,{}),e.map((function(n){return(0,h.jsx)(y.Z,{post:n},n.id)}))]})}},5557:function(n,t,e){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return e(4377)}])}},function(n){n.O(0,[885,340,936,695,991,774,888,179],(function(){return t=5557,n(n.s=t);var t}));var t=n.O();_N_E=t}]);