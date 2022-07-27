"use strict";
var electron = require("electron");
var path = require("path");
function domReady(condition = ["complete", "interactive"]) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}
const safeDOM = {
  append(parent, child) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  }
};
function useLoading() {
  const className = "loaders-css__square-spin";
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");
  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;
  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    }
  };
}
const VALID_CHANNELS = ["app:watch-change", "app:error"];
electron.contextBridge.exposeInMainWorld("electron", {
  os: process.platform,
  cwd: process.cwd(),
  join: (...paths) => path.join(...paths),
  on: (channel, func) => {
    if (!VALID_CHANNELS.includes(channel)) {
      throw new Error(`\`${channel}\` is not valid channel.`);
    }
    electron.ipcRenderer.on(channel, (_event, ...args) => func(...args));
  },
  git: {
    branch: {
      all: () => electron.ipcRenderer.sendSync("app:git:branch-all"),
      current: () => electron.ipcRenderer.sendSync("app:git:branch-current"),
      change: (branch) => electron.ipcRenderer.sendSync("app:git:branch-change", branch),
      create: (branch) => electron.ipcRenderer.sendSync("app:git:branch-create", branch)
    },
    changes: {
      get: () => electron.ipcRenderer.sendSync("app:git:changes"),
      add: (files) => electron.ipcRenderer.sendSync("app:git:add", files),
      addAll: () => electron.ipcRenderer.sendSync("app:git:addAll"),
      remove: (files) => electron.ipcRenderer.sendSync("app:git:remove", files),
      removeAll: () => electron.ipcRenderer.sendSync("app:git:removeAll"),
      push: () => electron.ipcRenderer.sendSync("app:git:push"),
      pull: () => electron.ipcRenderer.sendSync("app:git:pull"),
      fetch: (all = false) => electron.ipcRenderer.sendSync("app:git:fetch", all)
    },
    commits: {
      get: () => electron.ipcRenderer.sendSync("app:git:commits"),
      create: (summary, description) => electron.ipcRenderer.send("app:git:commit", summary, description)
    },
    status: (short = false) => electron.ipcRenderer.sendSync("app:git:status", short),
    repos: {
      open: (path2) => electron.ipcRenderer.sendSync("app:git:open", path2),
      clone: (url, path2) => electron.ipcRenderer.sendSync("app:git:clone", url, path2),
      all: () => electron.ipcRenderer.sendSync("app:allRepos"),
      defaultRepositoryPath: () => electron.ipcRenderer.sendSync("app:repoDefaultPath"),
      setDefaultRepositoryPath: () => electron.ipcRenderer.sendSync("app:setRepoDefaultPath"),
      watch: (path2) => electron.ipcRenderer.sendSync("app:watch", path2)
    },
    diff: (file) => electron.ipcRenderer.sendSync("app:git:diff", file)
  },
  getFileContent: (path2) => electron.ipcRenderer.sendSync("app:getFileContent", path2)
});
const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);
window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};
setTimeout(removeLoading, 4999);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2VsZWN0cm9uL3ByZWxvYWQvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRlNXYXRjaGVyIH0gZnJvbSBcImNob2tpZGFyXCI7XG5pbXBvcnQgeyBjb250ZXh0QnJpZGdlLCBpcGNSZW5kZXJlciB9IGZyb20gXCJlbGVjdHJvblwiO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBJQnJhbmNoLCBJQ2hhbmdlLCBJQ29tbWl0LCBJUmVwb3NpdG9yeSB9IGZyb20gXCIuLi8uLi90eXBlcy9tb2RlbHNcIjtcblxuZnVuY3Rpb24gZG9tUmVhZHkoXG4gIGNvbmRpdGlvbjogRG9jdW1lbnRSZWFkeVN0YXRlW10gPSBbXCJjb21wbGV0ZVwiLCBcImludGVyYWN0aXZlXCJdXG4pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgaWYgKGNvbmRpdGlvbi5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSkge1xuICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInJlYWR5c3RhdGVjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoY29uZGl0aW9uLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpKSB7XG4gICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuY29uc3Qgc2FmZURPTSA9IHtcbiAgYXBwZW5kKHBhcmVudDogSFRNTEVsZW1lbnQsIGNoaWxkOiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghQXJyYXkuZnJvbShwYXJlbnQuY2hpbGRyZW4pLmZpbmQoKGUpID0+IGUgPT09IGNoaWxkKSkge1xuICAgICAgcmV0dXJuIHBhcmVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgfVxuICB9LFxuICByZW1vdmUocGFyZW50OiBIVE1MRWxlbWVudCwgY2hpbGQ6IEhUTUxFbGVtZW50KSB7XG4gICAgaWYgKEFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKS5maW5kKChlKSA9PiBlID09PSBjaGlsZCkpIHtcbiAgICAgIHJldHVybiBwYXJlbnQucmVtb3ZlQ2hpbGQoY2hpbGQpO1xuICAgIH1cbiAgfSxcbn07XG5cbi8qKlxuICogaHR0cHM6Ly90b2JpYXNhaGxpbi5jb20vc3BpbmtpdFxuICogaHR0cHM6Ly9jb25ub3JhdGhlcnRvbi5jb20vbG9hZGVyc1xuICogaHR0cHM6Ly9wcm9qZWN0cy5sdWtlaGFhcy5tZS9jc3MtbG9hZGVyc1xuICogaHR0cHM6Ly9tYXRlamt1c3RlYy5naXRodWIuaW8vU3BpblRoYXRTaGl0XG4gKi9cbmZ1bmN0aW9uIHVzZUxvYWRpbmcoKSB7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IFwibG9hZGVycy1jc3NfX3NxdWFyZS1zcGluXCI7XG4gIGNvbnN0IHN0eWxlQ29udGVudCA9IGBcbkBrZXlmcmFtZXMgc3F1YXJlLXNwaW4ge1xuICAyNSUgeyB0cmFuc2Zvcm06IHBlcnNwZWN0aXZlKDEwMHB4KSByb3RhdGVYKDE4MGRlZykgcm90YXRlWSgwKTsgfVxuICA1MCUgeyB0cmFuc2Zvcm06IHBlcnNwZWN0aXZlKDEwMHB4KSByb3RhdGVYKDE4MGRlZykgcm90YXRlWSgxODBkZWcpOyB9XG4gIDc1JSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMCkgcm90YXRlWSgxODBkZWcpOyB9XG4gIDEwMCUgeyB0cmFuc2Zvcm06IHBlcnNwZWN0aXZlKDEwMHB4KSByb3RhdGVYKDApIHJvdGF0ZVkoMCk7IH1cbn1cbi4ke2NsYXNzTmFtZX0gPiBkaXYge1xuICBhbmltYXRpb24tZmlsbC1tb2RlOiBib3RoO1xuICB3aWR0aDogNTBweDtcbiAgaGVpZ2h0OiA1MHB4O1xuICBiYWNrZ3JvdW5kOiAjZmZmO1xuICBhbmltYXRpb246IHNxdWFyZS1zcGluIDNzIDBzIGN1YmljLWJlemllcigwLjA5LCAwLjU3LCAwLjQ5LCAwLjkpIGluZmluaXRlO1xufVxuLmFwcC1sb2FkaW5nLXdyYXAge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgd2lkdGg6IDEwMHZ3O1xuICBoZWlnaHQ6IDEwMHZoO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYmFja2dyb3VuZDogIzI4MmMzNDtcbiAgei1pbmRleDogOTtcbn1cbiAgICBgO1xuICBjb25zdCBvU3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIGNvbnN0IG9EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG4gIG9TdHlsZS5pZCA9IFwiYXBwLWxvYWRpbmctc3R5bGVcIjtcbiAgb1N0eWxlLmlubmVySFRNTCA9IHN0eWxlQ29udGVudDtcbiAgb0Rpdi5jbGFzc05hbWUgPSBcImFwcC1sb2FkaW5nLXdyYXBcIjtcbiAgb0Rpdi5pbm5lckhUTUwgPSBgPGRpdiBjbGFzcz1cIiR7Y2xhc3NOYW1lfVwiPjxkaXY+PC9kaXY+PC9kaXY+YDtcblxuICByZXR1cm4ge1xuICAgIGFwcGVuZExvYWRpbmcoKSB7XG4gICAgICBzYWZlRE9NLmFwcGVuZChkb2N1bWVudC5oZWFkLCBvU3R5bGUpO1xuICAgICAgc2FmZURPTS5hcHBlbmQoZG9jdW1lbnQuYm9keSwgb0Rpdik7XG4gICAgfSxcbiAgICByZW1vdmVMb2FkaW5nKCkge1xuICAgICAgc2FmZURPTS5yZW1vdmUoZG9jdW1lbnQuaGVhZCwgb1N0eWxlKTtcbiAgICAgIHNhZmVET00ucmVtb3ZlKGRvY3VtZW50LmJvZHksIG9EaXYpO1xuICAgIH0sXG4gIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgVkFMSURfQ0hBTk5FTFMgPSBbXCJhcHA6d2F0Y2gtY2hhbmdlXCIsIFwiYXBwOmVycm9yXCJdO1xuXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKFwiZWxlY3Ryb25cIiwge1xuICBvczogcHJvY2Vzcy5wbGF0Zm9ybSxcbiAgY3dkOiBwcm9jZXNzLmN3ZCgpLFxuICBqb2luOiAoLi4ucGF0aHM6IHN0cmluZ1tdKSA9PiBqb2luKC4uLnBhdGhzKSxcbiAgb246IChjaGFubmVsOiBzdHJpbmcsIGZ1bmM6ICguLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQpID0+IHtcbiAgICBpZiAoIVZBTElEX0NIQU5ORUxTLmluY2x1ZGVzKGNoYW5uZWwpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYCR7Y2hhbm5lbH1cXGAgaXMgbm90IHZhbGlkIGNoYW5uZWwuYCk7XG4gICAgfVxuXG4gICAgaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgKF9ldmVudCwgLi4uYXJncykgPT4gZnVuYyguLi5hcmdzKSk7XG4gIH0sXG4gIGdpdDoge1xuICAgIGJyYW5jaDoge1xuICAgICAgYWxsOiAoKTogSUJyYW5jaFtdID0+IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmdpdDpicmFuY2gtYWxsXCIpLFxuICAgICAgY3VycmVudDogKCk6IHN0cmluZyA9PiBpcGNSZW5kZXJlci5zZW5kU3luYyhcImFwcDpnaXQ6YnJhbmNoLWN1cnJlbnRcIiksXG4gICAgICBjaGFuZ2U6IChicmFuY2g6IHN0cmluZyk6IHZvaWQgPT5cbiAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6Z2l0OmJyYW5jaC1jaGFuZ2VcIiwgYnJhbmNoKSxcbiAgICAgIGNyZWF0ZTogKGJyYW5jaDogc3RyaW5nKTogdm9pZCA9PlxuICAgICAgICBpcGNSZW5kZXJlci5zZW5kU3luYyhcImFwcDpnaXQ6YnJhbmNoLWNyZWF0ZVwiLCBicmFuY2gpLFxuICAgIH0sXG4gICAgY2hhbmdlczoge1xuICAgICAgZ2V0OiAoKTogSUNoYW5nZVtdID0+IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmdpdDpjaGFuZ2VzXCIpLFxuICAgICAgYWRkOiAoZmlsZXM6IHN0cmluZ1tdKTogdm9pZCA9PlxuICAgICAgICBpcGNSZW5kZXJlci5zZW5kU3luYyhcImFwcDpnaXQ6YWRkXCIsIGZpbGVzKSxcbiAgICAgIGFkZEFsbDogKCk6IHZvaWQgPT4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6Z2l0OmFkZEFsbFwiKSxcbiAgICAgIHJlbW92ZTogKGZpbGVzOiBzdHJpbmdbXSk6IHZvaWQgPT5cbiAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6Z2l0OnJlbW92ZVwiLCBmaWxlcyksXG4gICAgICByZW1vdmVBbGw6ICgpOiB2b2lkID0+IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmdpdDpyZW1vdmVBbGxcIiksXG4gICAgICBwdXNoOiAoKTogdm9pZCA9PiBpcGNSZW5kZXJlci5zZW5kU3luYyhcImFwcDpnaXQ6cHVzaFwiKSxcbiAgICAgIHB1bGw6ICgpOiB2b2lkID0+IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmdpdDpwdWxsXCIpLFxuICAgICAgZmV0Y2g6IChhbGwgPSBmYWxzZSk6IHZvaWQgPT4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6Z2l0OmZldGNoXCIsIGFsbCksXG4gICAgfSxcbiAgICBjb21taXRzOiB7XG4gICAgICBnZXQ6ICgpOiBJQ29tbWl0W10gPT4gaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6Z2l0OmNvbW1pdHNcIiksXG4gICAgICBjcmVhdGU6IChzdW1tYXJ5OiBzdHJpbmcsIGRlc2NyaXB0aW9uPzogc3RyaW5nKTogdm9pZCA9PlxuICAgICAgICBpcGNSZW5kZXJlci5zZW5kKFwiYXBwOmdpdDpjb21taXRcIiwgc3VtbWFyeSwgZGVzY3JpcHRpb24pLFxuICAgIH0sXG4gICAgc3RhdHVzOiAoc2hvcnQgPSBmYWxzZSk6IHN0cmluZyA9PlxuICAgICAgaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6Z2l0OnN0YXR1c1wiLCBzaG9ydCksXG4gICAgcmVwb3M6IHtcbiAgICAgIG9wZW46IChwYXRoOiBzdHJpbmcpOiB2b2lkID0+IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmdpdDpvcGVuXCIsIHBhdGgpLFxuICAgICAgY2xvbmU6ICh1cmw6IHN0cmluZywgcGF0aD86IHN0cmluZyk6IHZvaWQgPT5cbiAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6Z2l0OmNsb25lXCIsIHVybCwgcGF0aCksXG4gICAgICBhbGw6ICgpOiBJUmVwb3NpdG9yeVtdID0+IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmFsbFJlcG9zXCIpLFxuICAgICAgZGVmYXVsdFJlcG9zaXRvcnlQYXRoOiAoKTogc3RyaW5nID0+XG4gICAgICAgIGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOnJlcG9EZWZhdWx0UGF0aFwiKSxcbiAgICAgIHNldERlZmF1bHRSZXBvc2l0b3J5UGF0aDogKCk6IHZvaWQgPT5cbiAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6c2V0UmVwb0RlZmF1bHRQYXRoXCIpLFxuICAgICAgd2F0Y2g6IChwYXRoOiBzdHJpbmcpOiBGU1dhdGNoZXIgPT5cbiAgICAgICAgaXBjUmVuZGVyZXIuc2VuZFN5bmMoXCJhcHA6d2F0Y2hcIiwgcGF0aCksXG4gICAgfSxcbiAgICBkaWZmOiAoZmlsZTogc3RyaW5nKTogc3RyaW5nID0+IGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmdpdDpkaWZmXCIsIGZpbGUpLFxuICB9LFxuICBnZXRGaWxlQ29udGVudDogKHBhdGg6IHN0cmluZyk6IHN0cmluZyA9PlxuICAgIGlwY1JlbmRlcmVyLnNlbmRTeW5jKFwiYXBwOmdldEZpbGVDb250ZW50XCIsIHBhdGgpLFxufSk7XG5cbmNvbnN0IHsgYXBwZW5kTG9hZGluZywgcmVtb3ZlTG9hZGluZyB9ID0gdXNlTG9hZGluZygpO1xuZG9tUmVhZHkoKS50aGVuKGFwcGVuZExvYWRpbmcpO1xuXG53aW5kb3cub25tZXNzYWdlID0gKGV2KSA9PiB7XG4gIGV2LmRhdGEucGF5bG9hZCA9PT0gXCJyZW1vdmVMb2FkaW5nXCIgJiYgcmVtb3ZlTG9hZGluZygpO1xufTtcblxuc2V0VGltZW91dChyZW1vdmVMb2FkaW5nLCA0OTk5KTtcbiJdLCJuYW1lcyI6WyJjb250ZXh0QnJpZGdlIiwiam9pbiIsImlwY1JlbmRlcmVyIl0sIm1hcHBpbmdzIjoiOzs7QUFLQSxrQkFDRSxZQUFrQyxDQUFDLFlBQVksYUFBYSxHQUM1RDtBQUNPLFNBQUEsSUFBSSxRQUFRLENBQUMsWUFBWTtBQUM5QixRQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxjQUFRLElBQUk7QUFBQSxJQUFBLE9BQ1A7QUFDSSxlQUFBLGlCQUFpQixvQkFBb0IsTUFBTTtBQUNsRCxZQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxrQkFBUSxJQUFJO0FBQUEsUUFDZDtBQUFBLE1BQUEsQ0FDRDtBQUFBLElBQ0g7QUFBQSxFQUFBLENBQ0Q7QUFDSDtBQUVBLE1BQU0sVUFBVTtBQUFBLEVBQ2QsT0FBTyxRQUFxQixPQUFvQjtBQUMxQyxRQUFBLENBQUMsTUFBTSxLQUFLLE9BQU8sUUFBUSxFQUFFLEtBQUssQ0FBQyxNQUFNLE1BQU0sS0FBSyxHQUFHO0FBQ2xELGFBQUEsT0FBTyxZQUFZLEtBQUs7QUFBQSxJQUNqQztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU8sUUFBcUIsT0FBb0I7QUFDMUMsUUFBQSxNQUFNLEtBQUssT0FBTyxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sTUFBTSxLQUFLLEdBQUc7QUFDakQsYUFBQSxPQUFPLFlBQVksS0FBSztBQUFBLElBQ2pDO0FBQUEsRUFDRjtBQUNGO0FBUUEsc0JBQXNCO0FBQ3BCLFFBQU0sWUFBWTtBQUNsQixRQUFNLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQU9wQjtBQUFBO0FB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
