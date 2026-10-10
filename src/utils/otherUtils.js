// check 1 biến có phải object hay ko
export function checkIsObject(obj) {
    if (obj && typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
        return true;
    }

    return false;
}


// check 1 biến có phải là 1 javascript object thông thường hay ko
export function isPlainObject(obj) {
    if (obj === null || typeof obj !== "object") {
        return false;
    }

    const proto = Object.getPrototypeOf(obj);

    return proto === Object.prototype || proto === null;
}