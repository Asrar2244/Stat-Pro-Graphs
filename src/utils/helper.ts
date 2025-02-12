export const generateKey = (list: Map<string, boolean>) => {
    let key = "";
    Array.from(list.entries()).forEach(([k, v]) => {
        key += `${k}-${v}`
    })
    return key
}