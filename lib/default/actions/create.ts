function createAction(prismaInstance) {
  return async (modelName, data) => prismaInstance[modelName].create({
    data,
  });
}

module.exports = createAction;
