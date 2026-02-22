export function triggerManage(dir: "prev" | "next") {
  sessionStorage.setItem("manage_dir", dir);
  sessionStorage.setItem("manage_tick", String(Date.now()));
  window.dispatchEvent(new Event("manage_tick"));
}
