export default function readAction(prismaInstance) {
  return async (modelName, queryParams) => prismaInstance[modelName].findMany(queryParams);
}

module.exports = readAction;
