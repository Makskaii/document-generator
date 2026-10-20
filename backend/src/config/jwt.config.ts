export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me',
  },
});
