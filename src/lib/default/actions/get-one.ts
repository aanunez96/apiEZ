function getOneAction(prismaInstance) {
  return async (modelName, id) => prismaInstance[modelName].findUnique({
    where: {
      id: parseInt(id, 10),
    },
  });
}

module.exports = getOneAction;
