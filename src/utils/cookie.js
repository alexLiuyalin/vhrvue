// 设置 cid
export function SetCIDFromCookies(cid) {
  sessionStorage.setItem('cid', cid);
};
// 获取 cid
export function GetCIDFromCookies(cid) {
  cid = sessionStorage.getItem('cid');
};
// 清除 cid  登录失败用
export function ClearCID() {
  sessionStorage.removeItem('cid');
}

// 设置 account
export function SetAccountFromCookies(username, password) {
  sessionStorage.setItem('username', username);
  sessionStorage.setItem('password', password);
};
// 获取 account  记住密码
export function GetAccountFromCookies(username, password) {
  username = sessionStorage.getItem('username');
  password = sessionStorage.getItem('password');
};

// 清除缓存 退出用
export function ClearCookie() {
  sessionStorage.clear();
}

