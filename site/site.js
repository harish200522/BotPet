/* ------------------------------------------------------------------
   site.js — BotPet Landing Page Logic
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  /* ---------------- the live pet stage ---------------- */
  if (window.CatRig && window.Cat && window.gsap) {
    if (window.MorphSVGPlugin) { gsap.registerPlugin(MorphSVGPlugin); }

    var mount = document.getElementById("sceneCat");
    if (mount) {
      CatRig.mount(mount, { offsetX: 50, offsetY: 12 });
      Cat.init({ state: "sit", roam: true });

      var row = document.getElementById("poseRow");
      if (row) {
        row.addEventListener("click", function (e) {
          var b = e.target.closest("button");
          if (!b) { return; }

          Array.prototype.forEach.call(row.children, function (n) { n.classList.remove("on"); });

          if (b.dataset.act === "swipe") {
            b.classList.add("on");
            Cat.swipe();
            return;
          }
          if (b.dataset.act === "levelup") {
            b.classList.add("on");
            Cat.gainXp(25);
            gsap.delayedCall(0.45, function () { Cat.levelUp(5); });
            return;
          }
          b.classList.add("on");
          Cat.setState(b.dataset.state);
        });
      }
    }
  }
})();
