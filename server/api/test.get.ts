export default defineEventHandler(() => {
  return {
    code: 200,
    message: 'Success',
    data: {
      name: 'Test User',
      age: 18
    }
  }
})
