function getOneAction(prismaInstance) {
  return async (modelName, queryParams) => prismaInstance[modelName].findUnique(queryParams);
}

module.exports = getOneAction;
