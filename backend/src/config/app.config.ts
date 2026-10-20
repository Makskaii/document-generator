export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3001),
    env: process.env.NODE_ENV ?? 'development',
  },
});
