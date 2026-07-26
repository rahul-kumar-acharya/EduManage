export const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  
  const hostname = window.location.hostname;
  let domain = "";
  if (hostname.includes("localhost")) {
    domain = "; domain=.localhost";
  } else if (hostname === "127.0.0.1") {
    domain = ""; // 127.0.0.1 does not support wildcard domains
  } else {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      domain = "; domain=." + parts.slice(-2).join('.');
    }
  }
  
  document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/" + domain;
};

export const getCookie = (name) => {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

export const eraseCookie = (name) => {
  const hostname = window.location.hostname;
  let domain = "";
  if (hostname.includes("localhost")) {
    domain = "; domain=.localhost";
  } else if (hostname === "127.0.0.1") {
    domain = "";
  } else {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      domain = "; domain=." + parts.slice(-2).join('.');
    }
  }
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;' + domain;
};
