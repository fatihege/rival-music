export const checkUserName = name => typeof name === 'string' && name.trim().length >= 4
export const checkPassword = password => typeof password === 'string' && password.length >= 6