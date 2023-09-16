export interface Configuration {
  Entity: {
    Attributes: boolean
    Colors: {
      stereotypes_1: string,
      stereotypes_2: string,
      stereotypes_3: string
    }
  },
  Relation: {
    Cardinality: boolean,
    Associations: boolean,
    AssociationsEndNames: boolean
  },
  Datatype: boolean,
  Enumeration: boolean
};