import {jwtDecode} from "jwt-decode";

export const isTokenExpired = (token) => {
    if(!token) {return true}

    try{
        const { exp } = jwtDecode(token);
        console.log(exp)
        if(!exp) {
            return true;
        }
        return Date.now() >= exp * 1000;
    } catch (error) {
        return true;
    }
}

export const startTokenTimer = (token, logoutCallback) => {
    try {
        const {exp} = jwtDecode(token);
        const expirationTime = exp * 1000 - Date.now();

        if(expirationTime > 0) {
            setTimeout(() => {
                logoutCallback()
            }, expirationTime);
        } else {
            logoutCallback();
        }
    } catch (error) {
        logoutCallback();
    }
}

export const isValidDate = (value) => {
    if (!value || typeof value !== "string") return false;

    const parts = value.split("-");
    if (parts.length !== 3) return false;

    const [yearStr, monthStr, dayStr] = parts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (!year || month < 1 || month > 12 || day < 1) return false;

    const daysInMonth = [
        31,
        (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ];

    return day <= daysInMonth[month - 1];
}
