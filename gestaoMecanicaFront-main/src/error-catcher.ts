window.addEventListener("error", (e) => {
  document.body.innerHTML = "<div style='color:red;font-size:24px;background:white;z-index:9999;position:fixed;top:0;left:0;width:100%;height:100%;padding:20px;'>" + e.error?.stack + "</div>";
});
window.addEventListener("unhandledrejection", (e) => {
  document.body.innerHTML = "<div style='color:red;font-size:24px;background:white;z-index:9999;position:fixed;top:0;left:0;width:100%;height:100%;padding:20px;'>" + e.reason?.stack + "</div>";
});
