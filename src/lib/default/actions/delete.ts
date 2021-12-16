function deleteAction(prismaInstance) {
  return async (modelName, id) => prismaInstance[modelName].delete({
    where: {
      id,
    },
  });
}

module.exports = deleteAction;
