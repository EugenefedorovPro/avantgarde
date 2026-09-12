export function triggerManage(dir: "prev" | "next") {
  sessionStorage.setItem("manage_dir", dir);
  window.dispatchEvent(new Event("manage_tick"));
}
