export default function population(allFields: any[]) {
  return {
    include: allFields.reduce((relation, field) => {
      if (field.relationName) {
        return {
          ...relation,
          [field.name]: true,
        };
      }
      return {
        ...relation,
      };
    }, {} as any),
  };
}

module.exports = population;
