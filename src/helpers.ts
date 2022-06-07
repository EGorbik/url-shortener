export const generateRandomString: () => string = (length = 7) => {
   return Math.random().toString(20).substr(2, length)
}