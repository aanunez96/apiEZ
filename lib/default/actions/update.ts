export default function updateAction(prismaInstance) {
  return async (modelName, id, data) => prismaInstance[modelName].update({
    where: { id },
    data,
  });
}

module.exports = updateAction;
