export default () => ({
  storage: {
    root: process.env.STORAGE_ROOT ?? './storage',
    templates: process.env.TEMPLATES_DIR ?? './storage/templates',
    uploads: process.env.UPLOADS_DIR ?? './storage/uploads',
    generated: process.env.GENERATED_DIR ?? './storage/generated',
  },
});
